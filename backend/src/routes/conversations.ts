import { Router } from 'express'
import { ConversationController } from '../controllers/conversationController'
import { authenticateToken } from '../middleware/auth'

const router = Router()
const conversationController = new ConversationController()

// All routes require authentication
router.use(authenticateToken)

// Get user's conversations
router.get('/', conversationController.getUserConversations.bind(conversationController))

// Get conversation by ID
router.get('/:id', conversationController.getConversationById.bind(conversationController))

// Create direct conversation
router.post('/', conversationController.createDirectConversation.bind(conversationController))

// Get conversation with specific user
router.get('/user/:userId', conversationController.getConversationWithUser.bind(conversationController))

export default router 