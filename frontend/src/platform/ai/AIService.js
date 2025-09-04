import { BrowserEventEmitter } from '../events/BrowserEventEmitter.js'

/**
 * Advanced AI Service for IDE - Integrated with multiple AI providers
 * Supports code completion, chat, analysis, generation, and debugging assistance
 */
class AIService extends BrowserEventEmitter {
  constructor() {
    super()
    this.isInitialized = false
    this.models = new Map()
    this.activeSession = null
    this.providers = new Map()
    this.capabilities = new Set()
    this.conversationHistory = []
    this.codeAnalysisCache = new Map()
    this.apiKeys = new Map()
    this.socket = null
    this.settings = {
      defaultProvider: 'openai',
      maxTokens: 4000,
      temperature: 0.7,
      enableCodeCompletion: true,
      enableChat: true,
      enableAnalysis: true
    }
    this.baseURL = 'http://localhost:3001/api/v2'
  }

  async initialize() {
    if (this.isInitialized) return

    try {
      // Initialize AI providers
      await this.initializeProviders()
      
      // Load available models
      await this.loadModels()
      
      // Setup capabilities
      this.setupCapabilities()
      
      // Load API keys from backend
      await this.loadAPIKeys()
      
      // Initialize conversation session
      this.startNewSession()
      
      this.isInitialized = true
      this.emit('initialized')
      
      console.log('[AIService] Advanced AI integration initialized')
    } catch (error) {
      console.error('[AIService] Failed to initialize:', error)
      // Continue with limited functionality
      this.setupOfflineCapabilities()
      this.isInitialized = true
      this.emit('initialized', { offline: true })
    }
  }

  /**
   * Set external socket instance (optional - for shared socket usage)
   * @param {Object} socketInstance - External socket.io instance
   */
  setSocket(socketInstance) {
    if (socketInstance) {
      this.socket = socketInstance;
      this.setupSocketListeners();
      console.log('[AIService] Using external socket instance');
    }
  }

  setupSocketListeners() {
    if (!this.socket) return;
    
    this.socket.on('connect', () => {
      console.log('[AIService] Real-time AI activity sharing connected');
      this.emit('aiConnected');
    });
    
    this.socket.on('aiChatUpdate', (data) => {
      this.emit('remoteAIChatUpdate', data);
    });
    
    this.socket.on('aiAnalysisResult', (data) => {
      this.emit('remoteAIAnalysisResult', data);
    });
    
    this.socket.on('aiCodeGeneration', (data) => {
      this.emit('remoteAICodeGeneration', data);
    });
  }

  async initializeProviders() {
    // OpenAI GPT
    this.providers.set('openai', {
      name: 'OpenAI',
      models: ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo', 'gpt-4o'],
      capabilities: ['chat', 'completion', 'analysis', 'generation', 'debugging'],
      endpoint: 'https://api.openai.com/v1/chat/completions'
    })

    // Claude (Anthropic)
    this.providers.set('claude', {
      name: 'Anthropic Claude',
      models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
      capabilities: ['chat', 'completion', 'analysis', 'generation'],
      endpoint: 'https://api.anthropic.com/v1/messages'
    })

    // Local AI (if available)
    this.providers.set('local', {
      name: 'Local AI',
      models: ['llama2', 'codellama', 'mistral'],
      capabilities: ['chat', 'completion'],
      endpoint: 'http://localhost:11434/api/generate'
    })

    // Backend AI proxy
    this.providers.set('backend', {
      name: 'Backend AI',
      models: ['proxy-gpt', 'proxy-claude'],
      capabilities: ['chat', 'completion', 'analysis'],
      endpoint: `${this.baseURL}/ai`
    })
  }

  async loadModels() {
    for (const [providerId, provider] of this.providers) {
      for (const model of provider.models) {
        this.models.set(model, {
          provider: providerId,
          name: model,
          capabilities: provider.capabilities
        })
      }
    }
  }

  setupCapabilities() {
    this.capabilities.add('codeCompletion')
    this.capabilities.add('chatAssistance')
    this.capabilities.add('codeAnalysis')
    this.capabilities.add('bugDetection')
    this.capabilities.add('codeGeneration')
    this.capabilities.add('codeOptimization')
    this.capabilities.add('documentationGeneration')
    this.capabilities.add('testGeneration')
    this.capabilities.add('codeRefactoring')
    this.capabilities.add('errorExplanation')
  }

  setupOfflineCapabilities() {
    // Limited offline AI features using patterns and heuristics
    this.capabilities.add('basicCompletion')
    this.capabilities.add('syntaxHelp')
    this.capabilities.add('patternRecognition')
  }

  async loadAPIKeys() {
    try {
      const response = await fetch(`${this.baseURL}/ai/config`)
      if (response.ok) {
        const config = await response.json()
        if (config.apiKeys) {
          for (const [provider, key] of Object.entries(config.apiKeys)) {
            this.apiKeys.set(provider, key)
          }
        }
      }
    } catch (error) {
      console.warn('[AIService] Could not load API keys from backend')
    }
  }

