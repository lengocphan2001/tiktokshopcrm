import { NotificationHelper } from './notificationHelper'
import { WebSocketService } from './websocketService'

class GlobalNotificationHelper {
  private notificationHelper: NotificationHelper
  private wsService?: WebSocketService

  constructor() {
    this.notificationHelper = new NotificationHelper()
  }

  setWebSocketService(wsService: WebSocketService) {
    this.wsService = wsService
    this.notificationHelper.setWebSocketService(wsService)
  }

  getNotificationHelper(): NotificationHelper {
    return this.notificationHelper
  }

  async sendTaskCreatedNotification(task: any, createdBy: any) {
    return await this.notificationHelper.sendTaskCreatedNotification(task, createdBy)
  }

  async sendTaskUpdatedNotification(task: any, updatedBy: any, previousData?: any) {
    return await this.notificationHelper.sendTaskUpdatedNotification(task, updatedBy, previousData)
  }

  async sendTaskStatusChangedNotification(task: any, updatedBy: any, previousStatus: string) {
    return await this.notificationHelper.sendTaskStatusChangedNotification(task, updatedBy, previousStatus)
  }

  async sendTaskResultUpdatedNotification(task: any, updatedBy: any) {
    return await this.notificationHelper.sendTaskResultUpdatedNotification(task, updatedBy)
  }
}

// Create a singleton instance
export const globalNotificationHelper = new GlobalNotificationHelper() 