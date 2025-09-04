// Enhanced Routes for AI API
const express = require('express')
const { body, validationResult } = require('express-validator')
const OpenAI = require('openai')
const axios = require('axios')

const router = express.Router()

// Initialize AI providers
const initializeProviders = () => {
  const providers = {}
  
  // OpenAI
  if (process.env.OPENAI_API_KEY) {
    providers.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  }
  
  // Add other providers as needed
  // Claude, Cohere, Hugging Face, etc.
  
  return providers
}

const aiProviders = initializeProviders()

// Chat with AI
router.post('/chat', [
  body('message').isLength({ min: 1 }).withMessage('Message is required'),
  body('provider').optional().isIn(['openai', 'claude', 'local']).withMessage('Invalid provider'),
  body('model').optional().isString(),
  body('conversationId').optional().isString(),
  body('context').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { 
      message, 
      provider = 'openai', 
      model = 'gpt-3.5-turbo',
      conversationId,
      context = {},
      maxTokens = 1000,
      temperature = 0.7
    } = req.body

    console.log(`[AI Chat] Provider: ${provider}, Model: ${model}`)

    let response
    switch (provider) {
      case 'openai':
        response = await handleOpenAIChat(message, model, context, maxTokens, temperature)
        break
      case 'claude':
        response = await handleClaudeChat(message, model, context, maxTokens, temperature)
        break
      case 'local':
        response = await handleLocalModelChat(message, model, context, maxTokens, temperature)
        break
      default:
        return res.status(400).json({ success: false, error: 'Unsupported provider' })
    }

    // Store conversation in database (mock for now)
    const chatId = conversationId || generateChatId()
    
    res.json({
      success: true,
      response: response.content,
      conversationId: chatId,
      provider,
      model,
      usage: response.usage,
      timestamp: new Date()
    })

  } catch (error) {
    console.error('AI Chat error:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message,
      provider: req.body.provider || 'unknown'
    })
  }
})

