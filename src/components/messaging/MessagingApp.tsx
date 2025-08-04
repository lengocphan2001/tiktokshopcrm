'use client';

import * as React from 'react'
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Fab,
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

  const handleUserSelect = (user: User) => {
    if (onStartConversation) {
      onStartConversation(user)
    }
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Header */}
      <Paper 
        sx={{ 
          p: 3, 
          borderBottom: 1, 
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
          zIndex: 2
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Messages
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setUserSelectorOpen(true)}
            size="large"
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            New Conversation
          </Button>
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

      <Grid container sx={{ flex: 1, overflow: 'hidden' }}>
        {/* Conversation List */}
        <Grid item xs={12} md={4} lg={3}>
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
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', backgroundColor: 'background.paper' }}>
              <Typography variant="h6" fontWeight="bold" color="text.primary">
                Conversations
              </Typography>
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <MessageList
                  conversations={conversations}
                  currentUserId={currentUserId}
                  selectedConversationId={currentConversation?.id}
                  onConversationSelect={onConversationSelect}
                  loading={loading}
                />
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Chat Window */}
        <Grid item xs={12} md={8} lg={9}>
          <Paper
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 0,
              backgroundColor: 'background.paper',
            }}
          >
            <ChatWindow
              conversation={currentConversation}
              currentUserId={currentUserId}
              messages={currentMessages}
              loading={loading}
              onSendMessage={onSendMessage}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Floating Action Button for Mobile */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
        <Fab
          color="primary"
          onClick={() => setUserSelectorOpen(true)}
          sx={{
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
              transform: 'scale(1.05)',
            },
          }}
        >
          <AddIcon />
        </Fab>
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