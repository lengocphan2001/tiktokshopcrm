'use client';

import * as React from 'react'
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  TextField,
  Fade,
} from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import { MessageList } from './MessageList'
import { ChatWindow } from './ChatWindow'
import { UserSelector } from './UserSelector'

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

interface MessagingAppProps {
  conversations: Conversation[]
  currentConversation?: Conversation
  currentMessages: Message[]
  currentUserId: string
  loading?: boolean
  error?: string
  onConversationSelect: (conversation: Conversation) => void
  onSendMessage: (content: string) => void
  onStartConversation?: (user: User) => void
}

export const MessagingApp: React.FC<MessagingAppProps> = ({
  conversations,
  currentConversation,
  currentMessages,
  currentUserId,
  loading = false,
  error,
  onConversationSelect,
  onSendMessage,
  onStartConversation,
}) => {
  const [userSelectorOpen, setUserSelectorOpen] = React.useState(false)
  const [showConversationList, setShowConversationList] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState('')

  const handleUserSelect = (user: User) => {
    if (onStartConversation) {
      onStartConversation(user)
    }
  }

  const handleConversationSelect = (conversation: Conversation) => {
    onConversationSelect(conversation)
    setShowConversationList(false)
  }

  const handleBackToConversations = () => {
    setShowConversationList(true)
  }

  const filteredConversations = conversations.filter(conversation => {
    const otherParticipant = conversation.participants.find(p => p.user.id !== currentUserId)?.user
    if (!otherParticipant) return false
    
    const searchLower = searchQuery.toLowerCase()
    return (
      otherParticipant.firstName.toLowerCase().includes(searchLower) ||
      otherParticipant.lastName.toLowerCase().includes(searchLower) ||
      otherParticipant.email.toLowerCase().includes(searchLower)
    )
  })

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Header */}
      <Paper 
        sx={{ 
          p: 2, 
          borderBottom: 1, 
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
          zIndex: 2,
          flexShrink: 0
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Messages
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
          <IconButton
            color="primary"
            onClick={() => setUserSelectorOpen(true)}
            sx={{
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            }}
          >
            <AddIcon />
          </IconButton>
        </Box>
      </Paper>

      {error && (
        <Fade in={!!error}>
          <Alert 
            severity="error" 
            sx={{ 
              m: 2,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            {error}
          </Alert>
        </Fade>
      )}

      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Conversation List */}
        <Box sx={{ width: { xs: '100%', md: 320, lg: 400 }, minWidth: { md: 320, lg: 400 }, display: { xs: showConversationList ? 'flex' : 'none', md: 'flex' }, flexDirection: 'column', height: '100%' }}>
          <Paper
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 0,
              backgroundColor: 'grey.50',
              borderRight: 1,
              borderColor: 'divider',
            }}
          >
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', backgroundColor: 'background.paper', flexShrink: 0 }}>
              <Typography variant="h6" fontWeight="bold" color="text.primary" gutterBottom>
                Conversations
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'background.paper',
                  },
                }}
              />
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <MessageList
                  conversations={filteredConversations}
                  currentUserId={currentUserId}
                  selectedConversationId={currentConversation?.id}
                  onConversationSelect={handleConversationSelect}
                  loading={loading}
                />
              )}
            </Box>
          </Paper>
        </Box>

        {/* Chat Window */}
        <Box sx={{ flex: 1, display: { xs: !showConversationList ? 'flex' : 'none', md: 'flex' }, flexDirection: 'column' }}>
          <Paper
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 0,
              backgroundColor: 'background.paper',
              width: '100%',
            }}
          >
            <ChatWindow
              conversation={currentConversation}
              currentUserId={currentUserId}
              messages={currentMessages}
              loading={loading}
              onSendMessage={onSendMessage}
              onBackToConversations={handleBackToConversations}
            />
          </Paper>
        </Box>
      </Box>



      {/* User Selector Dialog */}
      <UserSelector
        open={userSelectorOpen}
        onClose={() => setUserSelectorOpen(false)}
        onUserSelect={handleUserSelect}
        currentUserId={currentUserId}
      />
    </Box>
  )
} 