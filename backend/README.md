# 🚀 Backend - AI-Powered IDE Server

A robust Node.js backend for the AI-powered IDE, providing file management, code execution, AI services, and real-time collaboration.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Run tests
npm test
```

## 🏗️ Architecture

### 📁 Project Structure
```
├── app.js              # Main application entry point
├── routes/             # API route handlers
│   ├── files_enhanced.js    # Advanced file operations
│   ├── execution_enhanced.js # Code execution endpoints
│   ├── ai_enhanced.js       # AI service endpoints
│   ├── projects.js          # Project management
│   ├── auth.js             # Authentication
│   └── users.js            # User management
├── services/           # Business logic services
│   └── CodeExecutionService.js # Code execution engine
├── middleware/         # Custom middleware
├── models/            # Data models
├── config/            # Configuration files
└── storage/           # File storage
    └── projects/      # Project files
```

### 🎯 Key Features

#### **File Management API**
- **Enhanced File Operations**: Create, read, update, delete files
- **Real-time Sync**: Socket.IO integration for live collaboration
- **Project Management**: Workspace and project organization
- **Version Control**: File history and backup system
- **Search**: Full-text search across files

#### **Code Execution Engine**
- **Multi-language Support**: JavaScript, TypeScript, Python, HTML, CSS
- **VM2 Sandboxing**: Secure code execution environment
- **Performance Monitoring**: Execution time and memory tracking
- **Error Handling**: Comprehensive error reporting
- **Input/Output**: Support for user input and formatted output

#### **AI Services Integration**
- **Multiple Providers**: OpenAI, Claude (Anthropic), HuggingFace
- **Chat Interface**: Interactive AI conversations
- **Code Analysis**: Intelligent code review and suggestions
- **Code Generation**: AI-powered code creation
- **Bug Detection**: Automated error finding and fixing

#### **Real-time Collaboration**
- **Socket.IO Server**: WebSocket communication
- **Live Editing**: Multi-user collaborative editing
- **Project Rooms**: Isolated collaboration spaces
- **User Presence**: See who's online and editing
- **Conflict Resolution**: Merge conflict handling

## 🔧 Technology Stack

### **Core Framework**
- **Node.js 18+** - JavaScript runtime
- **Express.js** - Web application framework
- **Socket.IO** - Real-time bidirectional communication
- **VM2** - Secure code execution sandbox

### **AI Integration**
- **OpenAI SDK** - GPT models integration
- **Axios** - HTTP client for AI API calls
- **Multiple Provider Support** - Extensible AI architecture

### **Development Tools**
- **Nodemon** - Development server with auto-restart
- **Express Validator** - Input validation middleware
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

### **Security & Performance**
- **Rate Limiting** - API call protection
- **Input Validation** - Secure data handling
- **Error Handling** - Comprehensive error management
- **Logging** - Request and error logging

## ⚙️ Configuration

### **Environment Variables**
Create `.env` file in backend directory:
```env
PORT=3001
NODE_ENV=development

# AI Service Keys
OPENAI_API_KEY=your_openai_key
CLAUDE_API_KEY=your_claude_key
HUGGINGFACE_API_KEY=your_huggingface_key

# Database (if using)
DATABASE_URL=your_database_url

# Security
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret

# File Storage
UPLOAD_PATH=./storage/uploads
MAX_FILE_SIZE=10485760

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### **Server Configuration**
```javascript
// app.js configuration
const config = {
  port: process.env.PORT || 3001,
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
    credentials: true
  },
  socketIO: {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  }
}
```

## 🔌 API Endpoints

### **Files API** (`/api/v2/files`)
```http
GET    /api/v2/files/                    # Get all files
GET    /api/v2/files/tree/:projectId     # Get file tree
GET    /api/v2/files/:projectId/*        # Read file content
POST   /api/v2/files/save/:projectId/*   # Save file content
POST   /api/v2/files/create/:projectId/* # Create new file
DELETE /api/v2/files/:projectId/*        # Delete file
POST   /api/v2/files/upload/:projectId   # Upload files
GET    /api/v2/files/search/:projectId   # Search in files
```

### **Code Execution API** (`/api/v2/execute`)
```http
POST   /api/v2/execute                   # Execute code
GET    /api/v2/execute/languages         # Get supported languages
POST   /api/v2/execute/validate          # Validate code syntax
GET    /api/v2/execute/status/:id        # Get execution status
```

