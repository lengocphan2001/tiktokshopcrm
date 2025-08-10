import { PrismaClient } from '@prisma/client'
import { prisma } from '../config/database'

export class ConversationService {
  private prisma: PrismaClient

  constructor() {
    this.prisma = prisma
  }

  async createDirectConversation(userId1: string, userId2: string) {
    // Check if conversation already exists
    const existingConversation = await this.prisma.conversation.findFirst({
      where: {
        type: 'DIRECT',
        participants: {
          every: {
            userId: {
              in: [userId1, userId2]
            }
          }
        }
      },
      include: {
        participants: true
      }
    })

    if (existingConversation) {
      return existingConversation
    }

    // Create new conversation
    const conversation = await this.prisma.conversation.create({
      data: {
        type: 'DIRECT',
        participants: {
          create: [
            { userId: userId1 },
            { userId: userId2 }
          ]
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true
              }
            }
          }
        }
      }
    })

    return conversation
  }

  async getUserConversations(userId: string) {
    return await this.prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId,
            isActive: true
          }
        },
        isActive: true
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true
              }
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })
  }

  async getConversationById(conversationId: string, userId: string) {
    return await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            userId,
            isActive: true
          }
        },
        isActive: true
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true
              }
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: 'asc'
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
        }
      }
    })
  }

  async getConversationWithUser(currentUserId: string, otherUserId: string) {
    return await this.prisma.conversation.findFirst({
      where: {
        type: 'DIRECT',
        participants: {
          every: {
            userId: {
              in: [currentUserId, otherUserId]
            }
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true
              }
            }
          }
        }
      }
    })
  }
} 