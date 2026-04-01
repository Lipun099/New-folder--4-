import { useNavigate, useLocation } from 'react-router-dom'
import { Coffee, ShoppingCart, Receipt, Home } from 'lucide-react'
import { useCart } from '../context/CartContext'

const navItems = [
  { path: '/', icon: Home, label: 'Menu' },
  { path: '/cart', icon: ShoppingCart, label: 'Cart' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { totalItems } = useCart()

  // Hide on admin and order status pages
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/order')) return null

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around px-4 py-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path
          const isCart = path === '/cart'

          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-1 py-2 px-6 rounded-xl transition-all duration-200
                ${active
                  ? 'text-orange-cafe'
                  : 'text-cafe-gray'
                }`}
            >
              <div className="relative">
                <Icon size={24} strokeWidth={active ? 2.5 : 1.8} />
                {isCart && totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-cafe text-white
                                   text-xs font-bold w-4.5 h-4.5 min-w-[18px] min-h-[18px]
                                   rounded-full flex items-center justify-center leading-none px-1">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className={`text-xs font-medium ${active ? 'font-semibold' : ''}`}>
                {label}
              </span>
              {active && (
                <div className="w-1 h-1 rounded-full bg-orange-cafe" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
