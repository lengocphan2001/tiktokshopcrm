import { NotificationService } from './notificationService'
import { WebSocketService, NotificationPayload } from './websocketService'

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
      console.log('Creating notification for task:', task.id)
      
      // Notify the assignee about the new task
      const notification = await this.notificationService.createNotification({
        userId: task.assigneeId,
        type: 'TASK_CREATED' as any,
        title: 'New Task Assigned',
        message: `${createdBy.firstName} ${createdBy.lastName} has assigned you a new task: "${task.name}"`,
        taskId: task.id,
        data: {
          taskName: task.name,
          createdBy: `${createdBy.firstName} ${createdBy.lastName}`,
          dueDate: task.endDate,
        },
      })

      console.log('Notification created in database:', notification.id)

      // Send real-time notification if WebSocket service is available
      if (this.wsService) {
        const payload: NotificationPayload = {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          taskId: notification.taskId || undefined,
          createdAt: notification.createdAt,
          data: notification.data ? JSON.parse(notification.data) : undefined,
        }

        console.log('Sending WebSocket notification to user:', task.assigneeId)
        this.wsService.sendNotificationToUser(task.assigneeId, payload)
      } else {
        console.log('WebSocket service not available, notification stored in database only')
      }
    } catch (error) {
      console.error('Error sending task created notification:', error)
      // Don't throw the error to avoid breaking the task creation
    }
  }

  async sendTaskUpdatedNotification(task: any, updatedBy: any, previousData?: any) {
    try {
      console.log('Creating notification for task update:', task.id)
      
      // Notify the assignee about task updates
      const notification = await this.notificationService.createNotification({
        userId: task.assigneeId,
        type: 'TASK_UPDATED' as any,
        title: 'Task Updated',
        message: `${updatedBy.firstName} ${updatedBy.lastName} has updated the task: "${task.name}"`,
        taskId: task.id,
        data: {
          taskName: task.name,
          updatedBy: `${updatedBy.firstName} ${updatedBy.lastName}`,
          changes: this.getTaskChanges(previousData, task),
        },
      })

      console.log('Update notification created in database:', notification.id)

      // Send real-time notification if WebSocket service is available
      if (this.wsService) {
        const payload: NotificationPayload = {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          taskId: notification.taskId || undefined,
          createdAt: notification.createdAt,
          data: notification.data ? JSON.parse(notification.data) : undefined,
        }

        console.log('Sending WebSocket update notification to user:', task.assigneeId)
        this.wsService.sendNotificationToUser(task.assigneeId, payload)
      }
    } catch (error) {
      console.error('Error sending task updated notification:', error)
      // Don't throw the error to avoid breaking the task update
    }
  }

  async sendTaskStatusChangedNotification(task: any, updatedBy: any, previousStatus: string) {
    try {
      console.log('Creating notification for status change:', task.id)
      
      // Notify the task creator about status changes
      const notification = await this.notificationService.createNotification({
        userId: task.createdById,
        type: 'TASK_STATUS_CHANGED' as any,
        title: 'Task Status Updated',
        message: `${updatedBy.firstName} ${updatedBy.lastName} has updated the status of task "${task.name}" from ${previousStatus} to ${task.status}`,
        taskId: task.id,
        data: {
          taskName: task.name,
          updatedBy: `${updatedBy.firstName} ${updatedBy.lastName}`,
          previousStatus,
          newStatus: task.status,
        },
      })

      console.log('Status change notification created in database:', notification.id)

      // Send real-time notification if WebSocket service is available
      if (this.wsService) {
        const payload: NotificationPayload = {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          taskId: notification.taskId || undefined,
          createdAt: notification.createdAt,
          data: notification.data ? JSON.parse(notification.data) : undefined,
        }

        console.log('Sending WebSocket status notification to user:', task.createdById)
        this.wsService.sendNotificationToUser(task.createdById, payload)
      }
    } catch (error) {
      console.error('Error sending task status changed notification:', error)
      // Don't throw the error to avoid breaking the task status update
    }
  }

  async sendTaskResultUpdatedNotification(task: any, updatedBy: any) {
    try {
      console.log('Creating notification for result update:', task.id)
      
      // Notify the task creator about result updates
      const notification = await this.notificationService.createNotification({
        userId: task.createdById,
        type: 'TASK_RESULT_UPDATED' as any,
        title: 'Task Result Updated',
        message: `${updatedBy.firstName} ${updatedBy.lastName} has updated the result for task "${task.name}"`,
        taskId: task.id,
        data: {
          taskName: task.name,
          updatedBy: `${updatedBy.firstName} ${updatedBy.lastName}`,
          result: task.result,
        },
      })

      console.log('Result update notification created in database:', notification.id)

      // Send real-time notification if WebSocket service is available
      if (this.wsService) {
        const payload: NotificationPayload = {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          taskId: notification.taskId || undefined,
          createdAt: notification.createdAt,
          data: notification.data ? JSON.parse(notification.data) : undefined,
        }

        console.log('Sending WebSocket result notification to user:', task.createdById)
        this.wsService.sendNotificationToUser(task.createdById, payload)
      }
    } catch (error) {
      console.error('Error sending task result updated notification:', error)
      // Don't throw the error to avoid breaking the task result update
    }
  }

  private getTaskChanges(previousData: any, currentData: any): any {
    if (!previousData) return {}

    const changes: any = {}
    
    if (previousData.name !== currentData.name) {
      changes.name = { from: previousData.name, to: currentData.name }
    }
    
    if (previousData.description !== currentData.description) {
      changes.description = { from: previousData.description, to: currentData.description }
    }
    
    if (previousData.startDate !== currentData.startDate) {
      changes.startDate = { from: previousData.startDate, to: currentData.startDate }
    }
    
    if (previousData.endDate !== currentData.endDate) {
      changes.endDate = { from: previousData.endDate, to: currentData.endDate }
    }

    return changes
  }
} 