import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { RefreshCw, ChevronDown, ShoppingBag, Utensils } from 'lucide-react'
import { useSocket } from '../context/SocketContext'
import StatusBadge from '../components/StatusBadge'

const STATUS_TABS = ['all', 'pending', 'preparing', 'ready', 'completed']
const STATUS_NEXT = { pending: 'preparing', preparing: 'ready', ready: 'completed' }
const STATUS_LABEL = { pending: '→ Start Preparing', preparing: '→ Mark Ready', ready: '→ Complete' }

function OrderCard({ order, onStatusUpdate }) {
  const [expanded, setExpanded] = useState(false)
  const [updating, setUpdating] = useState(false)

  const handleUpdate = async () => {
    const next = STATUS_NEXT[order.status]
    if (!next) return
    try {
      setUpdating(true)
      await onStatusUpdate(order._id, next)
    } finally {
      setUpdating(false)
    }
  }

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 60000)
    if (diff < 1) return 'just now'
    if (diff < 60) return `${diff}m ago`
    return `${Math.floor(diff / 60)}h ago`
  }

  return (
    <div className={`card animate-fade-in border-l-4 ${
      order.status === 'pending' ? 'border-yellow-cafe' :
      order.status === 'preparing' ? 'border-orange-cafe' :
      order.status === 'ready' ? 'border-green-500' : 'border-gray-200'
    }`}>
      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-light flex items-center justify-center font-black text-cafe-dark">
            #{order.tokenNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm text-cafe-dark">{order.customerName}</p>
              {order.orderType === 'takeout' ? (
                <span className="flex items-center gap-0.5 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-semibold">
                  <ShoppingBag size={10} /> Takeout
                </span>
              ) : (
                <span className="flex items-center gap-0.5 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">
                  <Utensils size={10} /> Dine In
                </span>
              )}
            </div>
            <p className="text-xs text-cafe-gray">{order.tableNumber} · {timeAgo(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={order.status} />
          <ChevronDown
            size={16}
            className={`text-cafe-gray transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-yellow-cafe/20 animate-fade-in">
          {/* Items */}
          <div className="flex flex-col gap-1.5 mb-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-cafe-dark">{item.name} <span className="text-cafe-gray">×{item.quantity}</span></span>
                <span className="font-medium">₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div className="border-t border-yellow-cafe/10 pt-1.5 flex justify-between font-bold text-sm">
              <span>Total</span>
              <span className="text-orange-cafe">₹{order.totalAmount}</span>
            </div>
          </div>

          {/* Note */}
          {order.note && (
            <div className="bg-yellow-light rounded-xl p-2.5 mb-3">
              <p className="text-xs text-cafe-brown">📝 {order.note}</p>
            </div>
          )}

          {/* Action button */}
          {STATUS_NEXT[order.status] && (
            <button
              onClick={handleUpdate}
              disabled={updating}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-sm"
            >
              {updating ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : STATUS_LABEL[order.status]}
            </button>
          )}

          {order.status === 'completed' && (
            <div className="text-center text-xs text-cafe-gray py-2">
              ✅ Order completed
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function OrderManagement() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [refreshing, setRefreshing] = useState(false)
  const { joinAdminRoom, onEvent } = useSocket()

  const fetchOrders = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      else setRefreshing(true)
      const { data } = await axios.get('/api/orders')
      setOrders(data)
    } catch {
      toast.error('Could not load orders')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
    joinAdminRoom()
  }, [fetchOrders, joinAdminRoom])

  useEffect(() => {
    const off1 = onEvent('new_order', (order) => {
      setOrders(prev => [order, ...prev])
      toast.success(`New order! #${order.tokenNumber} from ${order.customerName}`)
    })

    const off2 = onEvent('order_updated', (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o))
    })

    return () => { off1(); off2() }
  }, [onEvent])

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const { data } = await axios.patch(`/api/order/${orderId}`, { status: newStatus })
      setOrders(prev => prev.map(o => o._id === orderId ? data : o))
      toast.success(`Order marked as ${newStatus}!`)
    } catch {
      toast.error('Could not update status')
    }
  }

  const filtered = activeTab === 'all' ? orders : orders.filter(o => o.status === activeTab)
  const counts = STATUS_TABS.reduce((acc, tab) => {
    acc[tab] = tab === 'all' ? orders.length : orders.filter(o => o.status === tab).length
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-cream pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-cafe to-yellow-dark px-4 pt-12 pb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">Orders</h1>
            <p className="text-sm opacity-80">{orders.length} total today</p>
          </div>
          <button
            onClick={() => fetchOrders(true)}
            className={`w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center ${refreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Status tabs */}
      <div className="px-4 pt-3">
        <div className="scroll-x flex gap-2 mb-4">
          {STATUS_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium border whitespace-nowrap transition-all duration-200
                ${activeTab === tab
                  ? 'bg-orange-cafe text-white border-orange-cafe'
                  : 'bg-white text-cafe-dark border-yellow-cafe/30'
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {counts[tab] > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold
                  ${activeTab === tab ? 'bg-white/20' : 'bg-yellow-cafe/30 text-cafe-dark'}`}>
                  {counts[tab]}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card animate-pulse h-20" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="text-5xl">📋</span>
            <p className="text-cafe-gray">No {activeTab !== 'all' ? activeTab : ''} orders</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(order => (
              <OrderCard key={order._id} order={order} onStatusUpdate={handleStatusUpdate} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