  startNewSession() {
    this.activeSession = {
      id: Date.now().toString(),
      startTime: new Date().toISOString(),
      provider: this.settings.defaultProvider,
      model: this.getDefaultModel(),
      conversationHistory: [],
      context: {
        currentFile: null,
        projectType: null,
        codeContext: null
      }
    }
  }

  getDefaultModel() {
    const provider = this.providers.get(this.settings.defaultProvider)
    return provider ? provider.models[0] : 'gpt-3.5-turbo'
  }

  // Advanced Code Completion
  async getCodeCompletion(code, language, cursorPosition, context = {}) {
    try {
      const prompt = this.buildCompletionPrompt(code, language, cursorPosition, context)
      
      const response = await this.queryAI(prompt, {
        type: 'completion',
        maxTokens: 150,
        temperature: 0.3,
        stopSequences: ['\\n\\n', '```']
      })

      const completions = this.parseCompletionResponse(response, language)
      
      this.emit('codeCompletion', { completions, language, context })
      return completions
    } catch (error) {
      console.error('[AIService] Code completion failed:', error)
      return this.getFallbackCompletions(code, language)
    }
  }

  buildCompletionPrompt(code, language, cursorPosition, context) {
    const beforeCursor = code.substring(0, cursorPosition)
    const afterCursor = code.substring(cursorPosition)
    
    return `You are an expert ${language} developer. Complete the following code:

Context: ${context.fileName || 'Unknown file'}
Language: ${language}

Code before cursor:
\`\`\`${language}
${beforeCursor}
\`\`\`

Code after cursor:
\`\`\`${language}
${afterCursor}
\`\`\`

Provide intelligent code completion suggestions for the cursor position. Consider:
1. Variable scope and types
2. Available functions and methods
3. Best practices for ${language}
4. Code patterns and conventions

Respond with 3-5 completion options in JSON format:
{
  "completions": [
    {
      "text": "completion text",
      "description": "what this does",
      "type": "variable|function|keyword|snippet"
    }
  ]
}`
  }

