import { Router } from 'express'
import { NotificationController } from '../controllers/notificationController'
import { authenticateToken } from '../middleware/auth'

const router = Router()
const notificationController = new NotificationController()

// All routes require authentication
router.use(authenticateToken)

// Get user's notifications
router.get('/', notificationController.getNotifications.bind(notificationController))

// Get unread count
router.get('/unread-count', notificationController.getUnreadCount.bind(notificationController))

// Mark notification as read
router.put('/:id/read', notificationController.markNotificationAsRead.bind(notificationController))

// Mark all notifications as read
router.put('/mark-all-read', notificationController.markAllNotificationsAsRead.bind(notificationController))

// Delete notification
router.delete('/:id', notificationController.deleteNotification.bind(notificationController))

export default router 