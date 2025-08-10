import { PrismaClient, MessageType, MessageStatus } from '@prisma/client'
import { prisma } from '../config/database'

export class MessageService {
  private prisma: PrismaClient

  constructor() {
    this.prisma = prisma
  }

  async sendMessage(data: {
    content: string
    senderId: string
    recipientId?: string
    conversationId?: string
    type?: MessageType
  }) {
    return await this.prisma.message.create({
      data: {
        content: data.content,
        senderId: data.senderId,
        recipientId: data.recipientId,
        conversationId: data.conversationId,
        type: data.type || 'TEXT',
        status: 'SENT'
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        conversation: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true
                  }
                }
              }
            }
          }
        }
      }
    })
  }

  async getConversationMessages(conversationId: string, userId: string, limit = 50, offset = 0, before?: string) {
    // Verify user is part of conversation
    const participant = await this.prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
        isActive: true
      }
    })

    if (!participant) {
      throw new Error('User not part of conversation')
    }

    // Build where clause for cursor-based pagination
    const whereClause: any = {
      conversationId
    }

    // If cursor is provided, use it for pagination
    if (before) {
      whereClause.createdAt = {
        lt: new Date(before)
      }
    }

    return await this.prisma.message.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: before ? 0 : offset, // Only use skip if no cursor
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    })
  }

  async markMessageAsRead(messageId: string, userId: string) {
    const message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        recipientId: userId
      }
    })

    if (!message) {
      throw new Error('Message not found or not accessible')
    }

    return await this.prisma.message.update({
      where: {
        id: messageId
      },
      data: {
        status: 'READ'
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    })
  }

  async markConversationAsRead(conversationId: string, userId: string) {
    return await this.prisma.message.updateMany({
      where: {
        conversationId,
        recipientId: userId,
        status: {
          in: ['SENT', 'DELIVERED']
        }
      },
      data: {
        status: 'READ'
      }
    })
  }

  async getUnreadCount(userId: string) {
    return await this.prisma.message.count({
      where: {
        recipientId: userId,
        status: {
          in: ['SENT', 'DELIVERED']
        }
      }
    })
  }

  async searchMessages(userId: string, query: string) {
    return await this.prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: userId,
            content: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            recipientId: userId,
            content: {
              contains: query,
              mode: 'insensitive'
            }
          }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    })
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        senderId: userId
      }
    })

    if (!message) {
      throw new Error('Message not found or not accessible')
    }

    return await this.prisma.message.delete({
      where: {
        id: messageId
      }
    })
  }
} 