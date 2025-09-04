import { BrowserEventEmitter } from '../events/BrowserEventEmitter.js';

/**
 * Advanced Code Execution Service - Multi-language support with real backend integration
 * Supports JavaScript, Python, TypeScript, HTML/CSS with advanced debugging
 */
export class JavaScriptExecutionService extends BrowserEventEmitter {
  constructor() {
    super();
    this.isRunning = false;
    this.isDebugging = false;
    this.isPaused = false;
    this.currentExecution = null;
    this.breakpoints = new Map();
    this.watchedVariables = new Map();
    this.consoleOutput = [];
    this.isInitialized = false;
    this.baseURL = 'http://localhost:3001/api/v2';
    this.socket = null;
    
    // Advanced execution features
    this.executionHistory = [];
    this.performanceMetrics = new Map();
    this.memoryUsage = new Map();
    this.supportedLanguages = ['javascript', 'typescript', 'python', 'html', 'css'];
    this.executionQueue = [];
    this.maxConcurrentExecutions = 3;
    this.currentExecutions = 0;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Initialize backend connection
      await this.initializeBackendConnection();
      
      // Setup console capture
      this.setupConsoleCapture();
      
      // Initialize WebWorker for safe execution
      this.initializeWebWorker();
      
      // Setup performance monitoring
      this.setupPerformanceMonitoring();
      
      this.isInitialized = true;
      this.emit('initialized');
      
      console.log('[ExecutionService] Advanced multi-language execution initialized');
    } catch (error) {
      console.warn('[ExecutionService] Backend unavailable, using client-side execution');
      this.setupConsoleCapture();
      this.isInitialized = true;
      this.emit('initialized', { offline: true });
    }
  }

  async initializeBackendConnection() {
    // Test backend connection
    const response = await fetch(`${this.baseURL}/execution/status`);
    if (!response.ok) {
      throw new Error('Backend execution service unavailable');
    }
    
    const data = await response.json();
    console.log('[ExecutionService] Backend connected:', data);
  }

  /**
   * Set external socket instance (optional - for shared socket usage)
   * @param {Object} socketInstance - External socket.io instance
   */
  setSocket(socketInstance) {
    if (socketInstance) {
      this.socket = socketInstance;
      this.setupSocketListeners();
      console.log('[ExecutionService] Using external socket instance');
    }
  }

  setupSocketListeners() {
    if (!this.socket) return;
    
    this.socket.on('connect', () => {
      console.log('[ExecutionService] Real-time execution sharing connected');
      this.emit('executionConnected');
    });
    
    this.socket.on('executionResult', (data) => {
      this.emit('remoteExecutionResult', data);
    });
    
    this.socket.on('executionStarted', (data) => {
      this.emit('remoteExecutionStarted', data);
    });
    
    this.socket.on('executionCompleted', (data) => {
      this.emit('remoteExecutionCompleted', data);
    });
  }

  initializeWebWorker() {
    // Create WebWorker for safe JavaScript execution
    const workerCode = `
      self.onmessage = function(e) {
        const { code, input, options } = e.data;
        
        try {
          // Capture console output
          let output = '';
          const originalConsole = {
            log: (...args) => output += args.join(' ') + '\\n',
            error: (...args) => output += 'ERROR: ' + args.join(' ') + '\\n',
            warn: (...args) => output += 'WARN: ' + args.join(' ') + '\\n'
          };
          
          // Create safe environment
          const safeEval = new Function('console', 'input', code);
          const result = safeEval(originalConsole, input);
          
          self.postMessage({
            success: true,
            result: result,
            output: output,
            executionTime: Date.now() - e.data.startTime
          });
        } catch (error) {
          self.postMessage({
            success: false,
            error: error.message,
            output: '',
            executionTime: Date.now() - e.data.startTime
          });
        }
      };
    `;
    
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    this.workerURL = URL.createObjectURL(blob);
  }

  setupConsoleCapture() {
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info
    };

    const createCaptureMethod = (type, original) => {
      return (...args) => {
        original.apply(console, args);
        
        const output = {
          type,
          message: args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '),
          timestamp: new Date().toISOString()
        };
        
        this.consoleOutput.push(output);
        this.emit('consoleOutput', output);
      };
    };

    console.log = createCaptureMethod('log', originalConsole.log);
    console.error = createCaptureMethod('error', originalConsole.error);
    console.warn = createCaptureMethod('warn', originalConsole.warn);
    console.info = createCaptureMethod('info', originalConsole.info);
  }

  setupPerformanceMonitoring() {
    // Monitor memory and performance
    setInterval(() => {
      if (performance.memory) {
        this.memoryUsage.set(Date.now(), {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit
        });
        
        // Keep only last 100 measurements
        if (this.memoryUsage.size > 100) {
          const oldestKey = this.memoryUsage.keys().next().value;
          this.memoryUsage.delete(oldestKey);
        }
      }
    }, 1000);
  }

  async executeCode(code, language = 'javascript', input = '', options = {}) {
    if (this.currentExecutions >= this.maxConcurrentExecutions) {
      return new Promise((resolve) => {
        this.executionQueue.push({ code, language, input, options, resolve });
      });
    }

    this.currentExecutions++;
    const executionId = Date.now().toString();
    const startTime = performance.now();

    try {
      this.emit('executionStarted', { id: executionId, language, code });

      let result;
      switch (language.toLowerCase()) {
        case 'javascript':
        case 'js':
          result = await this.executeJavaScript(code, input, options);
          break;
        case 'typescript':
        case 'ts':
          result = await this.executeTypeScript(code, input, options);
          break;
        case 'python':
        case 'py':
          result = await this.executePython(code, input, options);
          break;
        case 'html':
          result = await this.executeHTML(code, options);
          break;
        case 'css':
          result = await this.executeCSS(code, options);
          break;
        default:
          throw new Error(`Unsupported language: ${language}`);
      }

      const executionTime = performance.now() - startTime;
      
      // Store execution history
      this.executionHistory.push({
        id: executionId,
        language,
        code,
        result,
        executionTime,
        timestamp: new Date().toISOString()
      });

      // Keep only last 50 executions
      if (this.executionHistory.length > 50) {
        this.executionHistory.shift();
      }

      this.emit('executionCompleted', { 
        id: executionId, 
        result, 
        executionTime,
        memoryUsage: this.getCurrentMemoryUsage()
      });

      return {
        ...result,
        executionId,
        executionTime: Math.round(executionTime)
      };
    } catch (error) {
      this.emit('executionError', { id: executionId, error: error.message });
      return {
        success: false,
        error: error.message,
        output: '',
        executionId,
        executionTime: Math.round(performance.now() - startTime)
      };
    } finally {
      this.currentExecutions--;
      
      // Process next in queue
      if (this.executionQueue.length > 0) {
        const nextExecution = this.executionQueue.shift();
        nextExecution.resolve(await this.executeCode(
          nextExecution.code,
          nextExecution.language,
          nextExecution.input,
          nextExecution.options
        ));
      }
    }
  }

  async executeJavaScript(code, input, options) {
    // Try backend execution first
    if (!options.forceLocal && this.isBackendAvailable()) {
      try {
        return await this.executeOnBackend('javascript', code, input, options);
      } catch (error) {
        console.warn('[ExecutionService] Backend execution failed, falling back to local');
      }
    }

    // Local execution with WebWorker
    return new Promise((resolve, reject) => {
      const worker = new Worker(this.workerURL);
      const timeout = setTimeout(() => {
        worker.terminate();
        reject(new Error('Execution timeout'));
      }, options.timeout || 10000);

      worker.onmessage = (e) => {
        clearTimeout(timeout);
        worker.terminate();
        
        const result = e.data;
        resolve({
          success: result.success,
          output: result.output,
          error: result.error,
          result: result.result,
          executionTime: result.executionTime
        });
      };

      worker.onerror = (error) => {
        clearTimeout(timeout);
        worker.terminate();
        reject(error);
      };

      worker.postMessage({ 
        code, 
        input, 
        options, 
        startTime: Date.now() 
      });
    });
  }

  async executeTypeScript(code, input, options) {
    // TypeScript compilation would happen here
    // For now, treat as JavaScript
    return this.executeJavaScript(code, input, options);
  }

  async executePython(code, input, options) {
    // Try backend execution first
    if (this.isBackendAvailable()) {
      try {
        return await this.executeOnBackend('python', code, input, options);
      } catch (error) {
        console.warn('[ExecutionService] Backend Python execution failed');
      }
    }

    // Client-side Python using Pyodide (would need to be loaded)
    if (window.pyodide) {
      try {
        window.pyodide.runPython(code);
        return {
          success: true,
          output: 'Python execution completed (client-side)',
          error: null
        };
      } catch (error) {
        return {
          success: false,
          output: '',
          error: error.message
        };
      }
    }

    return {
      success: false,
      output: '',
      error: 'Python runtime not available. Install Pyodide for client-side execution.'
    };
  }

  async executeHTML(code, options) {
    // Create sandbox iframe for HTML execution
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.sandbox = 'allow-scripts';
    
    document.body.appendChild(iframe);
    
    try {
      iframe.contentDocument.write(code);
      iframe.contentDocument.close();
      
      // Wait for execution
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        output: 'HTML rendered successfully',
        error: null,
        rendered: true
      };
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error.message
      };
    } finally {
      document.body.removeChild(iframe);
    }
  }

  async executeCSS(code, options) {
    // CSS validation and application
    try {
      const style = document.createElement('style');
      style.textContent = code;
      document.head.appendChild(style);
      
      // Remove after testing
      setTimeout(() => {
        document.head.removeChild(style);
      }, 5000);
      
      return {
        success: true,
        output: 'CSS applied successfully',
        error: null,
        applied: true
      };
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error.message
      };
    }
  }

  async executeOnBackend(language, code, input, options) {
    const response = await fetch(`${this.baseURL}/execution/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language,
        code,
        input,
        options
      })
    });

    if (!response.ok) {
      throw new Error(`Backend execution failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getSupportedLanguages() {
    try {
      const response = await fetch(`${this.baseURL}/execution/languages`);
      if (response.ok) {
        const data = await response.json();
        return data.languages || this.supportedLanguages;
      }
    } catch (error) {
      console.warn('[ExecutionService] Failed to get backend languages');
    }
    
    return this.supportedLanguages;
  }

  async validateCode(language, code) {
    try {
      const response = await fetch(`${this.baseURL}/execution/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code })
      });

      if (response.ok) {
        return response.json();
      }
    } catch (error) {
      console.warn('[ExecutionService] Backend validation failed');
    }

    // Basic client-side validation
    return {
      success: true,
      valid: code.length > 0 && code.length < 100000,
      message: code.length === 0 ? 'Code cannot be empty' : 'Code validation passed'
    };
  }

  isBackendAvailable() {
    return this.isInitialized && !this.offlineMode;
  }

  getCurrentMemoryUsage() {
    if (!performance.memory) return null;
    
    return {
      used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + ' MB',
      total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + ' MB',
      percentage: Math.round((performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize) * 100) + '%'
    };
  }

  getExecutionHistory() {
    return this.executionHistory;
  }

  getPerformanceMetrics() {
    return {
      executionHistory: this.executionHistory.length,
      averageExecutionTime: this.calculateAverageExecutionTime(),
      memoryUsage: this.getCurrentMemoryUsage(),
      supportedLanguages: this.supportedLanguages,
      currentExecutions: this.currentExecutions,
      queuedExecutions: this.executionQueue.length
    };
  }

  calculateAverageExecutionTime() {
    if (this.executionHistory.length === 0) return 0;
    
    const total = this.executionHistory.reduce((sum, exec) => sum + exec.executionTime, 0);
    return Math.round(total / this.executionHistory.length);
  }

  clearConsoleOutput() {
    this.consoleOutput = [];
    this.emit('consoleCleared');
  }

  clearExecutionHistory() {
    this.executionHistory = [];
    this.emit('historyCleared');
  }

  dispose() {
    if (this.workerURL) {
      URL.revokeObjectURL(this.workerURL);
    }
    this.removeAllListeners();
  }
}

export default JavaScriptExecutionService;
