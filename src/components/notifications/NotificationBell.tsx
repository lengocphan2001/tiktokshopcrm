'use client';

import * as React from 'react'
import {
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Button,
  Divider,
  Chip,
  Tooltip,
  ListItemButton,
} from '@mui/material'
import { Notifications as NotificationsIcon } from '@mui/icons-material'
import { useWebSocket } from '../../contexts/WebSocketContext'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
  id: string
  type: 'TASK_CREATED' | 'TASK_UPDATED' | 'TASK_STATUS_CHANGED' | 'TASK_RESULT_UPDATED' | 'TASK_ASSIGNED'
  title: string
  message: string
  taskId?: string
  createdAt: Date
  data?: any
  status?: 'UNREAD' | 'READ'
}

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'TASK_CREATED':
      return 'primary'
    case 'TASK_UPDATED':
      return 'info'
    case 'TASK_STATUS_CHANGED':
      return 'warning'
    case 'TASK_RESULT_UPDATED':
      return 'success'
    case 'TASK_ASSIGNED':
      return 'secondary'
    default:
      return 'default'
  }
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'TASK_CREATED':
      return '📋'
    case 'TASK_UPDATED':
      return '✏️'
    case 'TASK_STATUS_CHANGED':
      return '🔄'
    case 'TASK_RESULT_UPDATED':
      return '✅'
    case 'TASK_ASSIGNED':
      return '👤'
    default:
      return '📢'
  }
}

export const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markNotificationAsRead, markAllNotificationsAsRead, isConnected } = useWebSocket()
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Don't mark as read if already read
      if (notification.status === 'READ') {
        // If notification has a taskId, navigate to the task
        if (notification.taskId) {
          // You can implement navigation here
        }
        return
      }

      await markNotificationAsRead(notification.id)
      
      // If notification has a taskId, navigate to the task
      if (notification.taskId) {
        // You can implement navigation here
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead()
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const open = Boolean(anchorEl)
  const id = open ? 'notification-popover' : undefined

  return (
    <>
      <Tooltip title={isConnected ? 'Connected to notifications' : 'Disconnected from notifications'}>
        <IconButton
          color="inherit"
          onClick={handleClick}
          sx={{ 
            position: 'relative',
            opacity: isConnected ? 1 : 0.6,
          }}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Notifications</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!isConnected && (
                <Chip 
                  label="Disconnected" 
                  size="small" 
                  color="error" 
                  variant="outlined"
                />
              )}
              {unreadCount > 0 && (
                <Button size="small" onClick={handleMarkAllRead}>
                  Mark all read
                </Button>
              )}
            </Box>
          </Box>

          {notifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body2" color="text.secondary">
                {isConnected ? 'No notifications' : 'Connecting to notifications...'}
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.slice(0, 10).map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItemButton
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                      backgroundColor: notification.status === 'UNREAD' ? 'action.hover' : 'transparent',
                      opacity: notification.status === 'READ' ? 0.7 : 1,
                      cursor: notification.status === 'READ' ? 'default' : 'pointer',
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {getNotificationIcon(notification.type)}
                        </Typography>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            flexGrow: 1,
                            fontWeight: notification.status === 'UNREAD' ? 'bold' : 'normal',
                            color: notification.status === 'READ' ? 'text.secondary' : 'text.primary',
                          }}
                        >
                          {notification.title}
                        </Typography>
                        <Chip
                          label={notification.type.replace('_', ' ')}
                          size="small"
                          color={getNotificationColor(notification.type) as any}
                          sx={{ 
                            fontSize: '0.7rem',
                            opacity: notification.status === 'READ' ? 0.6 : 1,
                          }}
                        />
                      </Box>
                      
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 1,
                          opacity: notification.status === 'READ' ? 0.7 : 1,
                        }}
                      >
                        {notification.message}
                      </Typography>
                      
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{
                          opacity: notification.status === 'READ' ? 0.6 : 1,
                        }}
                      >
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </Typography>
                    </Box>
                  </ListItemButton>
                  {index < notifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  )
} 