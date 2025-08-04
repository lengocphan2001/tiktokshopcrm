import { PrismaClient, NotificationStatus } from '@prisma/client'

export class NotificationService {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  async createNotification(data: {
    userId: string
    type: string
    title: string
    message: string
    taskId?: string
    data?: any
  }) {
    return await this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type as any,
        title: data.title,
        message: data.message,
        taskId: data.taskId,
        data: data.data ? JSON.stringify(data.data) : null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        task: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    })
  }

  async getNotificationsByUser(userId: string, limit = 50, offset = 0) {
    return await this.prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
      include: {
        task: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    })
  }

  async markNotificationAsRead(notificationId: string) {
    return await this.prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        status: NotificationStatus.READ,
      },
    })
  }

  async markAllNotificationsAsRead(userId: string) {
    return await this.prisma.notification.updateMany({
      where: {
        userId,
        status: NotificationStatus.UNREAD,
      },
      data: {
        status: NotificationStatus.READ,
      },
    })
  }

  async getUnreadCount(userId: string) {
    return await this.prisma.notification.count({
      where: {
        userId,
        status: NotificationStatus.UNREAD,
      },
    })
  }

  async deleteNotification(notificationId: string) {
    return await this.prisma.notification.delete({
      where: {
        id: notificationId,
      },
    })
  }

  async deleteOldNotifications(userId: string, daysOld = 30) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    return await this.prisma.notification.deleteMany({
      where: {
        userId,
        createdAt: {
          lt: cutoffDate,
        },
      },
    })
  }
} 