import { useCart } from '../context/CartContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { ShoppingBag, ChevronRight } from 'lucide-react'

export default function CartBar() {
  const { totalItems, totalPrice } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  if (totalItems === 0) return null
  if (location.pathname === '/cart' || location.pathname === '/checkout') return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
      <button
        onClick={() => navigate('/cart')}
        className="w-full flex items-center justify-between bg-cafe-dark text-white
                   px-5 py-3.5 rounded-2xl shadow-[0_8px_32px_rgba(44,26,14,0.35)]
                   active:scale-95 transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-yellow-cafe flex items-center justify-center">
              <ShoppingBag size={18} className="text-cafe-dark" />
            </div>
            <span className="absolute -top-1.5 -right-1.5 bg-orange-cafe text-white
                             text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          </div>
          <div>
            <p className="font-bold text-sm">{totalItems} item{totalItems !== 1 ? 's' : ''} added</p>
            <p className="text-xs text-white/60">Tap to review</p>
          </div>
        </div>
        <div className="flex items-center gap-1 font-black text-yellow-cafe">
          <span>₹{totalPrice}</span>
          <ChevronRight size={18} />
        </div>
      </button>
    </div>
  )
}
