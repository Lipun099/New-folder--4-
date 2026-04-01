import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, ChevronRight, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import BottomNav from '../components/BottomNav'

function ItemPhoto({ image, emoji, name }) {
  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover"
        onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
      />
    )
  }
  return null
}

export default function CartPage() {
  const { items, addItem, removeItem, deleteItem, clearCart, totalItems, totalPrice } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4 px-6 pb-24">
        <div className="w-24 h-24 rounded-3xl bg-white shadow-card flex items-center justify-center text-5xl">
          🛒
        </div>
        <h2 className="text-2xl font-black text-cafe-dark">Cart is empty</h2>
        <p className="text-cafe-gray text-center text-sm">Add some delicious items from the menu!</p>
        <button onClick={() => navigate('/')} className="btn-primary mt-2 px-8 py-3">
          Browse Menu
        </button>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream pb-40">

      {/* Header */}
      <div className="sticky top-0 z-40 bg-cream backdrop-blur-md px-4 pt-5 pb-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="btn-icon">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="font-black text-cafe-dark text-xl">Your Cart</h1>
          <p className="text-xs text-cafe-gray">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-red-400 font-semibold flex items-center gap-1 bg-white px-3 py-2 rounded-xl shadow-card"
        >
          <Trash2 size={13} /> Clear
        </button>
      </div>

      <div className="px-4 flex flex-col gap-3">

        {/* Item list */}
        {items.map(item => (
          <div key={item.menuItem} className="bg-white rounded-2xl shadow-card flex items-center gap-3 p-3 animate-fade-in">

            {/* Photo */}
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-cream-light relative">
              {item.image ? (
                <>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                  />
                  <div className="hidden w-full h-full items-center justify-center text-2xl absolute inset-0 bg-cream-light">
                    {item.emoji || '🍽️'}
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  {item.emoji || '🍽️'}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-cafe-dark text-sm leading-tight truncate">{item.name}</h3>
              <p className="text-cafe-gray text-xs mt-0.5">₹{item.price} each</p>
              {/* Qty row */}
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => removeItem(item.menuItem)}
                  className="w-7 h-7 rounded-full bg-cream flex items-center justify-center font-bold text-orange-cafe active:scale-90 transition-transform"
                >−</button>
                <span className="font-bold text-cafe-dark text-sm w-5 text-center">{item.quantity}</span>
                <button
                  onClick={() => addItem({ _id: item.menuItem, name: item.name, price: item.price, emoji: item.emoji, image: item.image })}
                  className="w-7 h-7 rounded-full bg-yellow-cafe flex items-center justify-center font-bold text-cafe-dark active:scale-90 transition-transform shadow-cta"
                >+</button>
              </div>
            </div>

            {/* Subtotal + delete */}
            <div className="text-right flex-shrink-0">
              <p className="font-black text-cafe-dark">₹{item.price * item.quantity}</p>
              <button onClick={() => deleteItem(item.menuItem)} className="text-red-300 mt-1">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        {/* Summary */}
        <div className="bg-white rounded-2xl shadow-card p-4 mt-1">
          <h3 className="font-bold text-cafe-dark mb-3">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-cafe-gray">
              <span>Subtotal ({totalItems} items)</span>
              <span className="font-medium text-cafe-dark">₹{totalPrice}</span>
            </div>
            <div className="flex justify-between text-sm text-cafe-gray">
              <span>Taxes & charges</span>
              <span>Included</span>
            </div>
            <div className="border-t border-cream pt-2 mt-1 flex justify-between font-black text-cafe-dark text-base">
              <span>Total</span>
              <span className="text-orange-cafe text-lg">₹{totalPrice}</span>
            </div>
          </div>
        </div>

        {/* ETA note */}
        <div className="bg-yellow-cafe/20 border border-yellow-cafe/30 rounded-2xl p-3 text-sm text-cafe-brown font-medium text-center">
          🕐 Estimated time: 10–15 minutes
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-16 left-0 right-0 px-4 z-50 pb-safe">
        <button
          onClick={() => navigate('/checkout')}
          className="w-full btn-primary flex items-center justify-between py-4 px-5 text-base rounded-2xl"
        >
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} />
            <span>Proceed to Checkout</span>
          </div>
          <div className="flex items-center gap-1 font-black">
            <span>₹{totalPrice}</span>
            <ChevronRight size={20} />
          </div>
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
