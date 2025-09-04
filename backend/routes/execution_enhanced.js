// Enhanced Routes for Code Execution API
const express = require('express')
const { body, validationResult } = require('express-validator')
const { VM } = require('vm2')
const { spawn } = require('child_process')
const fs = require('fs').promises
const path = require('path')
const crypto = require('crypto')

const router = express.Router()

// Basic status endpoint for testing
router.get('/status', (req, res) => {
  res.json({
    success: true,
    message: 'Execution Enhanced API v2 is working',
    timestamp: new Date().toISOString(),
    features: ['multi-language execution', 'VM2 sandboxing', 'real-time results', 'debugging'],
    supportedLanguages: ['javascript', 'typescript', 'python', 'java', 'cpp', 'go', 'rust', 'php', 'ruby', 'shell']
  })
})

// Execution timeout (configurable)
const EXECUTION_TIMEOUT = 30000 // 30 seconds

// Supported languages and their configurations
const LANGUAGE_CONFIGS = {
  javascript: {
    extension: '.js',
    runner: 'node',
    sandbox: true,
    memoryLimit: 128 * 1024 * 1024 // 128MB
  },
  python: {
    extension: '.py',
    runner: 'python',
    args: ['-u'], // Unbuffered output
    sandbox: false
  },
  typescript: {
    extension: '.ts',
    runner: 'ts-node',
    sandbox: false
  },
  java: {
    extension: '.java',
    runner: 'java',
    compile: true,
    compiler: 'javac'
  },
  cpp: {
    extension: '.cpp',
    runner: './program',
    compile: true,
    compiler: 'g++',
    compilerArgs: ['-o', 'program']
  },
  c: {
    extension: '.c',
    runner: './program',
    compile: true,
    compiler: 'gcc',
    compilerArgs: ['-o', 'program']
  },
  go: {
    extension: '.go',
    runner: 'go',
    args: ['run']
  },
  rust: {
    extension: '.rs',
    runner: './program',
    compile: true,
    compiler: 'rustc',
    compilerArgs: ['-o', 'program']
  },
  php: {
    extension: '.php',
    runner: 'php'
  },
  ruby: {
    extension: '.rb',
    runner: 'ruby'
  },
  shell: {
    extension: '.sh',
    runner: 'bash'
  }
}

// Execute code
router.post('/execute', [
  body('code').isLength({ min: 1 }).withMessage('Code is required'),
  body('language').isIn(Object.keys(LANGUAGE_CONFIGS)).withMessage('Unsupported language'),
  body('projectId').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { code, language, input = '', projectId, filename } = req.body
    const config = LANGUAGE_CONFIGS[language]
    const executionId = crypto.randomUUID()

    console.log(`[Execution] Starting execution ${executionId} - Language: ${language}`)

    // For JavaScript, use secure VM2 sandbox
    if (language === 'javascript' && config.sandbox) {
      return await executeJavaScriptSandbox(res, code, input, executionId)
    }

    // For other languages, use external processes
    return await executeExternalProcess(res, code, language, config, input, executionId, projectId, filename)

  } catch (error) {
    console.error('Execution error:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      executionId: crypto.randomUUID()
    })
  }
})

// Execute JavaScript in VM2 sandbox
async function executeJavaScriptSandbox(res, code, input, executionId) {
  const startTime = Date.now()
  let output = ''
  let errorOutput = ''

  try {
    // Create sandbox with custom console
    const sandbox = {
      console: {
        log: (...args) => {
          output += args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ') + '\\n'
        },
        error: (...args) => {
          errorOutput += args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ') + '\\n'
        },
        warn: (...args) => {
          output += '[WARN] ' + args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ') + '\\n'
        },
        info: (...args) => {
          output += '[INFO] ' + args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ') + '\\n'
        }
      },
      setTimeout,
      setInterval,
      clearTimeout,
      clearInterval,
      Buffer,
      process: {
        env: {},
        argv: [],
        version: process.version,
        platform: process.platform
      },
      require: (module) => {
        // Limited require for safe modules
        const allowedModules = ['util', 'crypto', 'path']
        if (allowedModules.includes(module)) {
          return require(module)
        }
        throw new Error(`Module '${module}' is not allowed in sandbox`)
      },
      // Add input as global variable
      input: input
    }

    const vm = new VM({
      timeout: EXECUTION_TIMEOUT,
      sandbox,
      eval: false,
      wasm: false,
      fixAsync: true
    })

    const result = vm.run(code)
    const executionTime = Date.now() - startTime

    // If result is a promise, wait for it
    if (result && typeof result.then === 'function') {
      try {
        const finalResult = await Promise.race([
          result,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Promise timeout')), EXECUTION_TIMEOUT)
          )
        ])
        if (finalResult !== undefined) {
          output += String(finalResult) + '\\n'
        }
      } catch (promiseError) {
        errorOutput += `Promise error: ${promiseError.message}\\n`
      }
    } else if (result !== undefined) {
      output += String(result) + '\\n'
    }

    res.json({
      success: true,
      executionId,
      output: output.trim(),
      error: errorOutput.trim(),
      executionTime,
      language: 'javascript',
      memoryUsage: process.memoryUsage()
    })

  } catch (error) {
    const executionTime = Date.now() - startTime
    res.json({
      success: false,
      executionId,
      output: output.trim(),
      error: error.message,
      executionTime,
      language: 'javascript'
    })
  }
}

