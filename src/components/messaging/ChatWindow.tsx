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
} from '@mui/material'
import { Send as SendIcon, MoreVert as MoreVertIcon } from '@mui/icons-material'
import { formatDistanceToNow } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'

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
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  currentUserId,
  messages,
  loading = false,
  onSendMessage,
  onLoadMoreMessages,
}) => {
  const [newMessage, setNewMessage] = React.useState('')
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const [isTyping, setIsTyping] = React.useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim())
      setNewMessage('')
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

  const getOtherParticipant = () => {
    return conversation?.participants.find(p => p.user.id !== currentUserId)?.user
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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Paper 
        sx={{ 
          p: 2, 
          borderBottom: 1, 
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight="bold">
              {otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown User'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
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
        }}
      >
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
          <AnimatePresence>
            {messages.map((message, index) => {
              const isOwnMessage = message.senderId === currentUserId

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: isOwnMessage ? 'row-reverse' : 'row',
                        alignItems: 'flex-end',
                        gap: 1,
                        maxWidth: '70%',
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
                            wordBreak: 'break-word',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            position: 'relative',
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
                          <Typography variant="body1" sx={{ lineHeight: 1.5 }}>
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
                              }}
                            >
                              {message.status === 'READ' ? '✓✓' : message.status === 'DELIVERED' ? '✓✓' : '✓'}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </motion.div>
              )
            })}
          </AnimatePresence>
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
        }}
      >
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
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
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: 'background.paper',
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
            <IconButton
              color="primary"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || loading}
              sx={{ 
                alignSelf: 'flex-end',
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                '&:disabled': {
                  backgroundColor: 'grey.300',
                  color: 'grey.500',
                },
              }}
            >
              {loading ? <CircularProgress size={20} /> : <SendIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>
    </Box>
  )
} 