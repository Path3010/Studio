import * as monaco from 'monaco-editor'

// Advanced Monaco Editor Configuration
export const configureMonaco = () => {
  console.log('[Monaco] Configuring advanced editor features...')

  // Configure TypeScript/JavaScript compiler options
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    reactNamespace: 'React',
    allowJs: true,
    checkJs: false,
    typeRoots: ['node_modules/@types'],
    lib: ['ES2020', 'DOM', 'DOM.Iterable']
  })

  // Configure TypeScript compiler options
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    noEmit: true,
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
    strict: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true,
    typeRoots: ['node_modules/@types']
  })

  // Enhanced diagnostics options
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
    noSuggestionDiagnostics: false,
    diagnosticCodesToIgnore: [1108, 1375, 1378]
  })

  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
    noSuggestionDiagnostics: false
  })

  // Add advanced library definitions
  addAdvancedLibraryDefinitions()

  // Register enhanced completion providers
  registerAdvancedCompletionProviders()

  // Register hover providers
  registerAdvancedHoverProviders()

  // Register code action providers
  registerAdvancedCodeActionProviders()

  // Register formatting providers
  registerAdvancedFormattingProviders()

  // Register semantic token providers
  registerSemanticTokenProviders()

  // Define advanced themes
  defineAdvancedThemes()

  // Setup advanced language features
  setupAdvancedLanguageFeatures()

  console.log('[Monaco] Advanced configuration complete')
}

function addAdvancedLibraryDefinitions() {
  // Add Node.js type definitions
  const nodeTypes = `
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
    }
    interface Global {
      [key: string]: any;
    }
  }
}

declare const process: {
  env: NodeJS.ProcessEnv;
  argv: string[];
  cwd(): string;
  exit(code?: number): never;
  nextTick(callback: Function): void;
};

declare const console: {
  log(...args: any[]): void;
  error(...args: any[]): void;
  warn(...args: any[]): void;
  info(...args: any[]): void;
  debug(...args: any[]): void;
  trace(...args: any[]): void;
  assert(value: any, message?: string): void;
  time(label?: string): void;
  timeEnd(label?: string): void;
  group(label?: string): void;
  groupEnd(): void;
  clear(): void;
  count(label?: string): void;
  countReset(label?: string): void;
  table(tabularData: any): void;
};

declare const Buffer: {
  new (str: string, encoding?: string): Buffer;
  from(str: string, encoding?: string): Buffer;
  alloc(size: number, fill?: any, encoding?: string): Buffer;
  isBuffer(obj: any): boolean;
};

interface Buffer {
  length: number;
  toString(encoding?: string, start?: number, end?: number): string;
  toJSON(): { type: 'Buffer'; data: number[] };
  slice(start?: number, end?: number): Buffer;
}
`

  monaco.languages.typescript.javascriptDefaults.addExtraLib(nodeTypes, 'node.d.ts')
  monaco.languages.typescript.typescriptDefaults.addExtraLib(nodeTypes, 'node.d.ts')

  // Add React type definitions
  const reactTypes = `
declare namespace React {
  interface Component<P = {}, S = {}> {
    props: P;
    state: S;
    setState(partialState: Partial<S>, callback?: () => void): void;
    render(): ReactNode;
  }
  
  interface FunctionComponent<P = {}> {
    (props: P): ReactElement | null;
    displayName?: string;
  }
  
  type ReactElement = {
    type: any;
    props: any;
    key: string | number | null;
  };
  
  type ReactNode = ReactElement | string | number | boolean | null | undefined;
  
  function useState<T>(initialState: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void];
  function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  function useContext<T>(context: Context<T>): T;
  function useReducer<S, A>(reducer: (state: S, action: A) => S, initialState: S): [S, (action: A) => void];
  function useMemo<T>(factory: () => T, deps: any[]): T;
  function useCallback<T extends Function>(callback: T, deps: any[]): T;
  function useRef<T>(initialValue: T): { current: T };
  
  interface Context<T> {
    Provider: ComponentType<{ value: T; children?: ReactNode }>;
    Consumer: ComponentType<{ children: (value: T) => ReactNode }>;
  }
  
  function createContext<T>(defaultValue: T): Context<T>;
  
  type ComponentType<P = {}> = ComponentClass<P> | FunctionComponent<P>;
  type ComponentClass<P = {}> = new (props: P) => Component<P>;
}

declare function require(moduleName: string): any;
declare const module: { exports: any };
declare const exports: any;
declare const __dirname: string;
declare const __filename: string;
`

  monaco.languages.typescript.javascriptDefaults.addExtraLib(reactTypes, 'react.d.ts')
  monaco.languages.typescript.typescriptDefaults.addExtraLib(reactTypes, 'react.d.ts')

  // Add Express.js types
  const expressTypes = `
declare namespace Express {
  interface Request {
    body: any;
    params: { [key: string]: string };
    query: { [key: string]: string };
    headers: { [key: string]: string };
    method: string;
    url: string;
    path: string;
    ip: string;
    get(name: string): string;
  }
  
  interface Response {
    status(code: number): Response;
    json(obj: any): Response;
    send(body: any): Response;
    redirect(url: string): Response;
    cookie(name: string, value: string, options?: any): Response;
    header(name: string, value: string): Response;
    end(): Response;
  }
  
  interface NextFunction {
    (err?: any): void;
  }
  
  interface Application {
    get(path: string, ...handlers: RequestHandler[]): Application;
    post(path: string, ...handlers: RequestHandler[]): Application;
    put(path: string, ...handlers: RequestHandler[]): Application;
    delete(path: string, ...handlers: RequestHandler[]): Application;
    use(...handlers: RequestHandler[]): Application;
    listen(port: number, callback?: () => void): any;
  }
  
  type RequestHandler = (req: Request, res: Response, next: NextFunction) => void;
}

declare function express(): Express.Application;
declare namespace express {
  function json(): Express.RequestHandler;
  function urlencoded(options?: any): Express.RequestHandler;
  function static(path: string): Express.RequestHandler;
}
`

  monaco.languages.typescript.javascriptDefaults.addExtraLib(expressTypes, 'express.d.ts')
}