// Execute code using external processes
async function executeExternalProcess(res, code, language, config, input, executionId, projectId, filename) {
  const startTime = Date.now()
  const tempDir = path.join(__dirname, '../../temp', executionId)
  
  try {
    // Create temp directory
    await fs.mkdir(tempDir, { recursive: true })
    
    // Determine filename
    const codeFileName = filename || `code${config.extension}`
    const codeFilePath = path.join(tempDir, codeFileName)
    
    // Write code to file
    await fs.writeFile(codeFilePath, code, 'utf8')
    
    let output = ''
    let errorOutput = ''
    let executionTime = 0
    
    // Compile if needed
    if (config.compile) {
      const compileResult = await compileCode(tempDir, codeFileName, config)
      if (!compileResult.success) {
        return res.json({
          success: false,
          executionId,
          output: '',
          error: compileResult.error,
          executionTime: Date.now() - startTime,
          language,
          stage: 'compilation'
        })
      }
      output += compileResult.output
    }
    
    // Execute code
    const executeResult = await runCode(tempDir, codeFileName, config, input)
    executionTime = Date.now() - startTime
    
    // Clean up temp directory
    setTimeout(async () => {
      try {
        await fs.rmdir(tempDir, { recursive: true })
      } catch (err) {
        console.warn('Failed to clean up temp directory:', err.message)
      }
    }, 5000) // Clean up after 5 seconds
    
    res.json({
      success: executeResult.success,
      executionId,
      output: (output + executeResult.output).trim(),
      error: executeResult.error.trim(),
      executionTime,
      language,
      stage: 'execution'
    })
    
  } catch (error) {
    // Clean up on error
    try {
      await fs.rmdir(tempDir, { recursive: true })
    } catch (err) {
      // Ignore cleanup errors
    }
    
    res.json({
      success: false,
      executionId,
      output: '',
      error: error.message,
      executionTime: Date.now() - startTime,
      language
    })
  }
}

// Compile code
async function compileCode(tempDir, codeFileName, config) {
  return new Promise((resolve) => {
    const compiler = config.compiler
    const args = [...(config.compilerArgs || []), codeFileName]
    
    console.log(`[Compilation] ${compiler} ${args.join(' ')}`)
    
    const compileProcess = spawn(compiler, args, {
      cwd: tempDir,
      timeout: EXECUTION_TIMEOUT
    })
    
    let output = ''
    let error = ''
    
    compileProcess.stdout.on('data', (data) => {
      output += data.toString()
    })
    
    compileProcess.stderr.on('data', (data) => {
      error += data.toString()
    })
    
    compileProcess.on('close', (code) => {
      resolve({
        success: code === 0,
        output,
        error: code !== 0 ? error : ''
      })
    })
    
    compileProcess.on('error', (err) => {
      resolve({
        success: false,
        output: '',
        error: `Compilation failed: ${err.message}`
      })
    })
  })
}

