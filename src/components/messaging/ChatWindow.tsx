'use client';

import * as React from 'react'
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Paper,
  Divider,
  CircularProgress,
  Skeleton,
  Fade,
  Slide,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import { Send as SendIcon, MoreVert as MoreVertIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material'
import { formatDistanceToNow } from 'date-fns'

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
  messages: Message[]
}

interface ChatWindowProps {
  conversation?: Conversation
  currentUserId: string
  messages: Message[]
  loading?: boolean
  onSendMessage: (content: string) => void
  onLoadMoreMessages?: () => void
  onBackToConversations?: () => void
  hasMoreMessages?: boolean
  loadingMore?: boolean
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  currentUserId,
  messages,
  loading = false,
  onSendMessage,
  onLoadMoreMessages,
  onBackToConversations,
  hasMoreMessages = true,
  loadingMore = false,
}) => {
  const [newMessage, setNewMessage] = React.useState('')
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const messagesContainerRef = React.useRef<HTMLDivElement>(null)
  const [isTyping, setIsTyping] = React.useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  // ROBUST SCROLL MANAGEMENT
  const prevMessageCountRef = React.useRef(0)
  const scrollPositionRef = React.useRef(0)
  const userSentMessageRef = React.useRef(false)
  const isLoadingOlderMessagesRef = React.useRef(false)
  const firstMessageRef = React.useRef<HTMLDivElement>(null)
  const lastMessageRef = React.useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Handle scroll to load more messages
  const handleScroll = React.useCallback(() => {
    if (!messagesContainerRef.current || !onLoadMoreMessages || loadingMore || !hasMoreMessages) return
    
    const { scrollTop } = messagesContainerRef.current
    // Load more when user scrolls to top (within 50px)
    if (scrollTop < 50) {
      // Mark that we're loading older messages
      isLoadingOlderMessagesRef.current = true
      
      // Store the current scroll position and the height of the first message
      if (firstMessageRef.current) {
        const firstMessageRect = firstMessageRef.current.getBoundingClientRect()
        const containerRect = messagesContainerRef.current.getBoundingClientRect()
        scrollPositionRef.current = firstMessageRect.top - containerRect.top
      }
      
      onLoadMoreMessages()
    }
  }, [onLoadMoreMessages, loadingMore, hasMoreMessages])

  React.useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  // COMPLETELY REWRITTEN SCROLL LOGIC
  React.useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const currentMessageCount = messages.length
    const prevMessageCount = prevMessageCountRef.current

    if (currentMessageCount > prevMessageCount) {
      const messageDifference = currentMessageCount - prevMessageCount
      
      if (prevMessageCount === 0) {
        // First load - scroll to bottom
        scrollToBottom()
      } else if (userSentMessageRef.current) {
        // User sent a message - scroll to bottom
        scrollToBottom()
        userSentMessageRef.current = false
      } else if (isLoadingOlderMessagesRef.current) {
        // Loading older messages - preserve scroll position
        isLoadingOlderMessagesRef.current = false
        
        // Use requestAnimationFrame to ensure DOM is updated
        requestAnimationFrame(() => {
          if (container && firstMessageRef.current) {
            const firstMessageRect = firstMessageRef.current.getBoundingClientRect()
            const containerRect = container.getBoundingClientRect()
            const newScrollTop = firstMessageRect.top - containerRect.top - scrollPositionRef.current
            
            container.scrollTop = newScrollTop
            scrollPositionRef.current = 0 // Reset
          }
        })
      } else {
        // New messages at the bottom (from other user) - scroll to bottom
        scrollToBottom()
      }
    }

    // Update refs
    prevMessageCountRef.current = currentMessageCount
  }, [messages])

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      userSentMessageRef.current = true // Mark that user is sending a message
      onSendMessage(newMessage.trim())
      setNewMessage('') // Clear input immediately for better UX
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

  const getOtherParticipant = () => {
    return conversation?.participants?.find(p => p?.user?.id !== currentUserId)?.user
  }

  if (!conversation) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            backgroundColor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2
          }}
        >
          <Typography variant="h2" color="text.secondary">
            💬
          </Typography>
        </Box>
        <Typography variant="h5" color="text.primary" gutterBottom>
          Select a conversation
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Choose a conversation to start messaging
        </Typography>
      </Box>
    )
  }

  const otherUser = getOtherParticipant()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Paper 
        sx={{ 
          p: 2, 
          borderBottom: 1, 
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 1,
          width: '100%',
          flexShrink: 0
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isMobile && onBackToConversations && (
            <Tooltip title="Back to conversations">
              <IconButton 
                size="small" 
                onClick={onBackToConversations}
                sx={{ mr: 1 }}
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
          )}
          <Avatar
            src={otherUser?.avatar}
            alt={`${otherUser?.firstName} ${otherUser?.lastName}`}
            sx={{
              width: 48,
              height: 48,
              fontSize: '1.2rem',
              fontWeight: 'bold',
            }}
          >
            {otherUser?.firstName?.[0]}{otherUser?.lastName?.[0]}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight="bold" noWrap>
              {otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown User'}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {otherUser?.email}
            </Typography>
          </Box>
          <Tooltip title="More options">
            <IconButton size="small">
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          backgroundColor: 'grey.50',
          width: '100%',
          minHeight: 0,
          maxHeight: '100%',
        }}
        ref={messagesContainerRef}
      >
        {/* Loading more messages indicator */}
        {loadingMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        
        {loading ? (
          // Loading skeletons
          Array.from({ length: 5 }).map((_, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Skeleton variant="circular" width={32} height={32} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" height={20} />
                <Skeleton variant="text" width="40%" height={16} />
              </Box>
            </Box>
          ))
        ) : messages.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: 'grey.100',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}
            >
              <Typography variant="h3" color="text.secondary">
                💬
              </Typography>
            </Box>
            <Typography variant="h6" color="text.primary" gutterBottom>
              No messages yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start the conversation by sending a message!
            </Typography>
          </Box>
        ) : (
          // SMOOTH MESSAGE RENDERING - Lightweight CSS animations
          messages.map((message, index) => {
            const isOwnMessage = message.senderId === currentUserId
            const isFirstMessage = index === 0
            const isLastMessage = index === messages.length - 1

            return (
              <Box
                key={message.id}
                ref={isFirstMessage ? firstMessageRef : isLastMessage ? lastMessageRef : null}
                sx={{
                  display: 'flex',
                  justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                  mb: 2,
                  width: '100%',
                  // Subtle slide-in animation for new messages
                  animation: 'slideInUp 0.3s ease-out',
                  '@keyframes slideInUp': {
                    '0%': {
                      opacity: 0,
                      transform: 'translateY(10px)',
                    },
                    '100%': {
                      opacity: 1,
                      transform: 'translateY(0)',
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: isOwnMessage ? 'row-reverse' : 'row',
                    alignItems: 'flex-end',
                    gap: 1,
                    maxWidth: { xs: '85%', sm: '70%' },
                    minWidth: 0,
                  }}
                >
                  {!isOwnMessage && (
                    <Avatar
                      src={message.sender.avatar}
                      alt={`${message.sender.firstName} ${message.sender.lastName}`}
                      sx={{ 
                        width: 32, 
                        height: 32,
                        fontSize: '0.875rem',
                        transition: 'transform 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.1)',
                        },
                      }}
                    >
                      {message.sender.firstName[0]}{message.sender.lastName[0]}
                    </Avatar>
                  )}
                  <Box>
                    <Paper
                      sx={{
                        p: 2,
                        backgroundColor: isOwnMessage ? 'primary.main' : 'white',
                        color: isOwnMessage ? 'primary.contrastText' : 'text.primary',
                        borderRadius: 3,
                        maxWidth: '100%',
                        minWidth: 0,
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        position: 'relative',
                        opacity: message.status === 'SENDING' ? 0.7 : 1,
                        // Smooth hover effect
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          transform: 'translateY(-1px)',
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          [isOwnMessage ? 'right' : 'left']: -8,
                          transform: 'translateY(-50%)',
                          width: 0,
                          height: 0,
                          borderStyle: 'solid',
                          borderWidth: '8px 0 8px 8px',
                          borderColor: `transparent transparent transparent ${isOwnMessage ? 'primary.main' : 'white'}`,
                          [isOwnMessage ? 'borderLeftColor' : 'borderRightColor']: isOwnMessage ? 'primary.main' : 'white',
                          [isOwnMessage ? 'borderRightColor' : 'borderLeftColor']: 'transparent',
                        },
                      }}
                    >
                      <Typography variant="body1" sx={{ lineHeight: 1.5, wordBreak: 'break-word' }}>
                        {message.content}
                      </Typography>
                    </Paper>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mt: 0.5,
                        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          opacity: 0.6,
                          fontSize: '0.75rem',
                          transition: 'opacity 0.2s ease',
                          '&:hover': {
                            opacity: 0.8,
                          },
                        }}
                      >
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </Typography>
                      {isOwnMessage && (
                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.8,
                            fontSize: '0.75rem',
                            transition: 'opacity 0.2s ease',
                            '&:hover': {
                              opacity: 1,
                            },
                          }}
                        >
                          {message.status === 'SENDING' ? '⏳' : 
                           message.status === 'READ' ? '✓✓' : 
                           message.status === 'DELIVERED' ? '✓✓' : '✓'}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Paper 
        sx={{ 
          p: 2, 
          borderTop: 1, 
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
          width: '100%',
          flexShrink: 0
        }}
      >
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', width: '100%' }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            sx={{
              flex: 1,
              minWidth: 0,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: 'background.paper',
                transition: 'all 0.2s ease',
                '&:hover': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                },
                '&.Mui-focused': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                    borderWidth: 2,
                  },
                },
              },
            }}
          />
          <Tooltip title="Send message">
            <span>
              <IconButton
                color="primary"
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || loading}
                sx={{ 
                  alignSelf: 'flex-end',
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                    transform: 'scale(1.05)',
                  },
                  '&:active': {
                    transform: 'scale(0.95)',
                  },
                  '&:disabled': {
                    backgroundColor: 'grey.300',
                    color: 'grey.500',
                    transform: 'none',
                  },
                }}
              >
                {loading ? <CircularProgress size={20} /> : <SendIcon />}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Paper>
    </Box>
  )
} 