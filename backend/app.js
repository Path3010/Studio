const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const path = require('path')
const http = require('http')
const socketIo = require('socket.io')
const fs = require('fs')
require('dotenv').config()

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
})

const PORT = process.env.PORT || 3001

// Store socket.io instance for use in routes
app.set('io', io)

// Security middleware
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use('/api/', limiter)

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}
app.use(cors(corsOptions))

// Logging
app.use(morgan('combined'))

// Body parsing middleware
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Create necessary directories
const createDirectories = () => {
  const dirs = [
    path.join(__dirname, 'storage'),
    path.join(__dirname, 'storage/projects'),
    path.join(__dirname, 'temp'),
    path.join(__dirname, 'logs'),
    path.join(__dirname, 'uploads')
  ]
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
      console.log(`Created directory: ${dir}`)
    }
  })
}

createDirectories()

// Basic API Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/users', require('./routes/users'))
app.use('/api/projects', require('./routes/projects'))
app.use('/api/files', require('./routes/files'))
app.use('/api/execute', require('./routes/execution'))

// Enhanced API Routes (v2)
try {
  app.use('/api/v2/files', require('./routes/files_enhanced'))
  app.use('/api/v2/execution', require('./routes/execution_enhanced'))
  app.use('/api/v2/ai', require('./routes/ai_enhanced'))
} catch (error) {
  console.warn('Some enhanced routes not available:', error.message)
}

// Socket.IO connection handling for real-time collaboration
io.on('connection', (socket) => {
  console.log(`[Socket] User connected: ${socket.id}`)
  
  // Join project room for real-time collaboration
  socket.on('join:project', (projectId) => {
    socket.join(`project:${projectId}`)
    console.log(`[Socket] User ${socket.id} joined project: ${projectId}`)
    
    // Notify others in the project
    socket.to(`project:${projectId}`).emit('user:joined', {
      socketId: socket.id,
      timestamp: new Date()
    })
  })
  
  // Leave project room
  socket.on('leave:project', (projectId) => {
    socket.leave(`project:${projectId}`)
    console.log(`[Socket] User ${socket.id} left project: ${projectId}`)
    
    socket.to(`project:${projectId}`).emit('user:left', {
      socketId: socket.id,
      timestamp: new Date()
    })
  })
  
  // Real-time file editing collaboration
  socket.on('file:edit', (data) => {
    socket.to(`project:${data.projectId}`).emit('file:changed', {
      filePath: data.filePath,
      changes: data.changes,
      userId: socket.id,
      timestamp: new Date()
    })
  })
  
  // Share cursor positions
  socket.on('cursor:position', (data) => {
    socket.to(`project:${data.projectId}`).emit('cursor:update', {
      filePath: data.filePath,
      position: data.position,
      userId: socket.id,
      timestamp: new Date()
    })
  })
  
  // Code execution status sharing
  socket.on('execution:start', (data) => {
    socket.to(`project:${data.projectId}`).emit('execution:status', {
      status: 'running',
      executionId: data.executionId,
      language: data.language,
      userId: socket.id,
      timestamp: new Date()
    })
  })
  
  socket.on('execution:complete', (data) => {
    socket.to(`project:${data.projectId}`).emit('execution:status', {
      status: 'completed',
      executionId: data.executionId,
      success: data.success,
      output: data.output,
      userId: socket.id,
      timestamp: new Date()
    })
  })
  
  // AI assistance activity sharing
  socket.on('ai:query', (data) => {
    socket.to(`project:${data.projectId}`).emit('ai:activity', {
      type: 'query',
      query: data.query,
      userId: socket.id,
      timestamp: new Date()
    })
  })
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`[Socket] User disconnected: ${socket.id}`)
    
    // Notify all project rooms this user was in
    const rooms = Array.from(socket.rooms)
    rooms.forEach(room => {
      if (room.startsWith('project:')) {
        socket.to(room).emit('user:disconnected', {
          socketId: socket.id,
          timestamp: new Date()
        })
      }
    })
  })
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0',
    features: {
      realTimeCollaboration: true,
      aiIntegration: true,
      multiLanguageExecution: true,
      enhancedFileSystem: true
    }
  })
})

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'AI-Powered IDE Studio API',
    version: '2.0.0',
    description: 'Enhanced Backend API for AI-Powered IDE Studio',
    endpoints: {
      // Basic API v1
      auth: '/api/auth',
      users: '/api/users', 
      projects: '/api/projects',
      files: '/api/files',
      execution: '/api/execute',
      // Enhanced API v2
      filesV2: '/api/v2/files',
      executionV2: '/api/v2/execution',
      ai: '/api/v2/ai'
    },
    features: [
      'Real-time collaboration',
      'Multi-language code execution',
      'AI-powered assistance',
      'Advanced file management',
      'WebSocket communication',
      'Secure sandboxed execution'
    ]
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      '/api',
      '/health',
      '/api/auth',
      '/api/users',
      '/api/projects',
      '/api/files',
      '/api/execute',
      '/api/v2/files',
      '/api/v2/execution',
      '/api/v2/ai'
    ]
  })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack)
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  })
})

// Start enhanced server with Socket.IO
server.listen(PORT, () => {
  console.log(`🚀 Enhanced AI-Powered IDE Backend Server running on port ${PORT}`)
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🌐 API v1: http://localhost:${PORT}/api`)
  console.log(`🔥 API v2: http://localhost:${PORT}/api/v2`)
  console.log(`❤️  Health: http://localhost:${PORT}/health`)
  console.log(`🔌 Socket.IO enabled for real-time collaboration`)
  console.log(`🤖 AI services available at /api/v2/ai`)
  console.log(`📁 Enhanced file management at /api/v2/files`)
  console.log(`⚡ Multi-language execution at /api/v2/execution`)
  console.log(`📊 Storage: ${path.join(__dirname, 'storage')}`)
})

module.exports = { app, server, io }
