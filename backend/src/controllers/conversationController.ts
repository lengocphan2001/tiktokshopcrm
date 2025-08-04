import { Request, Response } from 'express'
import { ConversationService } from '../services/conversationService'

export class ConversationController {
  private conversationService: ConversationService

  constructor() {
    this.conversationService = new ConversationService()
  }

  async getUserConversations(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id
      const conversations = await this.conversationService.getUserConversations(userId)

      res.json({
        success: true,
        data: conversations,
      })
    } catch (error: any) {
      console.error('Get user conversations error:', error)
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to get conversations',
      })
    }
  }

  async getConversationById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const userId = req.user!.id

      const conversation = await this.conversationService.getConversationById(id, userId)

      if (!conversation) {
        res.status(404).json({
          success: false,
          message: 'Conversation not found',
        })
        return
      }

      res.json({
        success: true,
        data: conversation,
      })
    } catch (error: any) {
      console.error('Get conversation by ID error:', error)
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to get conversation',
      })
    }
  }

  async createDirectConversation(req: Request, res: Response): Promise<void> {
    try {
      const { recipientId } = req.body
      const senderId = req.user!.id

      if (!recipientId) {
        res.status(400).json({
          success: false,
          message: 'Recipient ID is required',
        })
        return
      }

      if (senderId === recipientId) {
        res.status(400).json({
          success: false,
          message: 'Cannot create conversation with yourself',
        })
        return
      }

      const conversation = await this.conversationService.createDirectConversation(senderId, recipientId)

      res.status(201).json({
        success: true,
        message: 'Conversation created successfully',
        data: conversation,
      })
    } catch (error: any) {
      console.error('Create conversation error:', error)
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create conversation',
      })
    }
  }

  async getConversationWithUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params
      const currentUserId = req.user!.id

      const conversation = await this.conversationService.getConversationWithUser(currentUserId, userId)

      res.json({
        success: true,
        data: conversation,
      })
    } catch (error: any) {
      console.error('Get conversation with user error:', error)
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to get conversation',
      })
    }
  }
} 