function registerAdvancedCompletionProviders() {
  // JavaScript/TypeScript advanced completion
  monaco.languages.registerCompletionItemProvider('javascript', {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      }

      const suggestions = []

      // React hooks
      if (word.word.startsWith('use')) {
        suggestions.push(
          {
            label: 'useState',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'useState(${1:initialValue})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'React hook for managing state',
            range
          },
          {
            label: 'useEffect',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'useEffect(() => {\\n\\t${1:// Effect logic}\\n}, [${2:dependencies}])',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'React hook for side effects',
            range
          }
        )
      }

      // Console methods
      if (word.word.startsWith('console')) {
        suggestions.push(
          {
            label: 'console.log',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'console.log(${1:value})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Outputs a message to the console',
            range
          },
          {
            label: 'console.error',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'console.error(${1:error})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Outputs an error message to the console',
            range
          }
        )
      }

      // Async/await patterns
      if (word.word.includes('async')) {
        suggestions.push({
          label: 'async function',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'async function ${1:functionName}(${2:params}) {\\n\\t${3:// Function body}\\n\\treturn ${4:result};\\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Async function declaration',
          range
        })
      }

      return { suggestions }
    }
  })

  // Python completion provider
  monaco.languages.registerCompletionItemProvider('python', {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      }

      const suggestions = [
        {
          label: 'def',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'def ${1:function_name}(${2:params}):\\n\\t${3:pass}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Function definition',
          range
        },
        {
          label: 'class',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'class ${1:ClassName}:\\n\\tdef __init__(self${2:, params}):\\n\\t\\t${3:pass}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Class definition',
          range
        },
        {
          label: 'if __name__ == "__main__"',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'if __name__ == "__main__":\\n\\t${1:main()}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Main execution guard',
          range
        }
      ]

      return { suggestions }
    }
  })
}

