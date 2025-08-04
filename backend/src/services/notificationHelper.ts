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

        this.wsService.sendNotificationToUser(task.assigneeId, payload)
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

        this.wsService.sendNotificationToUser(task.assigneeId, payload)
      }
    } catch (error) {
      console.error('Error sending task updated notification:', error)
      // Don't throw the error to avoid breaking the task update
    }
  }

  async sendTaskStatusChangedNotification(task: any, updatedBy: any, previousStatus: string) {
    try {
      const notification = await this.notificationService.createNotification({
        userId: task.assigneeId,
        type: 'TASK_STATUS_CHANGED' as any,
        title: 'Task Status Changed',
        message: `${updatedBy.firstName} ${updatedBy.lastName} has changed the status of task "${task.name}" from ${previousStatus} to ${task.status}`,
        taskId: task.id,
        data: {
          taskName: task.name,
          updatedBy: `${updatedBy.firstName} ${updatedBy.lastName}`,
          previousStatus,
          newStatus: task.status,
        },
      })

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

        this.wsService.sendNotificationToUser(task.assigneeId, payload)
      }
    } catch (error) {
      console.error('Error sending task status changed notification:', error)
    }
  }

  async sendTaskResultUpdatedNotification(task: any, updatedBy: any) {
    try {
      const notification = await this.notificationService.createNotification({
        userId: task.assigneeId,
        type: 'TASK_RESULT_UPDATED' as any,
        title: 'Task Result Updated',
        message: `${updatedBy.firstName} ${updatedBy.lastName} has updated the result for task: "${task.name}"`,
        taskId: task.id,
        data: {
          taskName: task.name,
          updatedBy: `${updatedBy.firstName} ${updatedBy.lastName}`,
          result: task.result,
        },
      })

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

        this.wsService.sendNotificationToUser(task.assigneeId, payload)
      }
    } catch (error) {
      console.error('Error sending task result updated notification:', error)
    }
  }

  async sendTaskAssignedNotification(task: any, assignedBy: any) {
    try {
      const notification = await this.notificationService.createNotification({
        userId: task.assigneeId,
        type: 'TASK_ASSIGNED' as any,
        title: 'Task Assigned',
        message: `${assignedBy.firstName} ${assignedBy.lastName} has assigned you the task: "${task.name}"`,
        taskId: task.id,
        data: {
          taskName: task.name,
          assignedBy: `${assignedBy.firstName} ${assignedBy.lastName}`,
          dueDate: task.endDate,
        },
      })

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

        this.wsService.sendNotificationToUser(task.assigneeId, payload)
      }
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