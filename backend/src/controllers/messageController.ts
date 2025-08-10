import { Request, Response } from 'express'
import { MessageService } from '../services/messageService'
import { ConversationService } from '../services/conversationService'
import { sendToUser, sendToUsers } from '../index'

export class MessageController {
  private messageService: MessageService
  private conversationService: ConversationService

  constructor() {
    this.messageService = new MessageService()
    this.conversationService = new ConversationService()
  }

  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { content, recipientId, conversationId } = req.body
      const senderId = req.user!.id

      if (!content || content.trim() === '') {
        res.status(400).json({
          success: false,
          message: 'Message content is required',
        })
        return
      }

      let finalConversationId = conversationId

      // If no conversation ID provided, create or get conversation with recipient
      if (!conversationId && recipientId) {
        const conversation = await this.conversationService.createDirectConversation(senderId, recipientId)
        finalConversationId = conversation.id
      }

      const message = await this.messageService.sendMessage({
        content: content.trim(),
        senderId,
        recipientId,
        conversationId: finalConversationId,
      })

      // Get conversation participants and send message to them
      const conversation = await this.conversationService.getConversationById(finalConversationId, senderId)
      if (conversation) {
        const participantIds = conversation.participants
          .filter(p => p.user.id !== senderId) // Don't send to sender
          .map(p => p.user.id)
        
        // Send message to all participants
        sendToUsers(participantIds, {
          type: 'newMessage',
          message
        })
      }

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: message,
      })
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to send message',
      })
    }
  }

  async getConversationMessages(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params
      const userId = req.user!.id
      const { limit = 50, offset = 0 } = req.query

      const messages = await this.messageService.getConversationMessages(
        conversationId,
        userId,
        Number(limit),
        Number(offset)
      )

      res.json({
        success: true,
        data: messages,
      })
    } catch (error: any) {

      res.status(400).json({
        success: false,
        message: error.message || 'Failed to get messages',
      })
    }
  }

  async markMessageAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params
      const userId = req.user!.id

      const message = await this.messageService.markMessageAsRead(messageId, userId)

      res.json({
        success: true,
        message: 'Message marked as read',
        data: message,
      })
    } catch (error: any) {

      res.status(400).json({
        success: false,
        message: error.message || 'Failed to mark message as read',
      })
    }
  }

  async markConversationAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params
      const userId = req.user!.id

      await this.messageService.markConversationAsRead(conversationId, userId)

      res.json({
        success: true,
        message: 'Conversation marked as read',
      })
    } catch (error: any) {

      res.status(400).json({
        success: false,
        message: error.message || 'Failed to mark conversation as read',
      })
    }
  }

  async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id

      const count = await this.messageService.getUnreadCount(userId)

      res.json({
        success: true,
        data: { count },
      })
    } catch (error: any) {

      res.status(400).json({
        success: false,
        message: error.message || 'Failed to get unread count',
      })
    }
  }

  async searchMessages(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.query
      const userId = req.user!.id

      if (!query || typeof query !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Search query is required',
        })
        return
      }

      const messages = await this.messageService.searchMessages(userId, query)

      res.json({
        success: true,
        data: messages,
      })
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to search messages',
      })
    }
  }

  async deleteMessage(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params
      const userId = req.user!.id

      await this.messageService.deleteMessage(messageId, userId)

      res.json({
        success: true,
        message: 'Message deleted successfully',
      })
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete message',
      })
    }
  }
} 