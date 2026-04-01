const express = require('express')
const router = express.Router()
const supabase = require('../supabase')

// Helper: map Supabase row → frontend shape (_id instead of id)
const toItem = (row) => row ? { ...row, _id: row.id } : null

// GET /api/menu
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('category')
      .order('name')

    if (error) throw error
    res.json(data.map(toItem))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/menu
router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .insert([req.body])
      .select()
      .single()

    if (error) throw error
    res.status(201).json(toItem(data))
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// PUT /api/menu/:id
router.put('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error
    if (!data) return res.status(404).json({ message: 'Item not found' })
    res.json(toItem(data))
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// DELETE /api/menu/:id
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', req.params.id)

    if (error) throw error
    res.json({ message: 'Deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
