import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { Search } from 'lucide-react'
import { useCart } from '../context/CartContext'
import CartBar from '../components/CartBar'
import BottomNav from '../components/BottomNav'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { key: 'all',              label: 'All',             icon: '✨' },
  { key: 'Hot Beverages',    label: 'Hot Beverages',   icon: '🍵' },
  { key: 'Coffee',           label: 'Coffee',           icon: '☕' },
  { key: 'Cold Beverages',   label: 'Cold Beverages',  icon: '🧋' },
  { key: 'Bites & Delights', label: 'Bites & Delights',icon: '🍟' },
]

const SECTION_LABELS = {
  'Hot Beverages':    '🍵 Hot Beverages',
  'Coffee':           '☕ The Coffee Bar',
  'Cold Beverages':   '🧋 Cold Beverages',
  'Bites & Delights': '🍟 Bites & Delights',
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning,'
  if (h < 17) return 'Good Afternoon,'
  return 'Good Evening,'
}

/* ─── Tag Badge ─────────────────────────────────────────────────────── */
function TagBadge({ tag }) {
  if (!tag) return null
  const colors = {
    "Chef's Choice": 'bg-orange-cafe text-white',
    'Popular':  'bg-yellow-cafe text-cafe-dark',
    'Spicy':    'bg-red-500 text-white',
    'New':      'bg-green-500 text-white',
    'Fan Fav':  'bg-purple-500 text-white',
    'Special':  'bg-blue-500 text-white',
    'Seasonal': 'bg-teal-500 text-white',
    'Healthy':  'bg-green-400 text-white',
    'Refreshing': 'bg-cyan-500 text-white',
    'Strong':   'bg-gray-700 text-white',
    'Cheesy':   'bg-yellow-400 text-cafe-dark',
  }
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${colors[tag] || 'bg-cream text-cafe-brown'}`}>
      {tag}
    </span>
  )
}

/* ─── Add/Qty Control ────────────────────────────────────────────────── */
function QtyControl({ item }) {
  const { addItem, removeItem, getQuantity } = useCart()
  const qty = getQuantity(item._id)

  if (!item.available) {
    return <span className="text-xs text-cafe-gray bg-cream px-2 py-1 rounded-lg font-medium">Sold Out</span>
  }

  if (qty === 0) {
    return (
      <button
        onClick={() => { addItem(item); toast.success(`${item.name} added!`, { duration: 1000 }) }}
        className="add-btn"
        aria-label={`Add ${item.name}`}
      >
        +
      </button>
    )
  }
  return (
    <div className="flex items-center gap-1.5 bg-cream rounded-full px-1 py-0.5">
      <button onClick={() => removeItem(item._id)}
        className="w-7 h-7 rounded-full bg-white flex items-center justify-center font-bold text-orange-cafe shadow-sm active:scale-90 transition-transform">
        −
      </button>
      <span className="font-bold text-cafe-dark text-sm w-4 text-center">{qty}</span>
      <button onClick={() => { addItem(item) }}
        className="w-7 h-7 rounded-full bg-yellow-cafe flex items-center justify-center font-bold text-cafe-dark shadow-sm active:scale-90 transition-transform">
        +
      </button>
    </div>
  )
}

/* ─── Featured (Chef's Choice) Big Card ─────────────────────────────── */
function FeaturedCard({ item }) {
  const { addItem, getQuantity, removeItem } = useCart()
  const qty = getQuantity(item._id)

  return (
    <div className="card card-hover p-0 overflow-hidden flex animate-fade-in mb-4">
      <div className="relative w-36 flex-shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={e => { e.target.src = `https://placehold.co/144x130/EDE4CF/7B4F2E?text=${encodeURIComponent(item.emoji)}` }}
        />
        <span className="absolute top-2 left-2 bg-orange-cafe text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
          Chef's Choice
        </span>
      </div>
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <p className="text-xs font-semibold text-orange-cafe uppercase tracking-wider mb-0.5">Signature</p>
          <h3 className="font-bold text-cafe-dark text-base leading-tight">{item.name}</h3>
          <p className="text-xs text-cafe-gray mt-1">Double shot espresso with silky micro-foam</p>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="font-black text-orange-cafe text-lg">₹{item.price}</span>
          {qty === 0 ? (
            <button
              onClick={() => { addItem(item); toast.success(`${item.name} added!`, { duration: 1000 }) }}
              className="bg-cafe-dark text-white text-xs font-bold px-4 py-2 rounded-xl active:scale-95 transition-transform"
            >
              Add to Cart
            </button>
          ) : (
            <div className="flex items-center gap-1.5 bg-cream rounded-full px-1 py-0.5">
              <button onClick={() => removeItem(item._id)}
                className="w-7 h-7 rounded-full bg-white flex items-center justify-center font-bold text-orange-cafe shadow-sm active:scale-90 transition-transform">
                −
              </button>
              <span className="font-bold text-cafe-dark text-sm w-4 text-center">{qty}</span>
              <button onClick={() => addItem(item)}
                className="w-7 h-7 rounded-full bg-yellow-cafe flex items-center justify-center font-bold text-cafe-dark shadow-sm active:scale-90 transition-transform">
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Grid Item Card (2-col) ─────────────────────────────────────────── */
function GridCard({ item }) {
  return (
    <div className={`bg-white rounded-2xl shadow-card overflow-hidden animate-fade-in transition-all duration-200 active:scale-95 ${!item.available ? 'opacity-50' : ''}`}>
      <div className="relative w-full h-28">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }}
        />
        <div className="hidden w-full h-full bg-cream-light items-center justify-center text-4xl">{item.emoji}</div>
        {item.tag && (
          <span className="absolute top-2 left-2">
            <TagBadge tag={item.tag} />
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-cafe-dark text-sm leading-tight line-clamp-1">{item.name}</h3>
        <div className="flex items-center justify-between mt-2">
          <span className="font-black text-cafe-dark text-base">₹{item.price}</span>
          <QtyControl item={item} />
        </div>
      </div>
    </div>
  )
}

/* ─── List Item Card (horizontal) ───────────────────────────────────── */
function ListCard({ item }) {
  return (
    <div className={`bg-white rounded-2xl shadow-card flex items-center gap-3 p-3 animate-fade-in ${!item.available ? 'opacity-50' : ''}`}>
      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-cream-light">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }}
        />
        <div className="hidden w-full h-full items-center justify-center text-2xl">{item.emoji}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <h3 className="font-semibold text-cafe-dark text-sm leading-tight">{item.name}</h3>
          {item.tag && <TagBadge tag={item.tag} />}
        </div>
        <span className="font-black text-orange-cafe text-sm mt-0.5 block">₹{item.price}</span>
      </div>
      <QtyControl item={item} />
    </div>
  )
}

/* ─── Section ────────────────────────────────────────────────────────── */
function Section({ category, items }) {
  const featured = items.find(i => i.tag === "Chef's Choice")
  const rest = items.filter(i => i.tag !== "Chef's Choice")

  // Coffee: featured card + grid for rest
  if (category === 'Coffee') {
    return (
      <div className="mb-6">
        <h2 className="text-base font-black text-cafe-dark mb-3 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-orange-cafe inline-block" />
          {SECTION_LABELS[category]}
        </h2>
        {featured && <FeaturedCard item={featured} />}
        <div className="grid grid-cols-2 gap-3">
          {rest.map(item => <GridCard key={item._id} item={item} />)}
        </div>
      </div>
    )
  }
  // Bites: list layout
  if (category === 'Bites & Delights') {
    return (
      <div className="mb-6">
        <h2 className="text-base font-black text-cafe-dark mb-3 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-orange-cafe inline-block" />
          {SECTION_LABELS[category]}
        </h2>
        <div className="flex flex-col gap-2.5">
          {items.map(item => <ListCard key={item._id} item={item} />)}
        </div>
      </div>
    )
  }
  // Default: 2-column grid
  return (
    <div className="mb-6">
      <h2 className="text-base font-black text-cafe-dark mb-3 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-orange-cafe inline-block" />
        {SECTION_LABELS[category] || category}
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {items.map(item => <GridCard key={item._id} item={item} />)}
      </div>
    </div>
  )
}

/* ─── Main Page ──────────────────────────────────────────────────────── */
export default function MenuPage() {
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')

  const fetchMenu = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/menu')
      setMenuItems(data)
    } catch {
      toast.error('Could not load menu. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMenu() }, [fetchMenu])

  const filtered = menuItems.filter(item => {
    const matchCat = activeCategory === 'all' || item.category === activeCategory
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  // Group by category while preserving order
  const CATEGORY_ORDER = ['Hot Beverages', 'Coffee', 'Cold Beverages', 'Bites & Delights']
  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    const items = filtered.filter(i => i.category === cat)
    if (items.length) acc[cat] = items
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-cream pb-36">

      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-40 bg-cream backdrop-blur-md">

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 pt-5 pb-2">
          <div>
            <p className="text-xs font-semibold text-cafe-gray uppercase tracking-widest">{getGreeting()}</p>
            <h1 className="text-2xl font-black text-cafe-dark leading-tight">Welcome to Nush.</h1>
            <p className="text-xs text-cafe-gray mt-0.5">Handcrafted flavors, sun-drenched moments.</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-orange-cafe flex items-center justify-center text-white font-black text-xl shadow-card">
            N
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cafe-gray" />
            <input
              type="text"
              placeholder="Search for your favorites..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white border-0 rounded-2xl pl-10 pr-4 py-3 text-sm text-cafe-dark
                         placeholder-cafe-gray shadow-card focus:outline-none focus:ring-2 focus:ring-yellow-cafe/40"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="scroll-x flex gap-2 px-4 pb-3">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold
                         transition-all duration-200 active:scale-95
                         ${activeCategory === cat.key
                ? 'bg-yellow-cafe text-cafe-dark shadow-cta'
                : 'bg-white text-cafe-gray shadow-card'
              }`}
            >
              <span>{cat.icon}</span>
              <span className="whitespace-nowrap">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-4 pt-4">
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1,2].map(s => (
              <div key={s}>
                <div className="h-5 w-36 bg-white rounded-xl animate-pulse mb-3" />
                <div className="grid grid-cols-2 gap-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="bg-white rounded-2xl shadow-card animate-pulse">
                      <div className="w-full h-28 bg-cream rounded-t-2xl" />
                      <div className="p-3 space-y-2">
                        <div className="h-3 bg-cream rounded w-3/4" />
                        <div className="h-3 bg-cream rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <span className="text-6xl">🍽️</span>
            <p className="text-cafe-dark font-bold text-lg">Nothing found</p>
            <p className="text-cafe-gray text-sm text-center">Try a different search or category</p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('all') }}
              className="btn-primary text-sm mt-2 py-2.5"
            >
              Clear filters
            </button>
          </div>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <Section key={category} category={category} items={items} />
          ))
        )}
      </div>

      <CartBar />
      <BottomNav />
    </div>
  )
}
