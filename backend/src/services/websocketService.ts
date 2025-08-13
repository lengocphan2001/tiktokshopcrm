import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'

export interface NotificationPayload {
  id: string
  type: string
  title: string
  message: string
  taskId?: string
  createdAt: Date
  data?: any
}

export interface MessagePayload {
  id: string
  content: string
  type: 'TEXT' | 'SYSTEM' | 'NOTIFICATION'
  status: 'SENT' | 'DELIVERED' | 'READ'
  senderId: string
  conversationId: string
  createdAt: Date
  sender: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  }
}

export class WebSocketService {
  private io: SocketIOServer
  private userSockets: Map<string, string> = new Map() // userId -> socketId

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    })

    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: any) => {
      

      // Handle user authentication
      socket.on('authenticate', (userId: string) => {
        this.userSockets.set(userId, socket.id)
        
        
        // Join user to their personal room
        socket.join(`user:${userId}`)
      })

      // Handle joining conversation room
      socket.on('joinConversation', (conversationId: string) => {
        socket.join(`conversation:${conversationId}`)
        
      })

      // Handle leaving conversation room
      socket.on('leaveConversation', (conversationId: string) => {
        socket.leave(`conversation:${conversationId}`)
        
      })

      // Handle disconnection
      socket.on('disconnect', () => {
        // Remove user from the map
        for (const [userId, socketId] of this.userSockets.entries()) {
          if (socketId === socket.id) {
            this.userSockets.delete(userId)
            
            break
          }
        }
      })

      // Handle notification acknowledgment
      socket.on('markNotificationRead', (notificationId: string) => {
        // This will be handled by the notification controller
        socket.emit('notificationMarkedRead', { notificationId })
      })
    })
  }

  // Send notification to a specific user
  sendNotificationToUser(userId: string, notification: NotificationPayload) {
    const socketId = this.userSockets.get(userId)
    
    if (socketId) {
      this.io.to(socketId).emit('newNotification', notification)
    } else {
      
    }
  }

  // Send notification to multiple users
  sendNotificationToUsers(userIds: string[], notification: NotificationPayload) {
    userIds.forEach(userId => {
      this.sendNotificationToUser(userId, notification)
    })
  }

  // Broadcast to all connected users (for admin notifications)
  broadcastToAll(notification: NotificationPayload) {
    this.io.emit('broadcastNotification', notification)
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.userSockets.size
  }

  // Get all connected user IDs
  getConnectedUserIds(): string[] {
    return Array.from(this.userSockets.keys())
  }

  // Check if a user is connected
  isUserConnected(userId: string): boolean {
    return this.userSockets.has(userId)
  }

  // Send message to conversation participants
  sendMessageToConversation(conversationId: string, message: MessagePayload) {
    this.io.to(`conversation:${conversationId}`).emit('newMessage', message)
  }

  // Send message to specific user
  sendMessageToUser(userId: string, message: MessagePayload) {
    const socketId = this.userSockets.get(userId)
    
    if (socketId) {
      this.io.to(socketId).emit('newMessage', message)
      
    } else {
      
    }
  }

  // Update conversation for all participants
  updateConversationForParticipants(conversationId: string, conversation: any) {
    this.io.to(`conversation:${conversationId}`).emit('conversationUpdated', conversation)
  }
} 