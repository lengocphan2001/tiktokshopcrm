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
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`)

      // Handle user authentication
      socket.on('authenticate', (userId: string) => {
        this.userSockets.set(userId, socket.id)
        console.log(`User ${userId} authenticated with socket ${socket.id}`)
        
        // Join user to their personal room
        socket.join(`user:${userId}`)
      })

      // Handle disconnection
      socket.on('disconnect', () => {
        // Remove user from the map
        for (const [userId, socketId] of this.userSockets.entries()) {
          if (socketId === socket.id) {
            this.userSockets.delete(userId)
            console.log(`User ${userId} disconnected`)
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
      console.log(`Notification sent to user ${userId}: ${notification.title}`)
    } else {
      console.log(`User ${userId} is not connected`)
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
} 