import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, MapPin, FileText, ShoppingBag, Utensils, ChevronRight } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'

const TABLE_OPTIONS = Array.from({ length: 20 }, (_, i) => `Table ${i + 1}`)

export default function CheckoutPage() {
  const { items, totalPrice, totalItems, clearCart } = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', table: '', note: '' })
  const [orderType, setOrderType] = useState('dine-in')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Please enter your name'
    if (orderType === 'dine-in' && !form.table) e.table = 'Please select a table'
    return e
  }

  const handleSubmit = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    try {
      setLoading(true)
      const { data } = await axios.post('/api/order', {
        customerName: form.name.trim(),
        tableNumber: orderType === 'dine-in' ? form.table : 'Takeout',
        orderType,
        note: form.note.trim(),
        items: items.map(i => ({
          menuItem: i.menuItem,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
      })
      clearCart()
      toast.success('Order placed! 🎉')
      navigate(`/order/${data._id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not place order.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) { navigate('/'); return null }

  return (
    <div className="min-h-screen bg-cream pb-10">

      {/* ── Header ── */}
      <div className="sticky top-0 z-40 bg-cream backdrop-blur-md px-4 pt-4 pb-3 flex items-center gap-3 border-b border-cream">
        <button onClick={() => navigate('/cart')} className="btn-icon">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 text-center">
          <h1 className="font-black text-cafe-dark text-base">Nush Café</h1>
          <p className="text-xs text-cafe-gray">
            {orderType === 'dine-in' && form.table ? `${form.table} • ` : ''}
            Artisanal morning in progress
          </p>
        </div>
        <div className="w-9" /> {/* spacer */}
      </div>

      <div className="px-4 pt-4 pb-32 flex flex-col gap-4">

        {/* ── Order Type Toggle ── */}
        <div>
          <h2 className="font-bold text-cafe-dark text-sm mb-2.5">How would you like your order?</h2>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => { setOrderType('dine-in'); setErrors(e => ({ ...e, table: '' })) }}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-all duration-200 active:scale-95
                ${orderType === 'dine-in'
                  ? 'border-orange-cafe bg-orange-cafe/10'
                  : 'border-cream bg-white'}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${orderType === 'dine-in' ? 'bg-orange-cafe text-white' : 'bg-cream text-cafe-gray'}`}>
                <Utensils size={18} />
              </div>
              <div className="text-left">
                <p className={`font-bold text-sm ${orderType === 'dine-in' ? 'text-orange-cafe' : 'text-cafe-dark'}`}>Dine In</p>
                <p className="text-xs text-cafe-gray">Sit & enjoy</p>
              </div>
            </button>

            <button
              onClick={() => { setOrderType('takeout'); setForm(f => ({ ...f, table: '' })); setErrors(e => ({ ...e, table: '' })) }}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-all duration-200 active:scale-95
                ${orderType === 'takeout'
                  ? 'border-orange-cafe bg-orange-cafe/10'
                  : 'border-cream bg-white'}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${orderType === 'takeout' ? 'bg-orange-cafe text-white' : 'bg-cream text-cafe-gray'}`}>
                <ShoppingBag size={18} />
              </div>
              <div className="text-left">
                <p className={`font-bold text-sm ${orderType === 'takeout' ? 'text-orange-cafe' : 'text-cafe-dark'}`}>Takeout</p>
                <p className="text-xs text-cafe-gray">Pick up & go</p>
              </div>
            </button>
          </div>
        </div>

        {/* ── Your Selection ── */}
        <div>
          <h2 className="font-bold text-cafe-dark text-sm mb-2.5">Your Selection</h2>
          <div className="bg-white rounded-2xl shadow-card overflow-hidden divide-y divide-cream">
            {items.map(item => (
              <div key={item.menuItem} className="flex items-center gap-3 p-3">
                {/* Photo */}
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-cream-light">
                  {item.image ? (
                    <>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                      />
                      <div className="hidden w-full h-full items-center justify-center text-xl" style={{display:'none'}}>
                        {item.emoji}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">{item.emoji}</div>
                  )}
                </div>
                {/* Info */}
                <div className="flex-1">
                  <p className="font-semibold text-cafe-dark text-sm">{item.name}</p>
                  <p className="font-black text-orange-cafe text-sm mt-0.5">₹{item.price}</p>
                </div>
                {/* Qty badge */}
                <div className="flex items-center gap-1.5 bg-cream rounded-full px-3 py-1.5">
                  <span className="text-cafe-gray text-xs">−</span>
                  <span className="font-bold text-cafe-dark text-sm">{item.quantity}</span>
                  <span className="text-cafe-gray text-xs">+</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Order Details Form ── */}
        <div className="bg-cream-light rounded-2xl p-4 flex flex-col gap-3.5">
          <h2 className="font-bold text-cafe-dark text-sm">Order Details</h2>

          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-cafe-brown uppercase tracking-wide mb-1.5 block flex items-center gap-1">
              <User size={11} /> Your Name
            </label>
            <input
              type="text"
              placeholder="Who's enjoying today?"
              value={form.name}
              onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: '' })) }}
              className={`input text-sm ${errors.name ? 'ring-2 ring-red-400' : ''}`}
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Table (Dine In only) */}
          {orderType === 'dine-in' && (
            <div>
              <label className="text-xs font-semibold text-cafe-brown uppercase tracking-wide mb-1.5 block flex items-center gap-1">
                <MapPin size={11} /> Table Number
              </label>
              <div className="relative">
                <select
                  value={form.table}
                  onChange={e => { setForm(f => ({ ...f, table: e.target.value })); setErrors(er => ({ ...er, table: '' })) }}
                  className={`input text-sm appearance-none ${errors.table ? 'ring-2 ring-red-400' : ''} ${form.table ? 'text-cafe-dark' : 'text-cafe-gray'}`}
                >
                  <option value="">{form.table || 'Select table...'}</option>
                  {TABLE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cafe-gray pointer-events-none">
                  🔒
                </span>
              </div>
              {errors.table && <p className="text-red-400 text-xs mt-1">{errors.table}</p>}
            </div>
          )}

          {/* Note */}
          <div>
            <label className="text-xs font-semibold text-cafe-brown uppercase tracking-wide mb-1.5 block flex items-center gap-1">
              <FileText size={11} /> Special Instructions
            </label>
            <textarea
              placeholder="e.g. Extra spicy, less sugar..."
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              rows={2}
              className="input text-sm resize-none"
            />
          </div>
        </div>

        {/* ── Bill Detail ── */}
        <div className="bg-white rounded-2xl shadow-card p-4">
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between text-cafe-gray">
              <span>Subtotal</span>
              <span className="text-cafe-dark font-medium">₹{totalPrice}</span>
            </div>
            <div className="flex justify-between text-cafe-gray">
              <span>Taxes &amp; charges</span>
              <span>Included</span>
            </div>
            <div className="border-t border-cream pt-2.5 flex justify-between font-black text-cafe-dark text-base">
              <span>Total</span>
              <span className="text-orange-cafe text-lg">₹{totalPrice}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Floating CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-cream backdrop-blur-md px-4 pt-3 pb-6 border-t border-cream z-50">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full btn-primary flex items-center justify-center gap-3 py-4 text-base rounded-2xl"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-cafe-dark/30 border-t-cafe-dark rounded-full animate-spin" />
              Placing order...
            </>
          ) : (
            <>
              <ShoppingBag size={20} />
              <span className="font-black uppercase tracking-wide">Place Order • ₹{totalPrice}</span>
              <ChevronRight size={20} />
            </>
          )}
        </button>
        <p className="text-center text-xs text-cafe-gray mt-2">
          By placing your order, you agree to Nush Café terms.
        </p>
      </div>
    </div>
  )
}
