'use client';

import * as React from 'react'
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

interface Message {
  id: string
  content: string
  type: 'TEXT' | 'SYSTEM' | 'NOTIFICATION'
  status: 'SENT' | 'DELIVERED' | 'READ'
  senderId: string
  conversationId: string
  createdAt: Date
  sender: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  }
}

interface Conversation {
  id: string
  type: string
  participants: Array<{
    user: {
      id: string
      firstName: string
      lastName: string
      email: string
      avatar?: string
    }
  }>
  messages: Array<{
    id: string
    content: string
    createdAt: Date
    sender: {
      id: string
      firstName: string
      lastName: string
    }
  }>
  updatedAt: Date
}

interface WebSocketContextType {
  isConnected: boolean
  notifications: Notification[]
  unreadCount: number
  markNotificationAsRead: (notificationId: string) => Promise<void>
  markAllNotificationsAsRead: () => Promise<void>
  clearNotifications: () => void
  fetchNotifications: () => Promise<void>
  // Messaging functions
  joinConversation: (conversationId: string) => void
  leaveConversation: (conversationId: string) => void
  onNewMessage: (callback: (message: Message) => void) => (() => void) | undefined
  onConversationUpdated: (callback: (conversation: Conversation) => void) => (() => void) | undefined
}

const WebSocketContext = React.createContext<WebSocketContextType | undefined>(undefined)

interface WebSocketProviderProps {
  children: React.ReactNode
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const { user } = useUser()
  const userId = user?.id
  
  const [isConnected, setIsConnected] = React.useState(false)
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = React.useState(0)
  
  // Message and conversation callbacks using refs to avoid re-renders
  const messageCallbacksRef = React.useRef<((message: Message) => void)[]>([])
  const conversationCallbacksRef = React.useRef<((conversation: Conversation) => void)[]>([])
  
  // WebSocket connection
  const wsRef = React.useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

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

  // Messaging functions
  const joinConversation = (conversationId: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'joinConversation',
        conversationId
      }))
    } else {
      console.log('WebSocket not connected, skipping join conversation')
    }
  }

  const leaveConversation = (conversationId: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'leaveConversation',
        conversationId
      }))
    } else {
      console.log('WebSocket not connected, skipping leave conversation')
    }
  }

  const onNewMessage = React.useCallback((callback: (message: Message) => void) => {
    messageCallbacksRef.current.push(callback)
    
    // Return cleanup function
    return () => {
      const index = messageCallbacksRef.current.indexOf(callback)
      if (index > -1) {
        messageCallbacksRef.current.splice(index, 1)
      }
    }
  }, [])

  const onConversationUpdated = React.useCallback((callback: (conversation: Conversation) => void) => {
    conversationCallbacksRef.current.push(callback)
    
    // Return cleanup function
    return () => {
      const index = conversationCallbacksRef.current.indexOf(callback)
      if (index > -1) {
        conversationCallbacksRef.current.splice(index, 1)
      }
    }
  }, [])

  // Initialize WebSocket connection
  const initializeWebSocket = React.useCallback(() => {
    if (!userId) return

    const token = getAuthToken()
    if (!token) return

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close()
    }

    // Create new WebSocket connection
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
    const wsUrl = backendUrl.replace('http', 'ws').replace('https', 'wss')
    
    try {
      const ws = new WebSocket(`${wsUrl}/ws?token=${token}`)
      wsRef.current = ws
      
      console.log('Attempting WebSocket connection to:', `${wsUrl}/ws`)
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      setIsConnected(false)
      return
    }

    ws.onopen = () => {
      setIsConnected(true)
      console.log('WebSocket connected')
      
      // Authenticate the user
      ws.send(JSON.stringify({
        type: 'authenticate',
        userId
      }))
      
      // Fetch existing notifications
      fetchNotifications()
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        switch (data.type) {
          case 'newMessage':
            messageCallbacksRef.current.forEach(callback => callback(data.message))
            break
            
          case 'conversationUpdated':
            conversationCallbacksRef.current.forEach(callback => callback(data.conversation))
            break
            
          case 'newNotification':
            setNotifications(prev => [data.notification, ...prev])
            setUnreadCount(prev => prev + 1)
            
            // Show browser notification if permission is granted
            if (Notification.permission === 'granted') {
              new Notification(data.notification.title, {
                body: data.notification.message,
                icon: '/favicon.ico',
                tag: data.notification.id,
              })
            }
            break
            
          case 'broadcastNotification':
            setNotifications(prev => [data.notification, ...prev])
            setUnreadCount(prev => prev + 1)
            break
            
          case 'notificationMarkedRead':
            setNotifications(prev => 
              prev.map(notif => 
                notif.id === data.notificationId 
                  ? { ...notif, status: 'READ' as const }
                  : notif
              )
            )
            break
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }

    ws.onclose = () => {
      setIsConnected(false)
      console.log('WebSocket disconnected')
      
      // Attempt to reconnect after 3 seconds
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        initializeWebSocket()
      }, 3000)
    }

    ws.onerror = (error) => {
      console.error('WebSocket connection error:', error)
      console.log('WebSocket URL attempted:', `${wsUrl}/ws?token=${token.substring(0, 20)}...`)
      setIsConnected(false)
    }
  }, [userId, fetchNotifications])

  React.useEffect(() => {
    if (!userId) {
      return
    }

    initializeWebSocket()

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [userId, initializeWebSocket])

  const value: WebSocketContextType = {
    isConnected,
    notifications,
    unreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    fetchNotifications,
    // Messaging functions
    joinConversation,
    leaveConversation,
    onNewMessage,
    onConversationUpdated,
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