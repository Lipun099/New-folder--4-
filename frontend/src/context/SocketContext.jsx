import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const SocketContext = createContext(null)

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://new-folder-4-eyb0.onrender.com'

export function SocketProvider({ children }) {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketRef.current.on('connect', () => {
      setConnected(true)
      console.log('Socket connected:', socketRef.current.id)
    })

    socketRef.current.on('disconnect', () => {
      setConnected(false)
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [])

  const joinOrderRoom = (orderId) => {
    socketRef.current?.emit('join_order_room', orderId)
  }

  const joinAdminRoom = () => {
    socketRef.current?.emit('join_admin_room')
  }

  const onEvent = (event, handler) => {
    socketRef.current?.on(event, handler)
    return () => socketRef.current?.off(event, handler)
  }

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, joinOrderRoom, joinAdminRoom, onEvent }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const ctx = useContext(SocketContext)
  if (!ctx) throw new Error('useSocket must be used within SocketProvider')
  return ctx
}
