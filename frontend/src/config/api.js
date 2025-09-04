// Enhanced API Configuration for v2 Services
export const API_CONFIG = {
  // Base configuration
  BASE_URL: 'http://localhost:3001',
  BASE_URL_V2: 'http://localhost:3001/api/v2',
  
  // Timeouts
  DEFAULT_TIMEOUT: 30000,
  EXECUTION_TIMEOUT: 60000,
  AI_TIMEOUT: 45000,
  
  // API Endpoints v1 (legacy)
  ENDPOINTS_V1: {
    AUTH: '/api/auth',
    USERS: '/api/users',
    PROJECTS: '/api/projects',
    FILES: '/api/files',
    EXECUTION: '/api/execute'
  },
  
  // Enhanced API Endpoints v2
  ENDPOINTS_V2: {
    FILES: '/api/v2/files',
    EXECUTION: '/api/v2/execution',
    AI: '/api/v2/ai'
  },
  
  // Socket.IO configuration
  SOCKET_CONFIG: {
    url: 'http://localhost:3001',
    options: {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      forceNew: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      maxReconnectionAttempts: 5,
      randomizationFactor: 0.5
    }
  },
  
  // AI Configuration
  AI_CONFIG: {
    DEFAULT_PROVIDER: 'openai',
    DEFAULT_MODEL: 'gpt-3.5-turbo',
    MAX_TOKENS: 2000,
    TEMPERATURE: 0.7,
    SUPPORTED_PROVIDERS: ['openai', 'claude', 'local'],
    SUPPORTED_MODELS: {
      openai: [
        'gpt-4',
        'gpt-4-turbo-preview', 
        'gpt-3.5-turbo',
        'gpt-3.5-turbo-16k'
      ],
      claude: [
        'claude-3-opus-20240229',
        'claude-3-sonnet-20240229',
        'claude-3-haiku-20240307'
      ],
      local: ['llama2', 'codellama', 'custom']
    }
  },
  
  // Execution Configuration
  EXECUTION_CONFIG: {
    SUPPORTED_LANGUAGES: [
      'javascript',
      'typescript', 
      'python',
      'java',
      'cpp',
      'c',
      'go',
      'rust',
      'php',
      'ruby',
      'shell'
    ],
    DEFAULT_LANGUAGE: 'javascript',
    MAX_EXECUTION_TIME: 30000,
    MAX_OUTPUT_SIZE: 1024 * 1024, // 1MB
    SANDBOX_ENABLED: true
  },
  
  // File Configuration
  FILE_CONFIG: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    SUPPORTED_EXTENSIONS: [
      // Text files
      '.txt', '.md', '.json', '.xml', '.yaml', '.yml', '.toml', '.ini',
      // Code files
      '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.h', '.hpp',
      '.go', '.rs', '.php', '.rb', '.sh', '.ps1', '.bat', '.css', '.scss', '.sass',
      '.html', '.htm', '.vue', '.svelte', '.sql',
      // Config files
      '.gitignore', '.gitattributes', '.editorconfig', '.eslintrc', '.prettierrc',
      'Dockerfile', 'Makefile', 'CMakeLists.txt'
    ],
    AUTO_SAVE_INTERVAL: 2000, // 2 seconds
    BACKUP_ENABLED: true,
    SYNC_ENABLED: true
  },
  
  // Performance Configuration
  PERFORMANCE_CONFIG: {
    DEBOUNCE_DELAY: 300,
    THROTTLE_DELAY: 100,
    VIRTUAL_SCROLL_THRESHOLD: 1000,
    LAZY_LOAD_THRESHOLD: 50,
    CACHE_TTL: 5 * 60 * 1000, // 5 minutes
    MAX_CACHE_SIZE: 100
  }
}

// Utility function to get full URL for v1 endpoints
export const getApiUrlV1 = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS_V1[endpoint] || endpoint}`
}

// Utility function to get full URL for v2 endpoints  
export const getApiUrlV2 = (endpoint) => {
  return `${API_CONFIG.BASE_URL_V2}${API_CONFIG.ENDPOINTS_V2[endpoint] || endpoint}`
}

// Utility function to get Socket.IO configuration
export const getSocketConfig = () => {
  return API_CONFIG.SOCKET_CONFIG
}

// Environment-specific overrides
if (import.meta.env.PROD) {
  // Production overrides
  API_CONFIG.BASE_URL = window.location.origin
  API_CONFIG.BASE_URL_V2 = `${window.location.origin}/api/v2`
  API_CONFIG.SOCKET_CONFIG.url = window.location.origin
}

if (import.meta.env.DEV) {
  // Development specific settings
  API_CONFIG.PERFORMANCE_CONFIG.CACHE_TTL = 1 * 60 * 1000 // 1 minute
  console.log('[API Config] Development mode enabled')
  console.log('[API Config] Base URL:', API_CONFIG.BASE_URL)
  console.log('[API Config] Base URL v2:', API_CONFIG.BASE_URL_V2)
  console.log('[API Config] Socket URL:', API_CONFIG.SOCKET_CONFIG.url)
}

export default API_CONFIG
