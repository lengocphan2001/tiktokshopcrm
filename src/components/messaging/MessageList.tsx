'use client';

import * as React from 'react'
import {
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Badge,
  Divider,
  Skeleton,
  Chip,
  Fade,
  Slide,
} from '@mui/material'
import { formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'

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

interface MessageListProps {
  conversations: Conversation[]
  currentUserId: string
  selectedConversationId?: string
  onConversationSelect: (conversation: Conversation) => void
  loading?: boolean
}

export const MessageList: React.FC<MessageListProps> = ({
  conversations,
  currentUserId,
  selectedConversationId,
  onConversationSelect,
  loading = false,
}) => {
  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants?.find(p => p?.user?.id !== currentUserId)?.user
  }

  const getLastMessage = (conversation: Conversation) => {
    return conversation.messages?.[0]
  }

  const getUnreadCount = (conversation: Conversation) => {
    return conversation.messages?.filter(
      msg => msg.sender?.id !== currentUserId && msg.status === 'SENT'
    ).length || 0
  }

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        {[1, 2, 3].map((i) => (
          <Box key={i} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
              <Skeleton variant="circular" width={48} height={48} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={16} />
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    )
  }

  if (conversations.length === 0) {
    return (
      <Box 
        sx={{ 
          p: 4, 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2
          }}
        >
          <Typography variant="h4" color="text.secondary">
            💬
          </Typography>
        </Box>
        <Typography variant="h6" color="text.primary" gutterBottom>
          No conversations yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Start a conversation to begin messaging
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 1 }}>
      {conversations.map((conversation, index) => {
        const otherUser = getOtherParticipant(conversation)
        const lastMessage = getLastMessage(conversation)
        const unreadCount = getUnreadCount(conversation)
        const isSelected = conversation.id === selectedConversationId

        return (
          <motion.div
            key={conversation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ListItemButton
              selected={isSelected}
              onClick={() => onConversationSelect(conversation)}
              sx={{
                borderRadius: 2,
                mb: 1,
                mx: 1,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'action.hover',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                },
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemText-primary': {
                    color: 'primary.contrastText',
                  },
                  '& .MuiListItemText-secondary': {
                    color: 'primary.contrastText',
                    opacity: 0.8,
                  },
                },
              }}
            >
              <ListItemAvatar>
                <Badge
                  badgeContent={unreadCount}
                  color="error"
                  invisible={unreadCount === 0}
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.75rem',
                      height: 20,
                      minWidth: 20,
                    },
                  }}
                >
                  <Avatar
                    src={otherUser?.avatar}
                    alt={`${otherUser?.firstName} ${otherUser?.lastName}`}
                    sx={{
                      width: 48,
                      height: 48,
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      backgroundColor: isSelected ? 'primary.contrastText' : 'primary.main',
                      color: isSelected ? 'primary.main' : 'primary.contrastText',
                    }}
                  >
                    {otherUser?.firstName?.[0]}{otherUser?.lastName?.[0]}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: unreadCount > 0 ? 700 : 500,
                        fontSize: '1rem',
                      }}
                    >
                      {otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown User'}
                    </Typography>
                    {unreadCount > 0 && (
                      <Chip
                        label={unreadCount}
                        size="small"
                        color="error"
                        sx={{
                          height: 20,
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                        }}
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 0.5 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: unreadCount > 0 ? 600 : 400,
                        opacity: 0.8,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {lastMessage ? (
                        <>
                          {lastMessage.sender?.id === currentUserId ? 'You: ' : ''}
                          {lastMessage.content}
                        </>
                      ) : (
                        'No messages yet'
                      )}
                    </Typography>
                    {lastMessage && (
                      <Typography
                        variant="caption"
                        sx={{
                          opacity: 0.6,
                          fontSize: '0.75rem',
                        }}
                      >
                        {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItemButton>
          </motion.div>
        )
      })}
    </Box>
  )
} 