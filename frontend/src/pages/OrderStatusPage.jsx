import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import QRCode from 'qrcode.react'
import { useSocket } from '../context/SocketContext'
import { ArrowLeft, Download, Share2, CheckCircle, Clock, ChefHat, Bell } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUSES = [
  { key: 'pending', label: 'Order Placed', icon: Clock, desc: 'Your order has been received' },
  { key: 'preparing', label: 'Being Prepared', icon: ChefHat, desc: 'Chef is cooking your order' },
  { key: 'ready', label: 'Ready!', icon: Bell, desc: 'Come collect your order 🎉' },
  { key: 'completed', label: 'Completed', icon: CheckCircle, desc: 'Thank you for visiting!' },
]

function StatusTimeline({ status }) {
  const currentIdx = STATUSES.findIndex(s => s.key === status)

  return (
    <div className="flex flex-col gap-0">
      {STATUSES.slice(0, 3).map((s, idx) => {
        const done = idx < currentIdx
        const active = idx === currentIdx
        const Icon = s.icon

        return (
          <div key={s.key} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500
                ${active ? 'bg-orange-cafe text-white scale-110 shadow-md shadow-orange-cafe/30' :
                  done ? 'bg-green-500 text-white' : 'bg-gray-100 text-cafe-gray'}`}>
                {done ? <CheckCircle size={20} /> : <Icon size={20} />}
              </div>
              {idx < 2 && (
                <div className={`w-0.5 h-8 transition-all duration-700
                  ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
            <div className="pt-2 pb-6">
              <p className={`font-semibold text-sm ${active ? 'text-orange-cafe' : done ? 'text-green-600' : 'text-cafe-gray'}`}>
                {s.label}
                {active && <span className="ml-2 animate-pulse-soft">●</span>}
              </p>
              {active && (
                <p className="text-xs text-cafe-gray mt-0.5">{s.desc}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function OrderStatusPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { joinOrderRoom, onEvent } = useSocket()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const invoiceRef = useRef(null)

  const fetchOrder = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/order/${orderId}`)
      setOrder(data)
    } catch {
      toast.error('Order not found')
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  useEffect(() => {
    if (!orderId) return
    joinOrderRoom(orderId)

    const off = onEvent('order_updated', (updatedOrder) => {
      if (updatedOrder._id === orderId) {
        setOrder(updatedOrder)
        if (updatedOrder.status === 'ready') {
          toast.success('🔔 Your order is ready! Come collect it.', { duration: 5000 })
        }
        if (updatedOrder.status === 'preparing') {
          toast('👨‍🍳 Chef is preparing your order!', { duration: 3000 })
        }
      }
    })

    return off
  }, [orderId, joinOrderRoom, onEvent])

  const downloadInvoice = async () => {
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const element = document.getElementById('invoice-content')
      html2pdf().set({
        margin: 0.5,
        filename: `Nush-Cafe-Invoice-${order.tokenNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a6', orientation: 'portrait' },
      }).from(element).save()
    } catch {
      toast.error('Could not generate invoice.')
    }
  }

  const shareWhatsApp = () => {
    if (!order) return
    const itemsText = order.items.map(i => `• ${i.name} x${i.quantity} = ₹${i.price * i.quantity}`).join('\n')
    const msg = `*Nush Café Order Receipt*\n\nToken: #${order.tokenNumber}\nName: ${order.customerName}\nTable: ${order.tableNumber}\n\n${itemsText}\n\n*Total: ₹${order.totalAmount}*\n\nThank you for visiting! ☕`
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-yellow-cafe border-t-orange-cafe rounded-full animate-spin" />
          <p className="text-cafe-gray font-medium">Loading your order...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4 px-6">
        <span className="text-6xl">😕</span>
        <h2 className="text-xl font-bold text-cafe-dark">Order not found</h2>
        <button onClick={() => navigate('/')} className="btn-primary">Go to Menu</button>
      </div>
    )
  }

  const isReady = order.status === 'ready' || order.status === 'completed'

  return (
    <div className="min-h-screen bg-cream pb-8">
      {/* Header */}
      <div className="page-header">
        <button onClick={() => navigate('/')} className="btn-icon">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-cafe-dark text-lg flex-1">Order Status</h1>
        <div className={`text-xs font-semibold px-3 py-1.5 rounded-full
          ${isReady ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}`}>
          {isReady ? '✅ Ready' : '⏳ In Progress'}
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        {/* Token card */}
        <div className={`rounded-3xl p-6 text-center shadow-card-hover transition-colors duration-500
          ${isReady
            ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white'
            : 'bg-gradient-to-br from-orange-cafe to-yellow-cafe text-white'
          }`}>
          <p className="text-sm font-semibold opacity-80 uppercase tracking-widest mb-1">Token Number</p>
          <div className="text-8xl font-black my-3">#{order.tokenNumber}</div>
          <p className="text-sm opacity-80">{order.customerName} • {order.tableNumber}</p>
          {isReady && (
            <div className="mt-3 bg-white/20 rounded-xl py-2 px-4">
              <p className="font-bold text-base">🎉 Your order is ready!</p>
            </div>
          )}
        </div>

        {/* QR Code */}
        <div className="card flex flex-col items-center gap-3 py-5">
          <p className="text-sm font-semibold text-cafe-gray uppercase tracking-wider">Order QR Code</p>
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-yellow-cafe/20">
            <QRCode
              value={`${window.location.origin}/order/${order._id}`}
              size={160}
              fgColor="#2D1B00"
              bgColor="#FFFFFF"
              level="H"
            />
          </div>
          <p className="text-xs text-cafe-gray">Show this to café staff</p>
        </div>

        {/* Status timeline */}
        <div className="card">
          <h3 className="font-bold text-cafe-dark mb-4">Order Progress</h3>
          <StatusTimeline status={order.status} />
        </div>

        {/* Order items */}
        <div className="card">
          <h3 className="font-bold text-cafe-dark mb-3">Items Ordered</h3>
          <div className="flex flex-col gap-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span className="text-cafe-dark">
                  {item.name}
                  <span className="text-cafe-gray ml-1">×{item.quantity}</span>
                </span>
                <span className="font-semibold">₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div className="border-t border-yellow-cafe/20 pt-2 mt-1 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-orange-cafe">₹{order.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Invoice (hidden, for PDF) */}
        <div id="invoice-content" style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <div style={{ fontFamily: 'Inter, sans-serif', padding: '20px', maxWidth: '300px', color: '#2D1B00' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#FF8C42' }}>☕ Nush Café</h1>
              <p style={{ fontSize: '12px', color: '#9E8A78' }}>Fresh brewed, fresh made</p>
            </div>
            <div style={{ borderTop: '1px dashed #FFD54F', borderBottom: '1px dashed #FFD54F', padding: '10px 0', marginBottom: '12px' }}>
              <p style={{ fontSize: '12px' }}><strong>Token:</strong> #{order.tokenNumber}</p>
              <p style={{ fontSize: '12px' }}><strong>Name:</strong> {order.customerName}</p>
              <p style={{ fontSize: '12px' }}><strong>Table:</strong> {order.tableNumber}</p>
              <p style={{ fontSize: '12px' }}><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            </div>
            {order.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span>{item.name} × {item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #FFD54F', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '14px' }}>
              <span>TOTAL</span>
              <span>₹{order.totalAmount}</span>
            </div>
            <p style={{ textAlign: 'center', fontSize: '11px', color: '#9E8A78', marginTop: '16px' }}>
              Thank you for visiting Nush Café! ☕
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={downloadInvoice} className="btn-ghost flex items-center justify-center gap-2 py-3">
            <Download size={18} />
            <span className="text-sm font-semibold">Invoice PDF</span>
          </button>
          <button onClick={shareWhatsApp} className="flex items-center justify-center gap-2 py-3 rounded-2xl
                          bg-green-500 text-white font-semibold text-sm active:scale-95 transition-all">
            <Share2 size={18} />
            WhatsApp
          </button>
        </div>

        <button
          onClick={() => navigate('/')}
          className="btn-yellow w-full flex items-center justify-center gap-2 py-3"
        >
          ☕ Order More
        </button>
      </div>
    </div>
  )
}