// Code completion
router.post('/complete', [
  body('code').isString().withMessage('Code is required'),
  body('language').isString().withMessage('Language is required'),
  body('position').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { 
      code, 
      language, 
      position = { line: 0, character: 0 },
      provider = 'openai',
      maxSuggestions = 5
    } = req.body

    console.log(`[AI Completion] Language: ${language}, Provider: ${provider}`)

    const prompt = `Complete the following ${language} code. Provide only the completion, no explanations:

\`\`\`${language}
${code}
\`\`\`

Completion:`

    let completions
    switch (provider) {
      case 'openai':
        completions = await getOpenAICompletion(prompt, maxSuggestions)
        break
      case 'claude':
        completions = await getClaudeCompletion(prompt, maxSuggestions)
        break
      default:
        return res.status(400).json({ success: false, error: 'Unsupported provider' })
    }

    res.json({
      success: true,
      completions,
      language,
      position,
      provider,
      timestamp: new Date()
    })

  } catch (error) {
    console.error('AI Completion error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Code analysis
router.post('/analyze', [
  body('code').isLength({ min: 1 }).withMessage('Code is required'),
  body('language').isString().withMessage('Language is required'),
  body('analysisType').optional().isIn(['bugs', 'performance', 'security', 'style', 'all'])
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { 
      code, 
      language, 
      analysisType = 'all',
      provider = 'openai'
    } = req.body

    console.log(`[AI Analysis] Language: ${language}, Type: ${analysisType}`)

    const analysisPrompts = {
      bugs: `Analyze the following ${language} code for potential bugs and errors:`,
      performance: `Analyze the following ${language} code for performance issues and optimizations:`,
      security: `Analyze the following ${language} code for security vulnerabilities:`,
      style: `Analyze the following ${language} code for style and best practices:`,
      all: `Perform a comprehensive analysis of the following ${language} code including bugs, performance, security, and style:`
    }

    const prompt = `${analysisPrompts[analysisType]}

\`\`\`${language}
${code}
\`\`\`

Provide a detailed analysis with specific suggestions and line numbers where applicable.`

    let analysis
    switch (provider) {
      case 'openai':
        analysis = await getOpenAIAnalysis(prompt)
        break
      case 'claude':
        analysis = await getClaudeAnalysis(prompt)
        break
      default:
        return res.status(400).json({ success: false, error: 'Unsupported provider' })
    }

    res.json({
      success: true,
      analysis: analysis.content,
      language,
      analysisType,
      provider,
      suggestions: extractSuggestions(analysis.content),
      timestamp: new Date()
    })

  } catch (error) {
    console.error('AI Analysis error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Code generation
router.post('/generate', [
  body('prompt').isLength({ min: 1 }).withMessage('Prompt is required'),
  body('language').isString().withMessage('Language is required')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { 
      prompt, 
      language, 
      provider = 'openai',
      style = 'clean',
      includeComments = true,
      maxTokens = 2000
    } = req.body

    console.log(`[AI Generation] Language: ${language}, Provider: ${provider}`)

    const enhancedPrompt = `Generate ${language} code for the following request:

${prompt}

Requirements:
- Use ${style} coding style
- ${includeComments ? 'Include helpful comments' : 'Minimal comments'}
- Follow ${language} best practices
- Ensure code is production-ready

Code:`

    let generatedCode
    switch (provider) {
      case 'openai':
        generatedCode = await generateWithOpenAI(enhancedPrompt, maxTokens)
        break
      case 'claude':
        generatedCode = await generateWithClaude(enhancedPrompt, maxTokens)
        break
      default:
        return res.status(400).json({ success: false, error: 'Unsupported provider' })
    }

    res.json({
      success: true,
      code: generatedCode.content,
      language,
      prompt,
      provider,
      metadata: {
        style,
        includeComments,
        tokensUsed: generatedCode.usage?.total_tokens
      },
      timestamp: new Date()
    })

  } catch (error) {
    console.error('AI Generation error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Explain code
router.post('/explain', [
  body('code').isLength({ min: 1 }).withMessage('Code is required'),
  body('language').isString().withMessage('Language is required')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { 
      code, 
      language, 
      provider = 'openai',
      level = 'intermediate' // beginner, intermediate, advanced
    } = req.body

    console.log(`[AI Explanation] Language: ${language}, Level: ${level}`)

    const prompt = `Explain the following ${language} code for a ${level} programmer. 
Break down the functionality, explain key concepts, and highlight important patterns:

\`\`\`${language}
${code}
\`\`\`

Explanation:`

    let explanation
    switch (provider) {
      case 'openai':
        explanation = await getOpenAIExplanation(prompt)
        break
      case 'claude':
        explanation = await getClaudeExplanation(prompt)
        break
      default:
        return res.status(400).json({ success: false, error: 'Unsupported provider' })
    }

    res.json({
      success: true,
      explanation: explanation.content,
      language,
      level,
      provider,
      timestamp: new Date()
    })

  } catch (error) {
    console.error('AI Explanation error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get available models
router.get('/models/:provider?', async (req, res) => {
  try {
    const provider = req.params.provider || 'all'
    const models = {}

    if (provider === 'all' || provider === 'openai') {
      models.openai = [
        { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model' },
        { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo', description: 'Latest GPT-4 with improved speed' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient' },
        { id: 'gpt-3.5-turbo-16k', name: 'GPT-3.5 Turbo 16K', description: 'Extended context length' }
      ]
    }

    if (provider === 'all' || provider === 'claude') {
      models.claude = [
        { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Most powerful Claude model' },
        { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', description: 'Balanced performance' },
        { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: 'Fast and cost-effective' }
      ]
    }

    res.json({ success: true, models })

  } catch (error) {
    console.error('Error getting models:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Provider-specific implementations
async function handleOpenAIChat(message, model, context, maxTokens, temperature) {
  if (!aiProviders.openai) {
    throw new Error('OpenAI provider not configured')
  }

  const messages = [
    { role: 'system', content: 'You are a helpful AI coding assistant.' },
    ...buildContextMessages(context),
    { role: 'user', content: message }
  ]

  const completion = await aiProviders.openai.chat.completions.create({
    model,
    messages,
    max_tokens: maxTokens,
    temperature
  })

  return {
    content: completion.choices[0].message.content,
    usage: completion.usage
  }
}

async function handleClaudeChat(message, model, context, maxTokens, temperature) {
  // Implementation for Claude API would go here
  throw new Error('Claude integration not implemented yet')
}

async function handleLocalModelChat(message, model, context, maxTokens, temperature) {
  // Implementation for local model would go here
  throw new Error('Local model integration not implemented yet')
}

async function getOpenAICompletion(prompt, maxSuggestions) {
  if (!aiProviders.openai) {
    throw new Error('OpenAI provider not configured')
  }

  const completion = await aiProviders.openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 500,
    temperature: 0.3,
    n: Math.min(maxSuggestions, 3)
  })

  return completion.choices.map((choice, index) => ({
    id: index + 1,
    text: choice.message.content.trim(),
    confidence: 0.8 - (index * 0.1)
  }))
}

async function getClaudeCompletion(prompt, maxSuggestions) {
  throw new Error('Claude completion not implemented yet')
}

async function getOpenAIAnalysis(prompt) {
  if (!aiProviders.openai) {
    throw new Error('OpenAI provider not configured')
  }

  const completion = await aiProviders.openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1500,
    temperature: 0.2
  })

  return {
    content: completion.choices[0].message.content,
    usage: completion.usage
  }
}

async function getClaudeAnalysis(prompt) {
  throw new Error('Claude analysis not implemented yet')
}

async function generateWithOpenAI(prompt, maxTokens) {
  if (!aiProviders.openai) {
    throw new Error('OpenAI provider not configured')
  }

  const completion = await aiProviders.openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: maxTokens,
    temperature: 0.3
  })

  return {
    content: completion.choices[0].message.content,
    usage: completion.usage
  }
}

async function generateWithClaude(prompt, maxTokens) {
  throw new Error('Claude generation not implemented yet')
}

async function getOpenAIExplanation(prompt) {
  if (!aiProviders.openai) {
    throw new Error('OpenAI provider not configured')
  }

  const completion = await aiProviders.openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1000,
    temperature: 0.4
  })

  return {
    content: completion.choices[0].message.content,
    usage: completion.usage
  }
}

async function getClaudeExplanation(prompt) {
  throw new Error('Claude explanation not implemented yet')
}

// Utility functions
function buildContextMessages(context) {
  const messages = []
  
  if (context.currentFile) {
    messages.push({
      role: 'system',
      content: `Current file: ${context.currentFile.name}\\n\`\`\`${context.currentFile.language}\\n${context.currentFile.content}\\n\`\`\``
    })
  }

  if (context.selectedText) {
    messages.push({
      role: 'system',
      content: `Selected text: \`\`\`\\n${context.selectedText}\\n\`\`\``
    })
  }

  if (context.projectStructure) {
    messages.push({
      role: 'system',
      content: `Project structure: ${JSON.stringify(context.projectStructure, null, 2)}`
    })
  }

  return messages
}

function extractSuggestions(analysisText) {
  // Simple extraction of suggestions from analysis text
  const lines = analysisText.split('\\n')
  const suggestions = []
  
  lines.forEach((line, index) => {
    if (line.toLowerCase().includes('suggestion') || 
        line.toLowerCase().includes('fix') ||
        line.toLowerCase().includes('improve')) {
      suggestions.push({
        line: index + 1,
        type: 'improvement',
        message: line.trim()
      })
    }
  })
  
  return suggestions
}

function generateChatId() {
  return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

// Get AI configuration and available providers
router.get('/config', async (req, res) => {
  try {
    const config = {
      providers: [],
      apiKeys: {},
      capabilities: ['chat', 'completion', 'analysis', 'generation', 'debugging'],
      models: {}
    }

    // Check available providers based on environment variables
    if (process.env.OPENAI_API_KEY) {
      config.providers.push('openai')
      config.apiKeys.openai = '***' // Don't expose actual keys
      config.models.openai = ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo', 'gpt-4o']
    }

    if (process.env.CLAUDE_API_KEY) {
      config.providers.push('claude')
      config.apiKeys.claude = '***'
      config.models.claude = ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku']
    }

    if (process.env.HUGGINGFACE_API_KEY) {
      config.providers.push('huggingface')
      config.apiKeys.huggingface = '***'
      config.models.huggingface = ['codegen', 'codet5', 'gpt-neo']
    }

    // Default to offline mode if no providers available
    if (config.providers.length === 0) {
      config.providers.push('offline')
      config.models.offline = ['local-model']
    }

    res.json({
      success: true,
      config
    })
  } catch (error) {
    console.error('[AI Config] Error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to load AI configuration'
    })
  }
})

module.exports = router
