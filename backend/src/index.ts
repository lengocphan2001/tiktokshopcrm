import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { createServer } from 'http';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import taskTypeRoutes from './routes/taskTypes';
import { taskRoutes } from './routes/tasks';
import uploadRoutes from './routes/upload';
import notificationRoutes from './routes/notifications';
import { WebSocketService } from './services/websocketService';
import { globalNotificationHelper } from './services/globalNotificationHelper';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Initialize WebSocket service
export const wsService = new WebSocketService(server);

// Set up the global notification helper with WebSocket service
globalNotificationHelper.setWebSocketService(wsService);

console.log('🚀 WebSocket service initialized');
console.log('🔔 Global notification helper configured');

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (more lenient)
  message: 'Too many requests from this IP, please try again later.'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs (more lenient)
  message: 'Too many authentication attempts, please try again later.'
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

// Serve static files (avatars)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/task-types', taskTypeRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📡 WebSocket server ready for connections`)
}) 