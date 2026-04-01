import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Lock, Eye, EyeOff } from 'lucide-react'

export default function AdminLogin() {
  const [pin, setPin] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (pin.length !== 4) {
      toast.error('Enter a 4-digit PIN')
      return
    }
    try {
      setLoading(true)
      const { data } = await axios.post('/api/admin/verify', { pin })
      if (data.success) {
        localStorage.setItem('nush_admin', 'true')
        toast.success('Welcome, Admin! 👋')
        navigate('/admin/dashboard')
      }
    } catch {
      toast.error('Incorrect PIN. Try again.')
      setPin('')
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (key) => {
    if (key === 'del') {
      setPin(p => p.slice(0, -1))
    } else if (pin.length < 4) {
      const newPin = pin + key
      setPin(newPin)
      if (newPin.length === 4) {
        setTimeout(() => handleLoginWithPin(newPin), 200)
      }
    }
  }

  const handleLoginWithPin = async (p) => {
    try {
      setLoading(true)
      const { data } = await axios.post('/api/admin/verify', { pin: p })
      if (data.success) {
        localStorage.setItem('nush_admin', 'true')
        toast.success('Welcome, Admin! 👋')
        navigate('/admin/dashboard')
      }
    } catch {
      toast.error('Incorrect PIN. Try again.')
      setPin('')
    } finally {
      setLoading(false)
    }
  }

  const KEYS = ['1','2','3','4','5','6','7','8','9','','0','del']

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-cafe via-cream to-orange-50 flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-cafe to-yellow-dark
                        flex items-center justify-center text-white text-4xl shadow-card-hover mx-auto mb-4">
          ☕
        </div>
        <h1 className="text-2xl font-black text-cafe-dark">Nush Café</h1>
        <p className="text-cafe-gray text-sm mt-1">Admin Panel</p>
      </div>

      {/* PIN card */}
      <div className="w-full max-w-xs bg-white rounded-3xl shadow-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock size={18} className="text-orange-cafe" />
          <h2 className="font-bold text-cafe-dark">Enter Admin PIN</h2>
        </div>

        {/* PIN dots */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200
                ${i < pin.length
                  ? 'bg-orange-cafe border-orange-cafe scale-110'
                  : 'bg-transparent border-cafe-gray/40'
                }`}
            />
          ))}
        </div>

        {/* Number pad */}
        <div className="grid grid-cols-3 gap-3">
          {KEYS.map((key, idx) => (
            <button
              key={idx}
              onClick={() => key && handleKey(key)}
              disabled={loading || !key}
              className={`h-14 rounded-2xl font-semibold text-xl transition-all duration-150
                ${key === 'del'
                  ? 'bg-red-50 text-red-400 active:bg-red-100 active:scale-95 text-sm'
                  : key === ''
                  ? ''
                  : 'bg-yellow-light text-cafe-dark active:bg-yellow-cafe active:scale-90'
                }`}
            >
              {key === 'del' ? '⌫' : key}
            </button>
          ))}
        </div>
      </div>

      <p className="text-cafe-gray text-xs mt-6">Default PIN: 9999</p>
    </div>
  )
}
