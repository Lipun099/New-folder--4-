import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, ShoppingBag, Clock, IndianRupee, LogOut, RefreshCw } from 'lucide-react'
import { useSocket } from '../context/SocketContext'
import StatusBadge from '../components/StatusBadge'
import toast from 'react-hot-toast'

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className={`rounded-2xl p-4 ${bg}`}>
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
        <Icon size={20} className="text-white" />
      </div>
      <p className="text-2xl font-black text-cafe-dark">{value}</p>
      <p className="text-xs text-cafe-gray font-medium mt-0.5">{label}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { joinAdminRoom, onEvent } = useSocket()

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        axios.get('/api/stats'),
        axios.get('/api/orders?status=all'),
      ])
      setStats(statsRes.data)
      setRecentOrders(ordersRes.data.slice(0, 5))
    } catch {
      toast.error('Could not load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    joinAdminRoom()
  }, [fetchData, joinAdminRoom])

  useEffect(() => {
    const off1 = onEvent('new_order', (order) => {
      setRecentOrders(prev => [order, ...prev].slice(0, 5))
      setStats(prev => prev ? {
        ...prev,
        liveOrders: prev.liveOrders + 1,
        todayOrders: prev.todayOrders + 1,
        todayRevenue: prev.todayRevenue + order.totalAmount,
      } : prev)
      toast.success(`New order from ${order.customerName}! 🆕`)
    })

    const off2 = onEvent('order_updated', () => {
      fetchData()
    })

    return () => { off1(); off2() }
  }, [onEvent, fetchData])

  const handleLogout = () => {
    localStorage.removeItem('nush_admin')
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-cream pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-cafe to-yellow-dark px-4 pt-12 pb-8 text-white">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-sm opacity-80">Good morning ☀️</p>
            <h1 className="text-2xl font-black">Admin Panel</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchData}
              className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center active:scale-90 transition-transform"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={handleLogout}
              className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center active:scale-90 transition-transform"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
        <p className="text-xs opacity-70">☕ Nush Café Dashboard</p>
      </div>

      {/* Live dot */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl px-4 py-2.5 shadow-card flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-semibold text-cafe-dark">Live Updates Active</span>
          {stats && (
            <span className="ml-auto text-xs text-orange-cafe font-bold">
              {stats.liveOrders} active orders
            </span>
          )}
        </div>
      </div>

      <div className="px-4 mt-4">
        {/* Stats grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl p-4 bg-white animate-pulse h-28" />
            ))}
          </div>
        ) : stats && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <StatCard
              icon={ShoppingBag}
              label="Today's Orders"
              value={stats.todayOrders}
              color="bg-orange-cafe"
              bg="bg-orange-50"
            />
            <StatCard
              icon={IndianRupee}
              label="Today's Revenue"
              value={`₹${stats.todayRevenue}`}
              color="bg-green-500"
              bg="bg-green-50"
            />
            <StatCard
              icon={Clock}
              label="Live Orders"
              value={stats.liveOrders}
              color="bg-blue-500"
              bg="bg-blue-50"
            />
            <StatCard
              icon={TrendingUp}
              label="Total Orders"
              value={stats.totalOrders}
              color="bg-purple-500"
              bg="bg-purple-50"
            />
          </div>
        )}

        {/* Recent orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-cafe-dark">Recent Orders</h2>
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-xs text-orange-cafe font-semibold"
            >
              View all →
            </button>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl">📋</span>
              <p className="text-cafe-gray text-sm mt-2">No orders yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {recentOrders.map(order => (
                <div key={order._id} className="flex items-center justify-between py-2.5 border-b border-yellow-cafe/10 last:border-0">
                  <div>
                    <p className="font-semibold text-sm text-cafe-dark">
                      #{order.tokenNumber} · {order.customerName}
                    </p>
                    <p className="text-xs text-cafe-gray">{order.tableNumber} · ₹{order.totalAmount}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="card flex flex-col items-center gap-2 py-4 active:scale-95 transition-all"
          >
            <span className="text-3xl">📋</span>
            <span className="text-sm font-semibold text-cafe-dark">Manage Orders</span>
          </button>
          <button
            onClick={() => navigate('/admin/scanner')}
            className="card flex flex-col items-center gap-2 py-4 active:scale-95 transition-all"
          >
            <span className="text-3xl">📷</span>
            <span className="text-sm font-semibold text-cafe-dark">Scan QR</span>
          </button>
        </div>
      </div>
    </div>
  )
}
