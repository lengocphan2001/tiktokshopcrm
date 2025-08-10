import { NotificationService } from './notificationService'
import { WebSocketService, NotificationPayload } from './websocketService'
import { sendToUser } from '../index'

export class NotificationHelper {
  private notificationService: NotificationService
  private wsService?: WebSocketService

  constructor(wsService?: WebSocketService) {
    this.notificationService = new NotificationService()
    this.wsService = wsService
  }

  setWebSocketService(wsService: WebSocketService) {
    this.wsService = wsService
  }

  async sendTaskCreatedNotification(task: any, createdBy: any) {
    try {
      // Notify the assignee about the new task
      const notification = await this.notificationService.createNotification({
        userId: task.createdById,
        type: 'TASK_CREATED' as any,
        title: 'Task Created',
        message: `${createdBy.firstName} ${createdBy.lastName} created a task: "${task.name}" for ${task.assignee?.firstName || ''} ${task.assignee?.lastName || ''}`.trim(),
        taskId: task.id,
        data: {
          taskName: task.name,
          createdBy: `${createdBy.firstName} ${createdBy.lastName}`,
          dueDate: task.endDate,
        },
      })

      // Prepare real-time payload
      const payload: NotificationPayload = {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        taskId: notification.taskId || undefined,
        createdAt: notification.createdAt,
        data: notification.data ? JSON.parse(notification.data) : undefined,
      }

      // Send real-time notification via Socket.IO if available
      if (this.wsService) {
        this.wsService.sendNotificationToUser(task.createdById, payload)
      }

      // Also send via native WebSocket channel used by the frontend
      try {
        sendToUser(task.createdById, { type: 'newNotification', notification: payload })
      } catch (e) {
        // Non-blocking
      }
    } catch (error) {
      console.error('Error sending task created notification:', error)
      // Don't throw the error to avoid breaking the task creation
    }
  }

  async sendTaskUpdatedNotification(task: any, updatedBy: any, previousData?: any) {
    try {
      // Notify the assignee about task updates
      const notification = await this.notificationService.createNotification({
        userId: task.createdById,
        type: 'TASK_UPDATED' as any,
        title: 'Task Updated',
        message: `${updatedBy.firstName} ${updatedBy.lastName} updated the task: "${task.name}"`,
        taskId: task.id,
        data: {
          taskName: task.name,
          updatedBy: `${updatedBy.firstName} ${updatedBy.lastName}`,
          changes: this.getTaskChanges(previousData, task),
        },
      })

      const payload: NotificationPayload = {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        taskId: notification.taskId || undefined,
        createdAt: notification.createdAt,
        data: notification.data ? JSON.parse(notification.data) : undefined,
      }

      if (this.wsService) {
        this.wsService.sendNotificationToUser(task.createdById, payload)
      }
      try {
        sendToUser(task.createdById, { type: 'newNotification', notification: payload })
      } catch {}
    } catch (error) {
      console.error('Error sending task updated notification:', error)
      // Don't throw the error to avoid breaking the task update
    }
  }

  async sendTaskStatusChangedNotification(task: any, updatedBy: any, previousStatus: string) {
    try {
      const notification = await this.notificationService.createNotification({
        userId: task.createdById,
        type: 'TASK_STATUS_CHANGED' as any,
        title: 'Task Status Changed',
        message: `${task.name}: ${previousStatus} → ${task.status}`,
        taskId: task.id,
        data: {
          taskName: task.name,
          updatedBy: `${updatedBy.firstName} ${updatedBy.lastName}`,
          previousStatus,
          newStatus: task.status,
        },
      })

      const payload: NotificationPayload = {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        taskId: notification.taskId || undefined,
        createdAt: notification.createdAt,
        data: notification.data ? JSON.parse(notification.data) : undefined,
      }

      if (this.wsService) {
        this.wsService.sendNotificationToUser(task.createdById, payload)
      }
      try {
        sendToUser(task.createdById, { type: 'newNotification', notification: payload })
      } catch {}
    } catch (error) {
      console.error('Error sending task status changed notification:', error)
    }
  }

  async sendTaskResultUpdatedNotification(task: any, updatedBy: any) {
    try {
      const notification = await this.notificationService.createNotification({
        userId: task.createdById,
        type: 'TASK_RESULT_UPDATED' as any,
        title: 'Task Result Updated',
        message: `${updatedBy.firstName} ${updatedBy.lastName} updated the result for task: "${task.name}"`,
        taskId: task.id,
        data: {
          taskName: task.name,
          updatedBy: `${updatedBy.firstName} ${updatedBy.lastName}`,
          result: task.result,
        },
      })

      const payload: NotificationPayload = {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        taskId: notification.taskId || undefined,
        createdAt: notification.createdAt,
        data: notification.data ? JSON.parse(notification.data) : undefined,
      }

      if (this.wsService) {
        this.wsService.sendNotificationToUser(task.createdById, payload)
      }
      try {
        sendToUser(task.createdById, { type: 'newNotification', notification: payload })
      } catch {}
    } catch (error) {
      console.error('Error sending task result updated notification:', error)
    }
  }

  async sendTaskAssignedNotification(task: any, assignedBy: any) {
    try {
      const notification = await this.notificationService.createNotification({
        userId: task.createdById,
        type: 'TASK_ASSIGNED' as any,
        title: 'Task Assigned',
        message: `${assignedBy.firstName} ${assignedBy.lastName} assigned the task: "${task.name}" to ${task.assignee?.firstName || ''} ${task.assignee?.lastName || ''}`.trim(),
        taskId: task.id,
        data: {
          taskName: task.name,
          assignedBy: `${assignedBy.firstName} ${assignedBy.lastName}`,
          dueDate: task.endDate,
        },
      })

      const payload: NotificationPayload = {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        taskId: notification.taskId || undefined,
        createdAt: notification.createdAt,
        data: notification.data ? JSON.parse(notification.data) : undefined,
      }

      if (this.wsService) {
        this.wsService.sendNotificationToUser(task.createdById, payload)
      }
      try {
        sendToUser(task.createdById, { type: 'newNotification', notification: payload })
      } catch {}
    } catch (error) {
      console.error('Error sending task assigned notification:', error)
    }
  }

  private getTaskChanges(previousData: any, currentData: any): any {
    const changes: any = {}
    
    if (previousData && currentData) {
      const fields = ['name', 'description', 'startDate', 'endDate', 'status', 'result']
      
      fields.forEach(field => {
        if (previousData[field] !== currentData[field]) {
          changes[field] = {
            from: previousData[field],
            to: currentData[field]
          }
        }
      })
    }
    
    return changes
  }
} 