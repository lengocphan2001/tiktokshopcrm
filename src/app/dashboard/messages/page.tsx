'use client';

import * as React from 'react'
import { MessagingApp } from '@/components/messaging/MessagingApp'
import { useUser } from '@/hooks/use-user'

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

interface Message {
  id: string
  content: string
  type: 'TEXT' | 'SYSTEM' | 'NOTIFICATION'
  status: 'SENT' | 'DELIVERED' | 'READ'
  senderId: string
  createdAt: Date
  sender: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  }
}

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  role: string
}

export default function MessagesPage() {
  const { user } = useUser()
  const [conversations, setConversations] = React.useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = React.useState<Conversation | undefined>()
  const [currentMessages, setCurrentMessages] = React.useState<Message[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string>('')

  // Get auth token
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth-token')
    }
    return null
  }

  // Fetch conversations
  const fetchConversations = React.useCallback(async () => {
    try {
      setLoading(true)
      const token = getAuthToken()
      
      if (!token) {
        setError('Authentication required')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/conversations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch conversations')
      }

      const data = await response.json()
      setConversations(data.data || [])
    } catch (error: any) {
      setError(error.message || 'Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch messages for a conversation
  const fetchMessages = React.useCallback(async (conversationId: string) => {
    try {
      setLoading(true)
      const token = getAuthToken()
      
      if (!token) {
        setError('Authentication required')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/messages/conversation/${conversationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }

      const data = await response.json()
      setCurrentMessages(data.data || [])
    } catch (error: any) {
      setError(error.message || 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }, [])

  // Send message
  const sendMessage = React.useCallback(async (content: string) => {
    try {
      if (!currentConversation) {
        setError('No conversation selected')
        return
      }

      const token = getAuthToken()
      
      if (!token) {
        setError('Authentication required')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          conversationId: currentConversation.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      
      // Add new message to current messages
      setCurrentMessages(prev => [...prev, data.data])
      
      // Update conversations list with new message
      setConversations(prev => 
        prev.map(conv => 
          conv.id === currentConversation.id 
            ? {
                ...conv,
                messages: [data.data, ...conv.messages],
                updatedAt: new Date().toISOString(),
              }
            : conv
        )
      )
    } catch (error: any) {
      setError(error.message || 'Failed to send message')
    }
  }, [currentConversation])

  // Start conversation with user
  const startConversation = React.useCallback(async (selectedUser: User) => {
    try {
      setLoading(true)
      const token = getAuthToken()
      
      if (!token) {
        setError('Authentication required')
        return
      }

      // Create conversation
      const conversationResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId: selectedUser.id,
        }),
      })

      if (!conversationResponse.ok) {
        throw new Error('Failed to create conversation')
      }

      const conversationData = await conversationResponse.json()
      const newConversation = conversationData.data

      // Add to conversations list
      setConversations(prev => [newConversation, ...prev])
      
      // Select the new conversation
      setCurrentConversation(newConversation)
      setCurrentMessages([])
      setError('')
    } catch (error: any) {
      setError(error.message || 'Failed to start conversation')
    } finally {
      setLoading(false)
    }
  }, [])

  // Handle conversation selection
  const handleConversationSelect = React.useCallback((conversation: Conversation) => {
    setCurrentConversation(conversation)
    setError('')
    fetchMessages(conversation.id)
  }, [fetchMessages])

  // Load conversations on mount
  React.useEffect(() => {
    if (user) {
      fetchConversations()
    }
  }, [user, fetchConversations])

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading user...</p>
      </div>
    )
  }

  return (
    <MessagingApp
      conversations={conversations}
      currentConversation={currentConversation}
      currentMessages={currentMessages}
      currentUserId={user.id}
      loading={loading}
      error={error}
      onConversationSelect={handleConversationSelect}
      onSendMessage={sendMessage}
      onStartConversation={startConversation}
    />
  )
} 