  parseCompletionResponse(response, language) {
    try {
      if (typeof response === 'string') {
        // Try to extract JSON from the response
        const jsonMatch = response.match(/\\{[\\s\\S]*\\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          return parsed.completions || []
        }
      }
      
      if (response.completions) {
        return response.completions
      }
      
      return []
    } catch (error) {
      console.error('[AIService] Failed to parse completion response:', error)
      return []
    }
  }

  getFallbackCompletions(code, language) {
    // Basic pattern-based completions for offline mode
    const completions = []
    
    if (language === 'javascript') {
      const jsPatterns = [
        { text: 'console.log()', description: 'Log to console', type: 'function' },
        { text: 'function name() {}', description: 'Function declaration', type: 'snippet' },
        { text: 'const variable = ', description: 'Constant declaration', type: 'keyword' },
        { text: '.forEach()', description: 'Array forEach method', type: 'method' }
      ]
      
      const lastWord = code.split(/\\s+/).pop()
      if (lastWord) {
        completions.push(...jsPatterns.filter(p => 
          p.text.toLowerCase().includes(lastWord.toLowerCase())
        ))
      }
    }
    
    return completions
  }

  // AI Chat Assistant
  async chatWithAI(message, context = {}) {
    try {
      const enrichedMessage = this.enrichMessageWithContext(message, context)
      
      const response = await this.queryAI(enrichedMessage, {
        type: 'chat',
        maxTokens: this.settings.maxTokens,
        temperature: this.settings.temperature
      })

      // Add to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      })
      
      this.conversationHistory.push({
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      })

      this.emit('chatResponse', { message, response, context })
      return response
    } catch (error) {
      console.error('[AIService] Chat failed:', error)
      return this.getFallbackChatResponse(message)
    }
  }

  enrichMessageWithContext(message, context) {
    let enrichedMessage = message
    
    if (context.currentFile) {
      enrichedMessage += `\\n\\nContext: Currently working on ${context.currentFile}`
    }
    
    if (context.selectedCode) {
      enrichedMessage += `\\n\\nSelected code:\\n\`\`\`${context.language || 'text'}\\n${context.selectedCode}\\n\`\`\``
    }
    
    if (context.errorMessage) {
      enrichedMessage += `\\n\\nError encountered: ${context.errorMessage}`
    }
    
    return enrichedMessage
  }

  getFallbackChatResponse(message) {
    const responses = {
      'help': 'I can help you with coding, debugging, and development questions. What would you like to know?',
      'debug': 'To debug your code, try adding console.log statements or using the browser debugger.',
      'optimize': 'Consider using more efficient algorithms, reducing complexity, and following best practices.',
      'explain': 'I can explain code concepts. Please share the specific code you want me to explain.',
      'generate': 'I can help generate code. Please describe what you want to create.',
      'test': 'For testing, consider using Jest for JavaScript or appropriate testing frameworks for your language.'
    }
    
    const lowerMessage = message.toLowerCase()
    for (const [key, response] of Object.entries(responses)) {
      if (lowerMessage.includes(key)) {
        return response
      }
    }
    
    return 'I understand you need help. Could you please be more specific about what you\'d like assistance with?'
  }

  // Code Analysis
  async analyzeCode(code, language, fileName = null) {
    const cacheKey = `${language}:${this.hashCode(code)}`
    
    if (this.codeAnalysisCache.has(cacheKey)) {
      return this.codeAnalysisCache.get(cacheKey)
    }

    try {
      const prompt = `Analyze this ${language} code for:
1. Potential bugs and issues
2. Performance improvements
3. Best practices violations
4. Security concerns
5. Code quality metrics

File: ${fileName || 'untitled'}
Code:
\`\`\`${language}
${code}
\`\`\`

Provide analysis in JSON format:
{
  "issues": [
    {
      "type": "bug|performance|style|security",
      "severity": "high|medium|low",
      "line": number,
      "message": "description",
      "suggestion": "how to fix"
    }
  ],
  "metrics": {
    "complexity": number,
    "maintainability": "high|medium|low",
    "testability": "high|medium|low"
  },
  "suggestions": ["improvement suggestions"]
}`

      const response = await this.queryAI(prompt, {
        type: 'analysis',
        maxTokens: 1000,
        temperature: 0.2
      })

      const analysis = this.parseAnalysisResponse(response)
      this.codeAnalysisCache.set(cacheKey, analysis)
      
      this.emit('codeAnalysis', { code, language, analysis })
      return analysis
    } catch (error) {
      console.error('[AIService] Code analysis failed:', error)
      return { issues: [], metrics: {}, suggestions: [] }
    }
  }

  parseAnalysisResponse(response) {
    try {
      if (typeof response === 'string') {
        const jsonMatch = response.match(/\\{[\\s\\S]*\\}/)
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0])
        }
      }
      return response
    } catch (error) {
      console.error('[AIService] Failed to parse analysis response:', error)
      return { issues: [], metrics: {}, suggestions: [] }
    }
  }

  // Generate Code
  async generateCode(prompt, language, context = {}) {
    try {
      const fullPrompt = `Generate ${language} code for: ${prompt}

Requirements:
- Write clean, readable code
- Follow ${language} best practices
- Include comments where helpful
- Consider error handling

${context.framework ? `Framework: ${context.framework}` : ''}
${context.style ? `Code style: ${context.style}` : ''}

Provide the code in markdown format with explanation.`

      const response = await this.queryAI(fullPrompt, {
        type: 'generation',
        maxTokens: 1500,
        temperature: 0.5
      })

      this.emit('codeGenerated', { prompt, language, response })
      return response
    } catch (error) {
      console.error('[AIService] Code generation failed:', error)
      return `// Failed to generate code for: ${prompt}\\n// Please try again or write manually.`
    }
  }

  // Query AI provider
  async queryAI(prompt, options = {}) {
    const provider = this.providers.get(this.settings.defaultProvider)
    
    if (!provider) {
      throw new Error('No AI provider available')
    }

    // Try backend proxy first
    try {
      const response = await fetch(`${this.baseURL}/ai/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: this.settings.defaultProvider,
          model: this.getDefaultModel(),
          prompt,
          options
        })
      })

      if (response.ok) {
        const data = await response.json()
        return data.response
      }
    } catch (error) {
      console.warn('[AIService] Backend AI query failed, trying direct API')
    }

    // Direct API call (would need API keys)
    return this.queryDirectAPI(provider, prompt, options)
  }

  async queryDirectAPI(provider, prompt, options) {
    // This would implement direct API calls to AI providers
    // For demo purposes, return a mock response
    return `Mock AI response for: ${prompt.substring(0, 50)}...`
  }

  // Utility methods
  hashCode(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString()
  }

  getCapabilities() {
    return Array.from(this.capabilities)
  }

  getProviders() {
    return Array.from(this.providers.keys())
  }

  getModels() {
    return Array.from(this.models.keys())
  }

  setProvider(providerId) {
    if (this.providers.has(providerId)) {
      this.settings.defaultProvider = providerId
      this.emit('providerChanged', providerId)
    }
  }

  getConversationHistory() {
    return this.conversationHistory
  }

  clearConversationHistory() {
    this.conversationHistory = []
    this.emit('conversationCleared')
  }

  clearAnalysisCache() {
    this.codeAnalysisCache.clear()
    this.emit('analysisCacheCleared')
  }

  dispose() {
    this.removeAllListeners()
    this.clearAnalysisCache()
  }
}

// Export class for proper instantiation, not singleton
export { AIService };
export default AIService;
