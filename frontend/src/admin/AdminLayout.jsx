import { Outlet } from 'react-router-dom'
import AdminBottomNav from '../components/AdminBottomNav'

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-cream">
      <Outlet />
      <AdminBottomNav />
    </div>
  )
}
