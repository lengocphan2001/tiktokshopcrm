'use client';

import * as React from 'react'
import { Box } from '@mui/material'
import { MessagingApp } from '@/components/messaging/MessagingApp'
import { useUser } from '@/hooks/use-user'
import { useWebSocket } from '@/contexts/WebSocketContext'

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
  status: 'SENT' | 'DELIVERED' | 'READ' | 'SENDING'
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
  const { joinConversation, leaveConversation, onNewMessage, onConversationUpdated } = useWebSocket()
  const [conversations, setConversations] = React.useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = React.useState<Conversation | undefined>()
  const [currentMessages, setCurrentMessages] = React.useState<Message[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string>('')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [hasMoreMessages, setHasMoreMessages] = React.useState(true)
  const [loadingMore, setLoadingMore] = React.useState(false)

  // PERFORMANCE: Memoize auth token to prevent unnecessary re-computations
  const authToken = React.useMemo(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth-token')
    }
    return null
  }, [])

  // Get auth token
  const getAuthToken = React.useCallback(() => authToken, [authToken])

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
      
      // Sort conversations by updatedAt (newest first)
      const sortedConversations = (data.data || []).sort((a: Conversation, b: Conversation) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      
      // Log the messages in each conversation
      
      
      setConversations(sortedConversations)
    } catch (error: any) {
      setError(error.message || 'Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }, [getAuthToken])

  // Fetch messages for a conversation
  const fetchMessages = React.useCallback(async (conversationId: string, page = 1, limit = 5) => {
    try {
      setLoading(true)
      const token = getAuthToken()
      
      if (!token) {
        setError('Authentication required')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/messages/conversation/${conversationId}?page=${page}&limit=${limit}`, {
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
      const newMessages = data.data || []
      
      // For first load (page 1), replace messages. For pagination (page > 1), prepend messages
      if (page === 1) {
        setCurrentMessages(newMessages.reverse()) // Show newest first for chat
      } else {
        setCurrentMessages(prev => {
          // Create a Set of existing message IDs for O(1) lookup
          const existingMessageIds = new Set(prev.map(msg => msg.id))
          
          // Filter out duplicates from new messages
          const uniqueNewMessages = newMessages.reverse().filter((msg: Message) => !existingMessageIds.has(msg.id))
          
          // Prepend unique new messages
          return [...uniqueNewMessages, ...prev]
        })
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }, [getAuthToken])

  // Load more messages when scrolling up
  const loadMoreMessages = React.useCallback(async () => {
    if (!currentConversation || loadingMore || !hasMoreMessages) return
    
    try {
      setLoadingMore(true)
      const token = getAuthToken()
      
      if (!token) {
        setError('Authentication required')
        return
      }

      // Get the oldest message timestamp for cursor-based pagination
      const oldestMessage = currentMessages[0]
      const cursor = oldestMessage ? new Date(oldestMessage.createdAt).toISOString() : undefined

      const nextPage = currentPage + 1
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/messages/conversation/${currentConversation.id}?page=${nextPage}&limit=5${cursor ? `&before=${cursor}` : ''}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch more messages')
      }

      const data = await response.json()
      const olderMessages = data.data || []
      
      if (olderMessages.length === 0) {
        setHasMoreMessages(false)
        return
      }
      
      // Prepend older messages to current messages
      setCurrentMessages(prev => {
        // Create a Set of existing message IDs for O(1) lookup
        const existingMessageIds = new Set(prev.map(msg => msg.id))
        
        // Filter out duplicates from older messages
        const uniqueOlderMessages = olderMessages.reverse().filter((msg: Message) => !existingMessageIds.has(msg.id))
        
        // If no unique messages, we've reached the end
        if (uniqueOlderMessages.length === 0) {
          setHasMoreMessages(false)
          return prev
        }
        
        // Prepend unique older messages
        return [...uniqueOlderMessages, ...prev]
      })
      setCurrentPage(nextPage)
      
    } catch (error: any) {
      setError(error.message || 'Failed to load more messages')
    } finally {
      setLoadingMore(false)
    }
  }, [currentConversation, currentPage, loadingMore, hasMoreMessages, getAuthToken, currentMessages])

  // Send message
  const sendMessage = React.useCallback(async (content: string) => {
    if (!currentConversation) {
      setError('No conversation selected')
      return
    }

    const token = getAuthToken()
    if (!token) {
      setError('Authentication required')
      return
    }

    // Create optimistic message with unique ID
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const optimisticMessage = {
      id: tempId,
      content: content.trim(),
      type: 'TEXT' as const,
      status: 'SENDING' as const,
      senderId: user?.id || '',
      conversationId: currentConversation.id,
      createdAt: new Date(),
      sender: {
        id: user?.id || '',
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        avatar: user?.avatar,
      }
    }

    // ULTRA-FAST FRONTEND UPDATE - Update both current messages and conversation list
    setCurrentMessages(prev => [...prev, optimisticMessage])
    
    // Update conversation list to show latest message
    setConversations(prev => {
      const existingIndex = prev.findIndex(conv => conv.id === currentConversation.id)
      if (existingIndex === -1) return prev
      
      const existingConversation = prev[existingIndex]
      const updatedConversation = {
        ...existingConversation,
        messages: [optimisticMessage], // Show the latest message
        updatedAt: new Date(),
      }
      
      // Move to top of list
      const otherConversations = prev.filter((_, index) => index !== existingIndex)
      return [updatedConversation, ...otherConversations]
    })

    // NON-BLOCKING BACKEND SYNC - Fire and forget, no await
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/messages`, {
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
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('Failed to send message')
      }
      
      const data = await response.json()
      const realMessage = data.data
      
      // Update with real message from server (replace optimistic message)
      setCurrentMessages(prev => 
        prev.map(msg => 
          msg.id === tempId ? { ...realMessage, status: 'SENT' as const } : msg
        )
      )
      
      // Update conversation list with real message
      setConversations(prev => {
        const existingIndex = prev.findIndex(conv => conv.id === currentConversation.id)
        if (existingIndex === -1) return prev
        
        const existingConversation = prev[existingIndex]
        const updatedConversation = {
          ...existingConversation,
          messages: [{ ...realMessage, status: 'SENT' as const }], // Show the real message
          updatedAt: new Date(),
        }
        
        // Keep at top of list
        const otherConversations = prev.filter((_, index) => index !== existingIndex)
        return [updatedConversation, ...otherConversations]
      })
    })
    .catch((error) => {
      // Remove optimistic message on error
      setCurrentMessages(prev => prev.filter(msg => msg.id !== tempId))
      setError('Failed to send message')
    })
  }, [currentConversation, user, getAuthToken])

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
  }, [getAuthToken])

  // Handle conversation selection
  const handleConversationSelect = React.useCallback((conversation: Conversation) => {
    // Leave previous conversation room if exists
    if (currentConversation) {
      leaveConversation(currentConversation.id)
    }
    
    // Join new conversation room
    joinConversation(conversation.id)
    
    setCurrentConversation(conversation)
    setError('')
    setCurrentPage(1)
    setHasMoreMessages(true)
    fetchMessages(conversation.id, 1, 5) // Reset to page 1 with 5 messages
  }, [currentConversation, leaveConversation, joinConversation, fetchMessages])

  // Handle real-time messages
  const handleNewMessage = React.useCallback((message: any) => {
    // Only add message to current messages if it's for the current conversation and not from the current user
    if (currentConversation && message.conversationId === currentConversation.id && message.senderId !== user?.id) {
      setCurrentMessages(prev => {
        // ULTRA-FAST duplicate check using Set
        const messageIds = new Set(prev.map(m => m.id))
        if (messageIds.has(message.id)) {
          return prev
        }
        return [...prev, message]
      })
    }
    
    // EFFICIENT conversation list update - move conversation to top with latest message
    setConversations(prev => {
      const existingIndex = prev.findIndex(conv => conv.id === message.conversationId)
      if (existingIndex === -1) return prev
      
      const existingConversation = prev[existingIndex]
      const updatedConversation = {
        ...existingConversation,
        messages: [...(existingConversation.messages || []), message].slice(-1), // Keep only the latest message
        updatedAt: new Date(),
      }
      
      // Move to top of list
      const otherConversations = prev.filter((_, index) => index !== existingIndex)
      return [updatedConversation, ...otherConversations]
    })
  }, [currentConversation, user?.id])

  const handleConversationUpdate = React.useCallback((conversation: Conversation) => {
    // FAST conversation list update - only if it's the current conversation
    if (currentConversation && conversation.id === currentConversation.id) {
      setCurrentConversation(conversation)
    }
    
    // Update conversations list only if needed
    setConversations(prev => {
      const existingIndex = prev.findIndex(conv => conv.id === conversation.id)
      if (existingIndex === -1) return prev
      
      const updated = [...prev]
      updated[existingIndex] = conversation
      return updated
    })
  }, [currentConversation])

  React.useEffect(() => {
    // Register callbacks and get cleanup functions
    const cleanupMessage = onNewMessage(handleNewMessage)
    const cleanupConversation = onConversationUpdated(handleConversationUpdate)

    // Cleanup function
    return () => {
      cleanupMessage?.()
      cleanupConversation?.()
    }
  }, [handleNewMessage, handleConversationUpdate, onNewMessage, onConversationUpdated])

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
    <Box sx={{ 
      height: 'calc(100vh - 200px)', 
      width: '100%', 
      position: 'relative',
      overflow: 'hidden',
      margin: 'auto', // Compensate for Container py: '64px' (32px top + 32px bottom)
    }}>
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
        onLoadMoreMessages={loadMoreMessages}
        hasMoreMessages={hasMoreMessages}
        loadingMore={loadingMore}
      />
    </Box>
  )
} 