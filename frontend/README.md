# 🎨 Frontend - AI-Powered IDE

A modern React-based frontend for the AI-powered IDE, built with Vite and featuring a VS Code-like interface.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🏗️ Architecture

### 📁 Project Structure
```
src/
├── components/          # React components
│   ├── AI/             # AI chat and assistance components
│   ├── Auth/           # Authentication components
│   ├── Editor/         # Monaco editor and related components
│   ├── Panels/         # IDE panels (file explorer, terminal, etc.)
│   ├── Terminal/       # Integrated terminal components
│   └── UI/             # Core UI components (sidebar, statusbar, etc.)
├── platform/           # Core IDE services
│   ├── ai/            # AI service integration
│   ├── commands/      # Command palette and shortcuts
│   ├── editor/        # Editor management
│   ├── events/        # Event system
│   ├── execution/     # Code execution services
│   ├── files/         # File management
│   ├── instantiation/ # Dependency injection
│   ├── layout/        # Layout management
│   └── notification/  # Notification system
├── services/          # Additional services
├── workbench/         # Main IDE interface
├── config/            # Configuration files
├── contexts/          # React contexts
└── assets/            # Static assets
```

### 🎯 Key Components

#### **Workbench.jsx**
- Main IDE interface container
- Manages layout and service initialization
- Handles real-time collaboration via Socket.IO
- Implements VS Code-like architecture

#### **Platform Services**
- **FileService**: Advanced file management with cloud sync
- **AIService**: Multi-provider AI integration (OpenAI, Claude, HuggingFace)
- **ExecutionService**: Multi-language code execution
- **LayoutService**: Dynamic layout management
- **CommandService**: Command palette and shortcuts

#### **Monaco Editor Integration**
- Full VS Code editor experience
- Multi-language support with IntelliSense
- Real-time collaboration
- Advanced configuration and theming

## 🔧 Technology Stack

### **Core Framework**
- **React 19.1.1** - Latest React with concurrent features
- **Vite 7.1.2** - Fast development and build tool
- **ES6+ Modules** - Modern JavaScript with proper imports/exports

### **IDE Features**
- **Monaco Editor** - VS Code's editor engine
- **Socket.IO Client** - Real-time collaboration
- **React Resizable Panels** - Flexible layout system
- **Lucide React** - Beautiful icon library

### **AI Integration**
- **OpenAI SDK** - GPT models integration
- **Multi-provider Support** - OpenAI, Claude, HuggingFace
- **Real-time AI Chat** - Interactive AI assistance

### **Development Tools**
- **ESLint** - Code linting and quality
- **Hot Module Replacement** - Fast development
- **Source Maps** - Easy debugging

## 🎨 UI/UX Features

### **VS Code-like Interface**
- Activity bar with file explorer, search, git, debug
- Resizable sidebar and panels
- Tab-based editor groups
- Integrated terminal
- Status bar with live information

### **Real-time Collaboration**
- Multi-user editing with live cursors
- Shared project workspaces
- Real-time file synchronization
- Collaborative debugging

### **AI-Powered Features**
- Code completion and suggestions
- AI chat for coding help
- Code analysis and optimization
- Bug detection and fixes
- Documentation generation

## ⚙️ Configuration

### **Environment Variables**
Create `.env` file in frontend directory:
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
VITE_OPENAI_API_KEY=your_openai_key
VITE_CLAUDE_API_KEY=your_claude_key
VITE_FIREBASE_CONFIG=your_firebase_config
```

### **Vite Configuration**
- Monaco Editor worker support
- API proxy to backend
- Optimized bundle splitting
- Fast refresh for development

### **Monaco Editor**
- Multi-language syntax highlighting
- IntelliSense and autocomplete
- Custom themes and configurations
- Advanced editing features

## 🔌 API Integration

### **Backend APIs**
- **Files API**: `/api/v2/files` - File management
- **Execution API**: `/api/v2/execute` - Code execution
- **AI API**: `/api/v2/ai` - AI services
- **Collaboration**: WebSocket via Socket.IO

### **Service Architecture**
- Dependency injection via InstantiationService
- Event-driven communication
- Proper error handling and fallbacks
- Offline-first design

## 🧪 Development

### **Local Development**
```bash
# Start with hot reload
npm run dev

# Open browser to http://localhost:5173
# Backend should be running on http://localhost:3001
```

### **Code Quality**
```bash
# Lint code
npm run lint

# Format code
npm run format

# Type checking (if using TypeScript)
npm run type-check
```

### **Building**
```bash
# Production build
npm run build

# Analyze bundle
npm run analyze

# Preview build
npm run preview
```

## 🚨 Troubleshooting

### **Monaco Editor Issues**
- Ensure worker files are properly loaded
- Check Vite configuration for worker support
- Verify language providers are registered

### **Socket.IO Connection**
- Verify backend is running on correct port
- Check CORS configuration
- Ensure firewall allows WebSocket connections

### **Service Initialization**
- Check browser console for service errors
- Verify all dependencies are installed
- Ensure proper service registration in Workbench

## 📈 Performance

### **Optimization Features**
- Code splitting with lazy loading
- Monaco Editor in separate chunk
- Service worker for caching
- Optimized bundle sizes

### **Monitoring**
- Performance metrics in status bar
- Memory usage tracking
- Network request monitoring
- Error tracking and reporting

## 🔒 Security

### **Client-side Security**
- Input sanitization for code execution
- Secure API communication
- XSS protection
- Content Security Policy

### **Authentication**
- Firebase Authentication integration
- JWT token management
- Role-based access control
- Secure session handling

## 🤝 Contributing

1. Follow React best practices
2. Use consistent naming conventions
3. Add proper TypeScript types (if applicable)
4. Write unit tests for components
5. Update documentation for new features

## 📚 Resources

- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Monaco Editor API](https://microsoft.github.io/monaco-editor/)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)

---

**Built with ❤️ for modern web development**
