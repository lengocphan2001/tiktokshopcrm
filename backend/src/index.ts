import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { WebSocketServer, WebSocket } from 'ws'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

// Import routes
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import { taskRoutes } from './routes/tasks'
import taskTypeRoutes from './routes/taskTypes'
import conversationRoutes from './routes/conversations'
import messageRoutes from './routes/messages'
import notificationRoutes from './routes/notifications'
import uploadRoutes from './routes/upload'
import { timeRecordRoutes } from './routes/timeRecords'

// Import services
import { WebSocketService } from './services/websocketService'
import { globalNotificationHelper } from './services/globalNotificationHelper'

// Import middleware
import { authenticateToken } from './middleware/auth'

const app = express()
const server = createServer(app)
const prisma = new PrismaClient()

// Socket.IO server (for notifications)
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

// Native WebSocket server (for messaging)
const wss = new WebSocketServer({ 
  server,
  path: '/ws'
})

// Store connected users
const connectedUsers = new Map<string, WebSocket>()

// WebSocket connection handler
wss.on('connection', (ws, request) => {
  console.log('WebSocket client connected')
  
  // Extract token from URL query parameters
  const url = new URL(request.url!, `http://${request.headers.host}`)
  const token = url.searchParams.get('token')
  
  if (!token) {
    ws.close(1008, 'Authentication required')
    return
  }
  
  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const userId = decoded.userId
    
    // Store user connection
    connectedUsers.set(userId, ws)
    console.log(`User ${userId} connected via WebSocket`)
    
    // Send authentication success
    ws.send(JSON.stringify({
      type: 'authenticated',
      userId
    }))
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString())
        
        switch (message.type) {
          case 'authenticate':
            // Already authenticated, just confirm
            ws.send(JSON.stringify({
              type: 'authenticated',
              userId: message.userId
            }))
            break
            
          case 'joinConversation':
            // Handle joining conversation room
            console.log(`User ${userId} joined conversation: ${message.conversationId}`)
            break
            
          case 'leaveConversation':
            // Handle leaving conversation room
            console.log(`User ${userId} left conversation: ${message.conversationId}`)
            break
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    })
    
    ws.on('close', () => {
      connectedUsers.delete(userId)
      console.log(`User ${userId} disconnected`)
    })
    
  } catch (error) {
    console.error('WebSocket authentication error:', error)
    ws.close(1008, 'Invalid token')
  }
})

// Function to send message to specific user
export const sendToUser = (userId: string, data: any) => {
  const ws = connectedUsers.get(userId)
  if (ws && ws.readyState === 1) { // WebSocket.OPEN
    console.log(`Sending WebSocket message to user ${userId}:`, data.type)
    ws.send(JSON.stringify(data))
  } else {
    console.log(`User ${userId} not connected or WebSocket not ready (state: ${ws?.readyState})`)
  }
}

// Function to send message to multiple users
export const sendToUsers = (userIds: string[], data: any) => {
  userIds.forEach(userId => sendToUser(userId, data))
}

// Function to broadcast to all connected users
export const broadcastToAll = (data: any) => {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify(data))
    }
  })
}

// Initialize Socket.IO service for notifications
export const wsService = new WebSocketService(server)
globalNotificationHelper.setWebSocketService(wsService)

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Static file serving
app.use('/uploads', express.static('uploads'))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', authenticateToken, userRoutes)
app.use('/api/tasks', authenticateToken, taskRoutes)
app.use('/api/task-types', authenticateToken, taskTypeRoutes)
app.use('/api/conversations', authenticateToken, conversationRoutes)
app.use('/api/messages', authenticateToken, messageRoutes)
app.use('/api/notifications', authenticateToken, notificationRoutes)
app.use('/api/upload', authenticateToken, uploadRoutes)
app.use('/api/time-records', timeRecordRoutes)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`WebSocket server running on ws://localhost:${PORT}/ws`)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully')
  await prisma.$disconnect()
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
}) 