import { Router } from 'express'
import { MessageController } from '../controllers/messageController'
import { authenticateToken } from '../middleware/auth'

const router = Router()
const messageController = new MessageController()

// All routes require authentication
router.use(authenticateToken)

// Send message
router.post('/', messageController.sendMessage.bind(messageController))

// Get conversation messages
router.get('/conversation/:conversationId', messageController.getConversationMessages.bind(messageController))

// Mark message as read
router.put('/:messageId/read', messageController.markMessageAsRead.bind(messageController))

// Mark conversation as read
router.put('/conversation/:conversationId/read', messageController.markConversationAsRead.bind(messageController))

// Get unread count
router.get('/unread-count', messageController.getUnreadCount.bind(messageController))

// Search messages
router.get('/search', messageController.searchMessages.bind(messageController))

// Delete message
router.delete('/:messageId', messageController.deleteMessage.bind(messageController))

export default router 