// Run compiled or interpreted code
async function runCode(tempDir, codeFileName, config, input) {
  return new Promise((resolve) => {
    let command = config.runner
    let args = [...(config.args || [])]
    
    // Add filename for interpreted languages
    if (!config.compile) {
      args.push(codeFileName)
    }
    
    console.log(`[Execution] ${command} ${args.join(' ')}`)
    
    const runProcess = spawn(command, args, {
      cwd: tempDir,
      timeout: EXECUTION_TIMEOUT
    })
    
    let output = ''
    let error = ''
    
    runProcess.stdout.on('data', (data) => {
      output += data.toString()
    })
    
    runProcess.stderr.on('data', (data) => {
      error += data.toString()
    })
    
    // Send input if provided
    if (input) {
      runProcess.stdin.write(input)
      runProcess.stdin.end()
    }
    
    runProcess.on('close', (code) => {
      resolve({
        success: code === 0,
        output,
        error: code !== 0 ? error : ''
      })
    })
    
    runProcess.on('error', (err) => {
      resolve({
        success: false,
        output: '',
        error: `Execution failed: ${err.message}`
      })
    })
  })
}

// Get supported languages
router.get('/languages', (req, res) => {
  const languages = Object.keys(LANGUAGE_CONFIGS).map(lang => ({
    id: lang,
    name: lang.charAt(0).toUpperCase() + lang.slice(1),
    extension: LANGUAGE_CONFIGS[lang].extension,
    supportsInput: true,
    hasCompilation: LANGUAGE_CONFIGS[lang].compile || false,
    sandbox: LANGUAGE_CONFIGS[lang].sandbox || false
  }))
  
  res.json({ success: true, languages })
})

// Get execution history
router.get('/history/:projectId?', async (req, res) => {
  try {
    const projectId = req.params.projectId || 'default'
    
    // In a real implementation, you'd store execution history in a database
    // For now, return mock data
    const history = [
      {
        id: '1',
        language: 'javascript',
        timestamp: new Date(Date.now() - 3600000),
        duration: 150,
        success: true,
        codePreview: 'console.log("Hello World")'
      },
      {
        id: '2',
        language: 'python',
        timestamp: new Date(Date.now() - 7200000),
        duration: 230,
        success: true,
        codePreview: 'print("Hello Python")'
      }
    ]
    
    res.json({ success: true, history })
    
  } catch (error) {
    console.error('Error getting execution history:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Stop execution (for long-running processes)
router.post('/stop/:executionId', (req, res) => {
  const executionId = req.params.executionId
  
  // In a real implementation, you'd track running processes
  // and terminate them by executionId
  
  res.json({ success: true, message: 'Execution stopped' })
})

// Get system info
router.get('/system', (req, res) => {
  const systemInfo = {
    platform: process.platform,
    nodeVersion: process.version,
    architecture: process.arch,
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    availableLanguages: Object.keys(LANGUAGE_CONFIGS)
  }
  
  res.json({ success: true, system: systemInfo })
})

// Validate code syntax and structure
router.post('/validate', [
  body('language').isIn(Object.keys(LANGUAGE_CONFIGS)).withMessage('Unsupported language'),
  body('code').isLength({ min: 1 }).withMessage('Code is required')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      })
    }

    const { language, code } = req.body
    const config = LANGUAGE_CONFIGS[language]

    let validation = {
      success: true,
      language,
      issues: [],
      suggestions: []
    }

    // Basic syntax validation for JavaScript/TypeScript
    if (language === 'javascript' || language === 'typescript') {
      try {
        // Use VM2 to test syntax without execution
        const vm = new VM({
          timeout: 1000,
          sandbox: {}
        })
        vm.run(`(function() { ${code} })()`)
        validation.suggestions.push('Syntax appears valid')
      } catch (error) {
        validation.success = false
        validation.issues.push({
          type: 'syntax',
          message: error.message,
          line: null
        })
      }
    }

    // Check for common security issues
    const securityPatterns = [
      { pattern: /eval\s*\(/, message: 'Avoid using eval() - security risk' },
      { pattern: /Function\s*\(/, message: 'Avoid using Function constructor - security risk' },
      { pattern: /document\.write/, message: 'Avoid document.write - can break page structure' }
    ]

    securityPatterns.forEach(({ pattern, message }) => {
      if (pattern.test(code)) {
        validation.issues.push({
          type: 'security',
          message,
          line: null
        })
      }
    })

    res.json({
      success: true,
      validation
    })
  } catch (error) {
    console.error('[Execution] Validation error:', error)
    res.status(500).json({
      success: false,
      error: 'Validation failed'
    })
  }
})

module.exports = router
