'use client';

import * as React from 'react'
import { io, Socket } from 'socket.io-client'
import { useUser } from '@/hooks/use-user'

interface Notification {
  id: string
  type: 'TASK_CREATED' | 'TASK_UPDATED' | 'TASK_STATUS_CHANGED' | 'TASK_RESULT_UPDATED' | 'TASK_ASSIGNED'
  title: string
  message: string
  taskId?: string
  createdAt: Date
  data?: any
}

interface WebSocketContextType {
  socket: Socket | null
  isConnected: boolean
  notifications: Notification[]
  unreadCount: number
  markNotificationAsRead: (notificationId: string) => void
  markAllNotificationsAsRead: () => void
  clearNotifications: () => void
}

const WebSocketContext = React.createContext<WebSocketContextType | undefined>(undefined)

interface WebSocketProviderProps {
  children: React.ReactNode
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const { user } = useUser()
  const userId = user?.id
  
  const [socket, setSocket] = React.useState<Socket | null>(null)
  const [isConnected, setIsConnected] = React.useState(false)
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = React.useState(0)

  React.useEffect(() => {
    if (!userId) {
      console.log('No user ID available, skipping WebSocket connection')
      return
    }

    console.log('🔄 Attempting to connect to WebSocket server...')
    console.log('👤 User ID:', userId)
    console.log('🌐 Backend URL:', process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001')

    // Create socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      timeout: 10000,
    })

    setSocket(newSocket)

    // Socket event handlers
    newSocket.on('connect', () => {
      console.log('✅ Connected to WebSocket server')
      console.log('🔌 Socket ID:', newSocket.id)
      setIsConnected(true)
      
      // Authenticate the user
      console.log('🔐 Authenticating user:', userId)
      newSocket.emit('authenticate', userId)
    })

    newSocket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error)
      setIsConnected(false)
    })

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from WebSocket server. Reason:', reason)
      setIsConnected(false)
    })

    newSocket.on('newNotification', (notification: Notification) => {
      console.log('📨 Received new notification:', notification)
      setNotifications(prev => [notification, ...prev])
      setUnreadCount(prev => prev + 1)
      
      // Show browser notification if permission is granted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: notification.id,
        })
      }
    })

    newSocket.on('broadcastNotification', (notification: Notification) => {
      console.log('📢 Received broadcast notification:', notification)
      setNotifications(prev => [notification, ...prev])
      setUnreadCount(prev => prev + 1)
    })

    newSocket.on('notificationMarkedRead', ({ notificationId }) => {
      console.log('✅ Notification marked as read:', notificationId)
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      )
    })

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up WebSocket connection')
      newSocket.close()
    }
  }, [userId])

  const markNotificationAsRead = (notificationId: string) => {
    if (socket) {
      socket.emit('markNotificationRead', notificationId)
    }
    
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    )
    setUnreadCount(0)
  }

  const clearNotifications = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  const value: WebSocketContextType = {
    socket,
    isConnected,
    notifications,
    unreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
  }

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  )
}

export const useWebSocket = () => {
  const context = React.useContext(WebSocketContext)
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
} 