import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from './context/CartContext'
import { SocketProvider } from './context/SocketContext'

// Customer pages
import MenuPage from './pages/MenuPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderStatusPage from './pages/OrderStatusPage'

// Admin pages
import AdminLogin from './admin/AdminLogin'
import AdminLayout from './admin/AdminLayout'
import AdminDashboard from './admin/AdminDashboard'
import MenuManagement from './admin/MenuManagement'
import OrderManagement from './admin/OrderManagement'
import QRScanner from './admin/QRScanner'

function AdminGuard({ children }) {
  const isAdmin = localStorage.getItem('nush_admin') === 'true'
  if (!isAdmin) return <Navigate to="/admin/login" replace />
  return children
}

export default function App() {
  return (
    <SocketProvider>
      <CartProvider>
        <BrowserRouter>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#fff',
                color: '#2D1B00',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                borderRadius: '1rem',
                boxShadow: '0 4px 24px rgba(45,27,0,0.12)',
              },
              success: { iconTheme: { primary: '#FF8C42', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
          <Routes>
            {/* Customer Routes */}
            <Route path="/" element={<MenuPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order/:orderId" element={<OrderStatusPage />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminLayout />
                </AdminGuard>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="menu" element={<MenuManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="scanner" element={<QRScanner />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </SocketProvider>
  )
}
