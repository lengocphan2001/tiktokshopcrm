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
      // Reverse the messages to show oldest first (standard chat order)
      setCurrentMessages((data.data || []).reverse())
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

      // Create optimistic message with unique ID
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const optimisticMessage = {
        id: tempId,
        content: content.trim(),
        type: 'TEXT' as const,
        status: 'SENDING' as const, // Show sending status
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

      // INSTANT FRONTEND UPDATE - No waiting at all!
      setCurrentMessages(prev => [...prev, optimisticMessage])
      
      // INSTANT conversation list update
      setConversations(prev => {
        const updatedConversations = prev.map(conv => 
          conv.id === currentConversation.id 
            ? {
                ...conv,
                messages: [...(conv.messages || []), optimisticMessage],
                updatedAt: new Date(),
              }
            : conv
        )
        
        // Sort by updatedAt (newest first)
        return updatedConversations.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
      })

      // PARALLEL BACKEND SYNC - Non-blocking!
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
        
        setConversations(prev => {
          const updatedConversations = prev.map(conv => 
            conv.id === currentConversation.id 
              ? {
                  ...conv,
                  messages: conv.messages?.map(msg => 
                    msg.id === tempId ? { ...realMessage, status: 'SENT' as const } : msg
                  ) || [],
                  updatedAt: new Date(),
                }
              : conv
          )
          
          return updatedConversations.sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
        })
      })
      .catch((error) => {
        setError('Failed to send message')
        
        // Remove optimistic message on error
        setCurrentMessages(prev => 
          prev.filter(msg => msg.id !== tempId)
        )
        
        // Remove from conversations list
        setConversations(prev => {
          const updatedConversations = prev.map(conv => 
            conv.id === currentConversation?.id 
              ? {
                  ...conv,
                  messages: conv.messages?.filter(msg => msg.id !== tempId) || [],
                }
              : conv
          )
          
          return updatedConversations.sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
        })
      })
      .catch((error) => {
        // Remove optimistic message on error
        setCurrentMessages(prev => prev.filter(msg => msg.id !== tempId))
        setConversations(prev => {
          const updatedConversations = prev.map(conv => 
            conv.id === currentConversation.id 
              ? {
                  ...conv,
                  messages: conv.messages?.filter(msg => msg.id !== tempId) || [],
                  updatedAt: new Date(),
                }
              : conv
          )
          
          return updatedConversations.sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
        })
        setError(error.message || 'Failed to send message')
      })
      
    } catch (error: any) {
      setError(error.message || 'Failed to send message')
    }
  }, [currentConversation, user])

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
    // Leave previous conversation room if exists
    if (currentConversation) {
      leaveConversation(currentConversation.id)
    }
    
    // Join new conversation room
    joinConversation(conversation.id)
    
    setCurrentConversation(conversation)
    setError('')
    fetchMessages(conversation.id)
  }, [fetchMessages, currentConversation, joinConversation, leaveConversation])

  // Handle real-time messages
  const handleNewMessage = React.useCallback((message: any) => {
    
    // Only add message to current messages if it's for the current conversation and not from the current user
    // AND if the message doesn't already exist (to prevent duplicates)
    if (currentConversation && message.conversationId === currentConversation.id && message.senderId !== user?.id) {
      setCurrentMessages(prev => {
        // Check if message already exists to prevent duplicates
        const messageExists = prev.some(m => m.id === message.id)
        if (messageExists) {
          return prev
        }
        return [...prev, message]
      })
    }
    
    // Always update conversations list to show the new message and move to top
    setConversations(prev => {
      const updatedConversations = prev.map(conv => 
        conv.id === message.conversationId 
          ? {
              ...conv,
              // Check if message already exists (to avoid duplicates from optimistic updates)
              messages: conv.messages?.some(m => m.id === message.id) 
                ? conv.messages 
                : [...(conv.messages || []), message],
              updatedAt: new Date(),
            }
          : conv
      )
      
      
      // Sort by updatedAt (newest first)
      return updatedConversations.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    })
  }, [currentConversation, user?.id])

  const handleConversationUpdate = React.useCallback((conversation: Conversation) => {
    // Update conversations list with the updated conversation and sort
    setConversations(prev => {
      const updatedConversations = prev.map(conv => 
        conv.id === conversation.id 
          ? conversation
          : conv
      )
      
      // Sort by updatedAt (newest first)
      return updatedConversations.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    })
  }, [])

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
      />
    </Box>
  )
} 