const express = require('express')
const router = express.Router()
const supabase = require('../supabase')

// Helper: map Supabase row → frontend shape
const toOrder = (row) => row ? { ...row, _id: row.id, tokenNumber: row.token_number, customerName: row.customer_name, tableNumber: row.table_number, orderType: row.order_type, totalAmount: row.total_amount, createdAt: row.created_at, updatedAt: row.updated_at } : null

// POST /api/order — place order
router.post('/order', async (req, res) => {
  try {
    const { customerName, tableNumber, orderType, items, note } = req.body

    if (!customerName || !tableNumber || !items || items.length === 0) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    const { data, error } = await supabase
      .from('orders')
      .insert([{
        customer_name: customerName,
        table_number: tableNumber,
        order_type: orderType || 'dine-in',
        items,
        total_amount: totalAmount,
        note: note || '',
        status: 'pending',
      }])
      .select()
      .single()

    if (error) throw error

    const order = toOrder(data)
    req.io.to('admin').emit('new_order', order)
    res.status(201).json(order)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// GET /api/orders — all orders (admin)
router.get('/orders', async (req, res) => {
  try {
    const { status, date } = req.query
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (date) {
      const start = new Date(date)
      start.setHours(0, 0, 0, 0)
      const end = new Date(date)
      end.setHours(23, 59, 59, 999)
      query = query.gte('created_at', start.toISOString()).lte('created_at', end.toISOString())
    }

    const { data, error } = await query
    if (error) throw error
    res.json(data.map(toOrder))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/order/:id — single order
router.get('/order/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (error) throw error
    if (!data) return res.status(404).json({ message: 'Order not found' })
    res.json(toOrder(data))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/order/token/:token — by token number
router.get('/order/token/:token', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('token_number', Number(req.params.token))
      .single()

    if (error) throw error
    if (!data) return res.status(404).json({ message: 'Order not found' })
    res.json(toOrder(data))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/order/:id — update status
router.patch('/order/:id', async (req, res) => {
  try {
    const { status } = req.body
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error
    if (!data) return res.status(404).json({ message: 'Order not found' })

    const order = toOrder(data)
    req.io.to(`order_${order._id}`).emit('order_updated', order)
    req.io.to('admin').emit('order_updated', order)
    res.json(order)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// GET /api/stats — dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [allRes, todayRes, liveRes] = await Promise.all([
      supabase.from('orders').select('total_amount'),
      supabase.from('orders').select('total_amount').gte('created_at', today.toISOString()).lt('created_at', tomorrow.toISOString()),
      supabase.from('orders').select('id').in('status', ['pending', 'preparing']),
    ])

    if (allRes.error) throw allRes.error

    const totalRevenue = (allRes.data || []).reduce((s, o) => s + o.total_amount, 0)
    const todayRevenue = (todayRes.data || []).reduce((s, o) => s + o.total_amount, 0)

    res.json({
      totalOrders: allRes.data.length,
      todayOrders: todayRes.data?.length || 0,
      liveOrders: liveRes.data?.length || 0,
      todayRevenue,
      totalRevenue,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