function registerAdvancedHoverProviders() {
  monaco.languages.registerHoverProvider('javascript', {
    provideHover: (model, position) => {
      const word = model.getWordAtPosition(position)
      if (!word) return null

      const hoverInfo = {
        'console': {
          contents: [
            { value: '**Console API**' },
            { value: 'The console object provides access to the browser\'s debugging console.' },
            { value: '```javascript\\nconsole.log(value)\\nconsole.error(error)\\nconsole.warn(warning)\\n```' }
          ]
        },
        'useState': {
          contents: [
            { value: '**React.useState**' },
            { value: 'Returns a stateful value and a function to update it.' },
            { value: '```javascript\\nconst [state, setState] = useState(initialState)\\n```' }
          ]
        },
        'useEffect': {
          contents: [
            { value: '**React.useEffect**' },
            { value: 'Performs side effects in function components.' },
            { value: '```javascript\\nuseEffect(() => {\\n  // effect\\n}, [dependencies])\\n```' }
          ]
        }
      }

      const info = hoverInfo[word.word]
      if (info) {
        return {
          range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
          contents: info.contents
        }
      }

      return null
    }
  })
}

function registerAdvancedCodeActionProviders() {
  monaco.languages.registerCodeActionProvider('javascript', {
    provideCodeActions: (model, range, context) => {
      const actions = []
      
      // Auto-fix common issues
      context.markers.forEach(marker => {
        if (marker.message.includes('is not defined')) {
          const variableName = marker.message.match(/'([^']+)'/)?.[1]
          if (variableName) {
            actions.push({
              title: `Declare variable '${variableName}'`,
              kind: 'quickfix',
              edit: {
                edits: [{
                  resource: model.uri,
                  edit: {
                    range: new monaco.Range(marker.startLineNumber, 1, marker.startLineNumber, 1),
                    text: `const ${variableName} = undefined;\\n`
                  }
                }]
              }
            })
          }
        }
      })

      // Add import suggestions
      const text = model.getValueInRange(range)
      if (text.includes('React') && !model.getValue().includes('import React')) {
        actions.push({
          title: 'Add React import',
          kind: 'quickfix',
          edit: {
            edits: [{
              resource: model.uri,
              edit: {
                range: new monaco.Range(1, 1, 1, 1),
                text: "import React from 'react';\\n"
              }
            }]
          }
        })
      }

      return { actions, dispose: () => {} }
    }
  })
}

function registerAdvancedFormattingProviders() {
  monaco.languages.registerDocumentFormattingEditProvider('javascript', {
    provideDocumentFormattingEdits: (model) => {
      // Basic formatting rules
      const text = model.getValue()
      let formatted = text
        .replace(/;\\s*\\n/g, ';\\n')  // Normalize semicolons
        .replace(/\\{\\s*\\n/g, '{\\n')   // Normalize opening braces
        .replace(/\\n\\s*\\}/g, '\\n}')   // Normalize closing braces
      
      return [{
        range: model.getFullModelRange(),
        text: formatted
      }]
    }
  })
}

function registerSemanticTokenProviders() {
  // Enhanced syntax highlighting with semantic tokens
  monaco.languages.registerDocumentSemanticTokensProvider('javascript', {
    getLegend: () => ({
      tokenTypes: ['class', 'function', 'variable', 'parameter', 'property', 'keyword'],
      tokenModifiers: ['declaration', 'definition', 'readonly', 'static', 'deprecated']
    }),
    
    provideDocumentSemanticTokens: (model) => {
      const lines = model.getLinesContent()
      const data = []
      
      lines.forEach((line, lineIndex) => {
        // Simple pattern matching for semantic highlighting
        const functionMatch = line.match(/function\\s+(\\w+)/g)
        if (functionMatch) {
          functionMatch.forEach(match => {
            const startIndex = line.indexOf(match)
            data.push(lineIndex, startIndex, match.length, 1, 0) // function type
          })
        }
        
        const classMatch = line.match(/class\\s+(\\w+)/g)
        if (classMatch) {
          classMatch.forEach(match => {
            const startIndex = line.indexOf(match)
            data.push(lineIndex, startIndex, match.length, 0, 0) // class type
          })
        }
      })
      
      return { data: new Uint32Array(data) }
    }
  })
}

