import { Request, Response } from 'express'
import { NotificationService } from '../services/notificationService'

export class NotificationController {
  private notificationService: NotificationService

  constructor() {
    this.notificationService = new NotificationService()
  }

  async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id
      const { limit = 50, offset = 0 } = req.query

      const notifications = await this.notificationService.getNotificationsByUser(
        userId,
        Number(limit),
        Number(offset)
      )

      res.json({
        success: true,
        data: notifications,
      })
    } catch (error: any) {
      console.error('Get notifications error:', error)
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to get notifications',
      })
    }
  }

  async markNotificationAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const userId = req.user!.id

      const notification = await this.notificationService.markNotificationAsRead(id)

      res.json({
        success: true,
        message: 'Notification marked as read',
        data: notification,
      })
    } catch (error: any) {
      console.error('Mark notification as read error:', error)
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to mark notification as read',
      })
    }
  }

  async markAllNotificationsAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id

      await this.notificationService.markAllNotificationsAsRead(userId)

      res.json({
        success: true,
        message: 'All notifications marked as read',
      })
    } catch (error: any) {
      console.error('Mark all notifications as read error:', error)
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to mark all notifications as read',
      })
    }
  }

  async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id

      const count = await this.notificationService.getUnreadCount(userId)

      res.json({
        success: true,
        data: { count },
      })
    } catch (error: any) {
      console.error('Get unread count error:', error)
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to get unread count',
      })
    }
  }

  async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      await this.notificationService.deleteNotification(id)

      res.json({
        success: true,
        message: 'Notification deleted successfully',
      })
    } catch (error: any) {
      console.error('Delete notification error:', error)
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete notification',
      })
    }
  }
} 