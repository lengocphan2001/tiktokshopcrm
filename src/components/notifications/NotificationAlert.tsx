'use client';

import * as React from 'react'
import {
  Snackbar,
  Alert,
  AlertTitle,
  Box,
  Typography,
  Avatar,
} from '@mui/material'
import {
  Assignment as AssignmentIcon,
  Edit as EditIcon,
  Autorenew as AutorenewIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material'
import { useWebSocket } from '../../contexts/WebSocketContext'

interface Notification {
  id: string
  type: 'TASK_CREATED' | 'TASK_UPDATED' | 'TASK_STATUS_CHANGED' | 'TASK_RESULT_UPDATED' | 'TASK_ASSIGNED'
  title: string
  message: string
  taskId?: string
  createdAt: Date
  data?: any
}

const getNotificationSeverity = (type: string) => {
  switch (type) {
    case 'TASK_CREATED':
      return 'info'
    case 'TASK_UPDATED':
      return 'info'
    case 'TASK_STATUS_CHANGED':
      return 'warning'
    case 'TASK_RESULT_UPDATED':
      return 'success'
    case 'TASK_ASSIGNED':
      return 'info'
    default:
      return 'info'
  }
}

const NotificationTypeIcon: React.FC<{ type: string }> = ({ type }) => {
  let IconComp = NotificationsIcon
  let color: string = 'primary.main'

  switch (type) {
    case 'TASK_CREATED':
      IconComp = AssignmentIcon
      color = 'info.main'
      break
    case 'TASK_UPDATED':
      IconComp = EditIcon
      color = 'info.main'
      break
    case 'TASK_STATUS_CHANGED':
      IconComp = AutorenewIcon
      color = 'warning.main'
      break
    case 'TASK_RESULT_UPDATED':
      IconComp = CheckCircleIcon
      color = 'success.main'
      break
    case 'TASK_ASSIGNED':
      IconComp = PersonIcon
      color = 'secondary.main'
      break
  }

  return (
    <Avatar sx={{ bgcolor: color, width: 28, height: 28 }}>
      <IconComp sx={{ fontSize: 18, color: 'common.white' }} />
    </Avatar>
  )
}

// Create audio context for notification sounds
const createNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2)
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  } catch (error) {
    // Audio notification not supported
  }
}

export const NotificationAlert: React.FC = () => {
  const { notifications } = useWebSocket()
  const [open, setOpen] = React.useState(false)
  const [currentNotification, setCurrentNotification] = React.useState<Notification | null>(null)
  const [lastNotificationId, setLastNotificationId] = React.useState<string | null>(null)
  const [initialLoadComplete, setInitialLoadComplete] = React.useState(false)
  const [initialNotificationIds, setInitialNotificationIds] = React.useState<Set<string>>(new Set())

  // Track initial notifications to avoid showing alerts for existing ones
  React.useEffect(() => {
    if (notifications.length > 0 && !initialLoadComplete) {
      const initialIds = new Set(notifications.map(n => n.id))
      setInitialNotificationIds(initialIds)
      setInitialLoadComplete(true)
    }
  }, [notifications, initialLoadComplete])

  React.useEffect(() => {
    if (notifications.length > 0 && initialLoadComplete) {
      const latestNotification = notifications[0]
      
      // Only show alert for truly new notifications (not from initial load)
      if (latestNotification.id !== lastNotificationId && !initialNotificationIds.has(latestNotification.id)) {
        setCurrentNotification(latestNotification)
        setLastNotificationId(latestNotification.id)
        setOpen(true)
        
        // Play notification sound
        createNotificationSound()
      }
    }
  }, [notifications, lastNotificationId, initialLoadComplete, initialNotificationIds])

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
  }

  const handleNotificationClick = () => {
    if (currentNotification?.taskId) {
      // You can implement navigation here
    }
    setOpen(false)
  }

  if (!currentNotification) return null

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{ mt: 8 }} // Add margin top to avoid navbar
    >
      <Alert
        onClose={handleClose}
        severity={getNotificationSeverity(currentNotification.type)}
        variant="filled"
        sx={{ 
          width: '100%',
          cursor: 'pointer',
          '&:hover': {
            opacity: 0.9,
          },
          minWidth: 300,
          maxWidth: 400,
        }}
        onClick={handleNotificationClick}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationTypeIcon type={currentNotification.type} />
          <Box sx={{ flexGrow: 1 }}>
            <AlertTitle sx={{ fontSize: '0.9rem', mb: 0.5 }}>
              {currentNotification.title}
            </AlertTitle>
            <Typography variant="body2" sx={{ fontSize: '0.8rem', opacity: 0.9 }}>
              {currentNotification.message}
            </Typography>
          </Box>
          {/* Chip removed for cleaner look */}
        </Box>
      </Alert>
    </Snackbar>
  )
} 