function defineAdvancedThemes() {
  // VS Code Dark+ theme (enhanced)
  monaco.editor.defineTheme('vs-code-dark-plus', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      // JavaScript/TypeScript
      { token: 'keyword.js', foreground: '569CD6', fontStyle: 'bold' },
      { token: 'string.js', foreground: 'CE9178' },
      { token: 'comment.js', foreground: '6A9955', fontStyle: 'italic' },
      { token: 'number.js', foreground: 'B5CEA8' },
      { token: 'regexp.js', foreground: 'D16969' },
      { token: 'operator.js', foreground: 'D4D4D4' },
      { token: 'type.js', foreground: '4EC9B0' },
      { token: 'variable.js', foreground: '9CDCFE' },
      { token: 'function.js', foreground: 'DCDCAA' },
      { token: 'class.js', foreground: '4EC9B0' },
      
      // Python
      { token: 'keyword.python', foreground: 'FF7B72' },
      { token: 'string.python', foreground: 'A5C261' },
      { token: 'comment.python', foreground: '8B949E', fontStyle: 'italic' },
      { token: 'number.python', foreground: '79C0FF' },
      { token: 'function.python', foreground: 'D2A8FF' },
      
      // HTML
      { token: 'tag.html', foreground: '569CD6' },
      { token: 'attribute.name.html', foreground: '9CDCFE' },
      { token: 'attribute.value.html', foreground: 'CE9178' },
      
      // CSS
      { token: 'property.css', foreground: '9CDCFE' },
      { token: 'value.css', foreground: 'CE9178' },
      { token: 'selector.css', foreground: 'D7BA7D' },
      
      // JSON
      { token: 'key.json', foreground: '9CDCFE' },
      { token: 'value.json', foreground: 'CE9178' },
      { token: 'number.json', foreground: 'B5CEA8' }
    ],
    colors: {
      'editor.background': '#1E1E1E',
      'editor.foreground': '#D4D4D4',
      'editor.lineHighlightBackground': '#2A2D2E',
      'editor.selectionBackground': '#264F78',
      'editor.inactiveSelectionBackground': '#3A3D41',
      'editorCursor.foreground': '#AEAFAD',
      'editorWhitespace.foreground': '#3B3A32',
      'editorIndentGuide.activeBackground': '#707070',
      'editorIndentGuide.background': '#404040'
    }
  })

  // GitHub Dark theme
  monaco.editor.defineTheme('github-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: 'FF7B72' },
      { token: 'string', foreground: 'A5C261' },
      { token: 'comment', foreground: '8B949E', fontStyle: 'italic' },
      { token: 'number', foreground: '79C0FF' },
      { token: 'function', foreground: 'D2A8FF' },
      { token: 'variable', foreground: 'FFA657' },
      { token: 'type', foreground: '7EE787' }
    ],
    colors: {
      'editor.background': '#0D1117',
      'editor.foreground': '#E6EDF3',
      'editor.lineHighlightBackground': '#161B22',
      'editor.selectionBackground': '#1F6FEB',
      'editorCursor.foreground': '#FFA657'
    }
  })

  // Light professional theme
  monaco.editor.defineTheme('professional-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '0000FF', fontStyle: 'bold' },
      { token: 'string', foreground: 'A31515' },
      { token: 'comment', foreground: '008000', fontStyle: 'italic' },
      { token: 'number', foreground: '098658' },
      { token: 'function', foreground: '795E26' },
      { token: 'variable', foreground: '001080' },
      { token: 'type', foreground: '267F99' }
    ],
    colors: {
      'editor.background': '#FFFFFF',
      'editor.foreground': '#000000',
      'editor.lineHighlightBackground': '#F3F3F3',
      'editor.selectionBackground': '#ADD6FF'
    }
  })
}

