'use client';

import * as React from 'react'
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Alert,
} from '@mui/material'
import { Notifications as NotificationsIcon } from '@mui/icons-material'

export const NotificationPermission: React.FC = () => {
  const [permission, setPermission] = React.useState<NotificationPermission>('default')
  const [showDialog, setShowDialog] = React.useState(false)

  React.useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications')
      return
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      setShowDialog(false)
      
      if (result === 'granted') {
        // Show a test notification
        new Notification('Notifications Enabled', {
          body: 'You will now receive real-time notifications for task updates.',
          icon: '/favicon.ico',
        })
      }
    } catch (error) {
    }
  }

  const handleOpenDialog = () => {
    setShowDialog(true)
  }

  const handleCloseDialog = () => {
    setShowDialog(false)
  }

  if (permission === 'granted') {
    return null // Don't show anything if permission is already granted
  }

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<NotificationsIcon />}
        onClick={handleOpenDialog}
        size="small"
        sx={{ ml: 1 }}
      >
        Enable Notifications
      </Button>

      <Dialog open={showDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <NotificationsIcon sx={{ mr: 1 }} />
            Enable Push Notifications
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Get real-time notifications when:
          </Typography>
          <Box component="ul" sx={{ pl: 2, mb: 2 }}>
            <Typography component="li" variant="body2">
              Admin assigns you a new task
            </Typography>
            <Typography component="li" variant="body2">
              Task details are updated
            </Typography>
            <Typography component="li" variant="body2">
              Task status changes
            </Typography>
            <Typography component="li" variant="body2">
              Task results are updated
            </Typography>
          </Box>
          
          {permission === 'denied' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Notifications are currently blocked. Please enable them in your browser settings.
            </Alert>
          )}
          
          <Typography variant="body2" color="text.secondary">
            You can change this setting anytime in your browser preferences.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={requestPermission} 
            variant="contained"
            disabled={permission === 'denied'}
          >
            Enable Notifications
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
} 