### **AI Services API** (`/api/v2/ai`)
```http
POST   /api/v2/ai/chat                   # AI chat conversation
POST   /api/v2/ai/complete               # Code completion
POST   /api/v2/ai/analyze                # Code analysis
POST   /api/v2/ai/generate               # Code generation
POST   /api/v2/ai/debug                  # Debug assistance
GET    /api/v2/ai/providers              # Available AI providers
```

### **Project Management** (`/api/v2/projects`)
```http
GET    /api/v2/projects                  # List projects
POST   /api/v2/projects                  # Create project
GET    /api/v2/projects/:id              # Get project details
PUT    /api/v2/projects/:id              # Update project
DELETE /api/v2/projects/:id              # Delete project
```

## 🔐 Security Features

### **Input Validation**
- Express-validator for all inputs
- File type and size restrictions
- Code execution sandboxing
- XSS and injection protection

### **Rate Limiting**
- API endpoint rate limiting
- Code execution throttling
- File upload size limits
- Concurrent connection limits

### **Code Execution Security**
- VM2 sandbox isolation
- Memory and CPU limits
- Timeout protection
- File system access control

## 🚀 Deployment

### **Development**
```bash
# Start with nodemon
npm run dev

# Debug mode
npm run debug

# Watch for changes
npm run watch
```

### **Production**
```bash
# Build and start
npm run build
npm start

# PM2 process manager
pm2 start app.js --name "ide-backend"

# Docker deployment
docker build -t ide-backend .
docker run -p 3001:3001 ide-backend
```

### **Environment Setup**
```bash
# Create storage directories
mkdir -p storage/projects
mkdir -p storage/uploads
mkdir -p storage/temp

# Set permissions
chmod 755 storage
chmod 755 storage/*
```

## 🧪 Testing

### **Unit Tests**
```bash
# Run all tests
npm test

# Run specific test file
npm test tests/files.test.js

# Coverage report
npm run test:coverage
```

### **API Testing**
```bash
# Test API endpoints
curl -X GET http://localhost:3001/api/v2/files/
curl -X POST http://localhost:3001/api/v2/execute \
  -H "Content-Type: application/json" \
  -d '{"language":"javascript","code":"console.log(\"Hello World\")"}'
```

### **Load Testing**
```bash
# Stress test with Apache Bench
ab -n 1000 -c 10 http://localhost:3001/api/v2/files/

# Socket.IO load test
npm run test:socket-load
```

## 📊 Monitoring & Logging

### **Health Checks**
```http
GET /health              # Basic health check
GET /api/v2/status       # Detailed system status
GET /metrics             # Performance metrics
```

### **Logging**
- Request/response logging
- Error tracking and reporting
- Performance monitoring
- Security event logging

### **Metrics**
- API response times
- Code execution statistics
- Memory and CPU usage
- Connection counts

## 🔧 Maintenance

### **File Management**
```bash
# Clean temporary files
npm run clean:temp

# Backup project files
npm run backup:projects

# Optimize storage
npm run optimize:storage
```

### **Database Maintenance**
```bash
# Database backup (if using)
npm run db:backup

# Database migration
npm run db:migrate

# Database cleanup
npm run db:cleanup
```

## 🚨 Troubleshooting

### **Common Issues**

#### **Port Already in Use**
```bash
# Kill process on port 3001
npx kill-port 3001

# Find process using port
netstat -ano | findstr :3001
```

#### **Socket.IO Connection Issues**
- Check CORS configuration
- Verify client URL matches server
- Ensure firewall allows connections

#### **Code Execution Failures**
- Check VM2 sandbox configuration
- Verify system permissions
- Monitor memory usage

#### **File Operation Errors**
- Check storage directory permissions
- Verify disk space availability
- Review file path validation

### **Debug Mode**
```bash
# Enable debug logging
DEBUG=* npm run dev

# Specific debug namespaces
DEBUG=express:*,socket.io:* npm run dev
```

## 📈 Performance Optimization

### **Caching**
- In-memory file caching
- Code execution result caching
- AI response caching
- Static asset caching

### **Optimization Tips**
- Use clustering for multiple cores
- Implement connection pooling
- Optimize file I/O operations
- Monitor memory usage

## 🤝 Contributing

1. Follow Node.js best practices
2. Use consistent error handling
3. Add proper input validation
4. Write comprehensive tests
5. Update API documentation

## 📚 Resources

- [Express.js Documentation](https://expressjs.com/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [VM2 Documentation](https://github.com/patriksimek/vm2)
- [OpenAI API Reference](https://platform.openai.com/docs/)

---

**Built for scalable and secure development environments**