function setupAdvancedLanguageFeatures() {
  // Configure language-specific features
  monaco.languages.setLanguageConfiguration('javascript', {
    comments: {
      lineComment: '//',
      blockComment: ['/*', '*/']
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')']
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
      { open: '`', close: '`' }
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
      { open: '`', close: '`' }
    ],
    indentationRules: {
      increaseIndentPattern: /^.*\{[^}]*$/,
      decreaseIndentPattern: /^\s*\}.*$/
    }
  })
}

// Language detection from filename
export const getLanguageFromFilename = (filename) => {
  const extension = filename.split('.').pop()?.toLowerCase()
  
  const languageMap = {
    'js': 'javascript',
    'jsx': 'javascript',
    'mjs': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'pyx': 'python',
    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'json': 'json',
    'xml': 'xml',
    'md': 'markdown',
    'txt': 'plaintext',
    'sql': 'sql',
    'php': 'php',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'h': 'c',
    'hpp': 'cpp',
    'cs': 'csharp',
    'go': 'go',
    'rs': 'rust',
    'rb': 'ruby',
    'sh': 'shell',
    'bash': 'shell',
    'ps1': 'powershell',
    'yaml': 'yaml',
    'yml': 'yaml',
    'toml': 'toml',
    'ini': 'ini',
    'dockerfile': 'dockerfile'
  }
  
  return languageMap[extension] || 'plaintext'
}

// Advanced editor options
export const getAdvancedEditorOptions = () => ({
  fontSize: 14,
  fontFamily: "'Fira Code', 'JetBrains Mono', 'Cascadia Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
  fontLigatures: true,
  lineHeight: 21,
  letterSpacing: 0.5,
  tabSize: 2,
  insertSpaces: true,
  wordWrap: 'on',
  wordWrapColumn: 120,
  minimap: { 
    enabled: true,
    maxColumn: 120,
    renderCharacters: false,
    scale: 1
  },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  glyphMargin: true,
  folding: true,
  foldingStrategy: 'indentation',
  showFoldingControls: 'mouseover',
  unfoldOnClickAfterEndOfLine: false,
  lightbulb: { enabled: true },
  quickSuggestions: {
    other: true,
    comments: false,
    strings: false
  },
  suggestOnTriggerCharacters: true,
  acceptSuggestionOnCommitCharacter: true,
  acceptSuggestionOnEnter: 'on',
  wordBasedSuggestions: true,
  parameterHints: { enabled: true },
  autoClosingBrackets: 'always',
  autoClosingQuotes: 'always',
  autoSurround: 'languageDefined',
  bracketPairColorization: { enabled: true },
  guides: {
    bracketPairs: true,
    bracketPairsHorizontal: 'active',
    highlightActiveBracketPair: true,
    indentation: true,
    highlightActiveIndentation: true
  },
  renderLineHighlight: 'gutter',
  renderWhitespace: 'selection',
  rulers: [80, 120],
  smoothScrolling: true,
  cursorBlinking: 'smooth',
  cursorSmoothCaretAnimation: true,
  multiCursorModifier: 'ctrlCmd',
  selectionHighlight: true,
  occurrencesHighlight: true,
  codeLens: true,
  colorDecorators: true,
  contextmenu: true,
  mouseWheelZoom: true,
  links: true,
  hover: { enabled: true, delay: 300 },
  find: {
    seedSearchStringFromSelection: 'always',
    autoFindInSelection: 'never',
    globalFindClipboard: false
  },
  gotoLocation: {
    multipleTypeDefinitions: 'peek',
    multipleDeclarations: 'peek',
    multipleImplementations: 'peek',
    multipleReferences: 'peek'
  }
})

export default {
  configureMonaco,
  getLanguageFromFilename,
  getAdvancedEditorOptions
}
