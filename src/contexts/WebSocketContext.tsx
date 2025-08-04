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
  status?: 'UNREAD' | 'READ'
}

interface WebSocketContextType {
  socket: Socket | null
  isConnected: boolean
  notifications: Notification[]
  unreadCount: number
  markNotificationAsRead: (notificationId: string) => Promise<void>
  markAllNotificationsAsRead: () => Promise<void>
  clearNotifications: () => void
  fetchNotifications: () => Promise<void>
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

  // Function to get auth token from localStorage
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth-token')
    }
    return null
  }

  // Function to fetch notifications from database
  const fetchNotifications = React.useCallback(async () => {
    if (!userId) return

    try {
      const token = getAuthToken()
      if (!token) {
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/notifications`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.data || [])
        
        // Calculate unread count
        const unreadNotifications = data.data?.filter((n: Notification) => n.status === 'UNREAD') || []
        setUnreadCount(unreadNotifications.length)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }, [userId])

  // Function to mark notification as read
  const markNotificationAsRead = React.useCallback(async (notificationId: string) => {
    try {
      // Check if notification is already read
      const notification = notifications.find(n => n.id === notificationId)
      if (notification && notification.status === 'READ') {
        return
      }
      
      const token = getAuthToken()
      if (!token) {
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, status: 'READ' as const }
              : notif
          )
        )
        // Only reduce unread count if the notification was actually unread
        if (notification && notification.status === 'UNREAD') {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }, [notifications])

  // Function to mark all notifications as read
  const markAllNotificationsAsRead = React.useCallback(async () => {
    try {
      const token = getAuthToken()
      if (!token) {
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/notifications/mark-all-read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, status: 'READ' as const }))
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }, [])

  const clearNotifications = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  React.useEffect(() => {
    if (!userId) {
      return
    }

    // Create socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      timeout: 10000,
    })

    setSocket(newSocket)

    // Socket event handlers
    newSocket.on('connect', () => {
      setIsConnected(true)
      
      // Authenticate the user
      newSocket.emit('authenticate', userId)
      
      // Fetch existing notifications from database
      fetchNotifications()
    })

    newSocket.on('connect_error', (error) => {
      setIsConnected(false)
    })

    newSocket.on('disconnect', (reason) => {
      setIsConnected(false)
    })

    newSocket.on('newNotification', (notification: Notification) => {
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
      setNotifications(prev => [notification, ...prev])
      setUnreadCount(prev => prev + 1)
    })

    newSocket.on('notificationMarkedRead', ({ notificationId }) => {
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, status: 'READ' as const }
            : notif
        )
      )
    })

    // Cleanup on unmount
    return () => {
      newSocket.close()
    }
  }, [userId, fetchNotifications])

  const value: WebSocketContextType = {
    socket,
    isConnected,
    notifications,
    unreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    fetchNotifications,
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