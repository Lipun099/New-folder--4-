import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X, Check } from 'lucide-react'

const CATEGORIES = ['Hot Beverages', 'Coffee', 'Cold Beverages', 'Bites & Delights']
const EMOJIS = ['☕', '🍵', '🧋', '🥤', '🍹', '🍫', '🧃', '🥭', '🍟', '🥪', '🍝', '🍜', '🥐', '🍿', '🧀', '🌶️', '🍗']

const BLANK_FORM = { name: '', category: CATEGORIES[0], price: '', emoji: '☕', available: true }

function ItemForm({ initial = BLANK_FORM, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
         onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="w-full max-w-md bg-white rounded-t-3xl p-5 pb-8 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-cafe-dark text-lg">
            {initial.name ? 'Edit Item' : 'Add New Item'}
          </h3>
          <button onClick={onCancel} className="btn-icon">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-sm font-medium text-cafe-dark mb-1.5 block">Item Name *</label>
            <input
              className="input"
              placeholder="e.g. Cappuccino"
              value={form.name}
              onChange={e => set('name', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-cafe-dark mb-1.5 block">Category *</label>
            <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-cafe-dark mb-1.5 block">Price (₹) *</label>
            <input
              className="input"
              type="number"
              min="1"
              placeholder="e.g. 120"
              value={form.price}
              onChange={e => set('price', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-cafe-dark mb-1.5 block">Emoji Icon</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(em => (
                <button
                  key={em}
                  type="button"
                  onClick={() => set('emoji', em)}
                  className={`w-10 h-10 rounded-xl text-xl transition-all duration-150
                    ${form.emoji === em ? 'bg-orange-cafe scale-110 shadow-sm' : 'bg-yellow-light active:scale-90'}`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-cafe-dark">Available</span>
            <button
              type="button"
              onClick={() => set('available', !form.available)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200
                ${form.available ? 'bg-green-500' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200
                ${form.available ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>
        </div>

        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.name || !form.price}
          className="btn-primary w-full mt-5 flex items-center justify-center gap-2"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Check size={18} />
              {initial.name ? 'Save Changes' : 'Add Item'}
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default function MenuManagement() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const fetchItems = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/menu')
      setItems(data)
    } catch {
      toast.error('Could not load menu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const handleSave = async (form) => {
    if (!form.name.trim() || !form.price) return
    try {
      setSaving(true)
      if (editItem) {
        const { data } = await axios.put(`/api/menu/${editItem._id}`, {
          ...form,
          price: Number(form.price),
        })
        setItems(prev => prev.map(i => i._id === editItem._id ? data : i))
        toast.success('Item updated!')
      } else {
        const { data } = await axios.post('/api/menu', {
          ...form,
          price: Number(form.price),
        })
        setItems(prev => [...prev, data])
        toast.success('Item added!')
      }
      setShowForm(false)
      setEditItem(null)
    } catch {
      toast.error('Could not save item')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return
    try {
      setDeletingId(id)
      await axios.delete(`/api/menu/${id}`)
      setItems(prev => prev.filter(i => i._id !== id))
      toast.success('Item deleted')
    } catch {
      toast.error('Could not delete item')
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggle = async (item) => {
    try {
      const { data } = await axios.put(`/api/menu/${item._id}`, { available: !item.available })
      setItems(prev => prev.map(i => i._id === item._id ? data : i))
    } catch {
      toast.error('Could not update availability')
    }
  }

  const filtered = activeCategory === 'all' ? items : items.filter(i => i.category === activeCategory)

  return (
    <div className="min-h-screen bg-cream pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-cafe to-yellow-dark px-4 pt-12 pb-6 text-white">
        <h1 className="text-2xl font-black">Menu</h1>
        <p className="text-sm opacity-80">{items.length} items total</p>
      </div>

      {/* Category filter */}
      <div className="px-4 pt-3">
        <div className="scroll-x flex gap-2 mb-4">
          {['all', ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-sm font-medium border transition-all duration-200
                ${activeCategory === cat
                  ? 'bg-orange-cafe text-white border-orange-cafe'
                  : 'bg-white text-cafe-dark border-yellow-cafe/30'
                }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>

        {/* Items list */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="card animate-pulse h-20" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(item => (
              <div
                key={item._id}
                className={`card flex items-center gap-3 animate-fade-in ${!item.available ? 'opacity-60' : ''}`}
              >
                <div className="w-12 h-12 rounded-xl bg-yellow-light flex items-center justify-center text-2xl flex-shrink-0">
                  {item.emoji || '🍽️'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-cafe-dark truncate">{item.name}</p>
                  <p className="text-xs text-cafe-gray">{item.category} · ₹{item.price}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleToggle(item)}
                    className={`text-sm transition-colors ${item.available ? 'text-green-500' : 'text-gray-300'}`}
                  >
                    {item.available ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                  </button>
                  <button
                    onClick={() => { setEditItem(item); setShowForm(true) }}
                    className="btn-icon w-8 h-8"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    disabled={deletingId === item._id}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 text-red-400 active:scale-90 transition-transform"
                  >
                    {deletingId === item._id
                      ? <div className="w-4 h-4 border-2 border-red-300 border-t-red-400 rounded-full animate-spin" />
                      : <Trash2 size={15} />
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB Add button */}
      <button
        onClick={() => { setEditItem(null); setShowForm(true) }}
        className="fixed bottom-24 right-4 w-14 h-14 bg-orange-cafe text-white rounded-2xl
                   shadow-[0_8px_32px_rgba(255,140,66,0.4)] flex items-center justify-center
                   active:scale-90 transition-all duration-200 z-40"
      >
        <Plus size={28} />
      </button>

      {/* Form modal */}
      {showForm && (
        <ItemForm
          initial={editItem ? { ...editItem } : BLANK_FORM}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditItem(null) }}
          saving={saving}
        />
      )}
    </div>
  )
}
