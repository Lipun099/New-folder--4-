import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('nush_cart')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('nush_cart', JSON.stringify(items))
  }, [items])

  const addItem = useCallback((menuItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.menuItem === menuItem._id)
      if (existing) {
        return prev.map(i =>
          i.menuItem === menuItem._id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, {
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        emoji: menuItem.emoji,
        image: menuItem.image || null,
        quantity: 1,
      }]
    })
  }, [])

  const removeItem = useCallback((menuItemId) => {
    setItems(prev => {
      const existing = prev.find(i => i.menuItem === menuItemId)
      if (!existing) return prev
      if (existing.quantity === 1) return prev.filter(i => i.menuItem !== menuItemId)
      return prev.map(i =>
        i.menuItem === menuItemId
          ? { ...i, quantity: i.quantity - 1 }
          : i
      )
    })
  }, [])

  const deleteItem = useCallback((menuItemId) => {
    setItems(prev => prev.filter(i => i.menuItem !== menuItemId))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const getQuantity = useCallback((menuItemId) => {
    return items.find(i => i.menuItem === menuItemId)?.quantity || 0
  }, [items])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, deleteItem, clearCart,
      getQuantity, totalItems, totalPrice
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
