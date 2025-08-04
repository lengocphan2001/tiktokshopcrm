'use client';

import * as React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  TextField,
  InputAdornment,
  Typography,
  Box,
  CircularProgress,
  Skeleton,
  Chip,
  Fade,
} from '@mui/material'
import { Search as SearchIcon, Person as PersonIcon } from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  role: string
}

interface UserSelectorProps {
  open: boolean
  onClose: () => void
  onUserSelect: (user: User) => void
  currentUserId: string
}

export const UserSelector: React.FC<UserSelectorProps> = ({
  open,
  onClose,
  onUserSelect,
  currentUserId,
}) => {
  const [users, setUsers] = React.useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = React.useState<User[]>([])
  const [loading, setLoading] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')

  const getAuthToken = () => {
    return localStorage.getItem('auth-token')
  }

  const fetchUsers = React.useCallback(async () => {
    try {
      setLoading(true)
      const token = getAuthToken()
      
      if (!token) {
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/users/messaging?page=1&limit=100`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`)
      }

      const data = await response.json()

      // Handle the correct response structure
      let allUsers: User[] = []
      if (data.success && data.data && data.data.users) {
        allUsers = data.data.users
      }

      // Filter out current user and ensure we have valid user objects
      const otherUsers = allUsers.filter((user: User) =>
        user && user.id && user.id !== currentUserId
      )

      setUsers(otherUsers)
      setFilteredUsers(otherUsers)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setUsers([])
      setFilteredUsers([])
    } finally {
      setLoading(false)
    }
  }, [currentUserId])

  React.useEffect(() => {
    if (open) {
      fetchUsers()
    }
  }, [open, fetchUsers])

  React.useEffect(() => {
    const filtered = users.filter(user =>
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [searchQuery, users])

  const handleUserSelect = (user: User) => {
    onUserSelect(user)
    onClose()
    setSearchQuery('')
  }

  const handleClose = () => {
    onClose()
    setSearchQuery('')
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Start New Conversation
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select a user to start messaging
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <TextField
          fullWidth
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: 'grey.50',
              '&:hover': {
                backgroundColor: 'grey.100',
              },
              '&.Mui-focused': {
                backgroundColor: 'background.paper',
              },
            },
          }}
        />

        {loading ? (
          <Box sx={{ py: 2 }}>
            {[1, 2, 3].map((i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Skeleton variant="circular" width={48} height={48} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="40%" height={16} />
                </Box>
              </Box>
            ))}
          </Box>
        ) : filteredUsers.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
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
              <PersonIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
            </Box>
            <Typography variant="h6" color="text.primary" gutterBottom>
              {searchQuery ? 'No users found' : 'No users available'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchQuery ? 'Try adjusting your search terms' : 'There are no other users in the system'}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            <AnimatePresence>
              {filteredUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ListItemButton
                    onClick={() => handleUserSelect(user)}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={user.avatar}
                        alt={`${user.firstName} ${user.lastName}`}
                        sx={{
                          width: 48,
                          height: 48,
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                        }}
                      >
                        {user.firstName[0]}{user.lastName[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {user.firstName} {user.lastName}
                          </Typography>
                          <Chip
                            label={user.role}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </motion.div>
              ))}
            </AnimatePresence>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={handleClose}
          variant="outlined"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
} 