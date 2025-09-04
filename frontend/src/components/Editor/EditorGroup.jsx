import React, { useState, useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { X, Circle, Play, Square, Terminal, Plus, AlertCircle, Lightbulb } from 'lucide-react'
import { configureMonaco, getLanguageFromFilename } from '../../config/monaco_advanced'
import ErrorListPanel from '../Panels/ErrorListPanel'
import './EditorGroup.css'

const EditorGroup = ({ 
  tabs = [], 
  activeTabId, 
  onTabChange, 
  onTabClose, 
  onContentChange, 
  onOpenAI, 
  onCreateNewFile,
  onRunCode,
  loading = false,
  showTerminal = false,
  onToggleTerminal,
  // Debug props
  breakpoints = [],
  currentExecutionLine = null,
  isDebugging = false,
  isPaused = false,
  onDebugAction
}) => {
  const editorRef = useRef(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [showErrorList, setShowErrorList] = useState(false)
  const [editorErrors, setEditorErrors] = useState([])
  const [saveStatus, setSaveStatus] = useState('saved') // 'saved', 'saving', 'error'
  const [monacoReady, setMonacoReady] = useState(false)
  
  // Base URL for API calls
  const baseURL = 'http://localhost:3001/api/v2'

  // Auto-save function
  const saveFileToBackend = async (filePath, content) => {
    try {
      setSaveStatus('saving')
      const response = await fetch(`${baseURL}/files/save/default${filePath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content
        })
      })
      
      if (response.ok) {
        setSaveStatus('saved')
        console.log('File saved successfully:', filePath)
        return true
      } else {
        setSaveStatus('error')
        console.error('Failed to save file:', response.statusText)
        return false
      }
    } catch (error) {
      setSaveStatus('error')
      console.error('Error saving file:', error)
      return false
    }
  }

  // Configure Monaco when component mounts
  useEffect(() => {
    const initializeMonaco = async () => {
      try {
        console.log('[EditorGroup] Initializing Monaco...')
        await configureMonaco()
        setMonacoReady(true)
        console.log('[EditorGroup] Monaco initialized successfully')
      } catch (error) {
        console.error('[EditorGroup] Monaco initialization failed:', error)
        // Still set ready to true to allow basic editor functionality
        setMonacoReady(true)
      }
    }
    
    initializeMonaco()
  }, [])

  // Helper function to get file language
  const getFileLanguage = (filename) => {
    if (!filename) return 'javascript'
    try {
      return getLanguageFromFilename(filename)
    } catch (error) {
      console.warn('Error getting language for file:', filename, error)
      return 'javascript'
    }
  }

  // Helper function to check if language is executable
  const isExecutableLanguage = (language) => {
    return ['javascript', 'typescript', 'python', 'java', 'cpp', 'c'].includes(language)
  }

  const activeTab = tabs.find(tab => tab.id === activeTabId)

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor
    console.log('[EditorGroup] Editor mounted successfully')
    
    // Basic editor configuration
    editor.updateOptions({
      fontSize: 14,
      fontFamily: 'Fira Code, Consolas, Monaco, monospace',
      lineHeight: 20,
      tabSize: 2,
      insertSpaces: true,
      wordWrap: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      quickSuggestions: {
        other: true,
        comments: false,
        strings: false
      },
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnCommitCharacter: true,
      acceptSuggestionOnEnter: 'on',
    })

    // Add basic keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      console.log('Save triggered')
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRunCode()
    })
  }

  const handleEditorBeforeMount = (monaco) => {
    console.log('[EditorGroup] Monaco beforeMount called')
    // This ensures Monaco is properly configured before the editor mounts
    try {
      configureMonaco()
    } catch (error) {
      console.warn('[EditorGroup] Monaco configuration warning:', error)
    }
  }

  const handleEditorChange = (value) => {
    if (activeTab && onContentChange) {
      onContentChange(activeTab.id, value)
      
      // Auto-save after a short delay (debounced)
      if (activeTab.path) {
        clearTimeout(window.autoSaveTimeout)
        window.autoSaveTimeout = setTimeout(() => {
          saveFileToBackend(activeTab.path, value)
        }, 2000) // Auto-save after 2 seconds of inactivity
      }
    }
  }

  const handleTabClose = (e, tabId) => {
    e.stopPropagation()
    if (onTabClose) {
      onTabClose(tabId)
    }
  }

  const handleRunCode = async () => {
    if (!activeTab || isExecuting) return

    setIsExecuting(true)
    try {
      console.log('Running code:', activeTab.content)
      
      // Call the parent's run code handler if provided
      if (onRunCode) {
        onRunCode()
      }
      
      setTimeout(() => {
        setIsExecuting(false)
        console.log('Code execution completed')
      }, 1000) // Shorter timeout since we're just triggering the panel
    } catch (error) {
      console.error('Execution error:', error)
      setIsExecuting(false)
    }
  }

  if (loading) {
    return (
      <div className="editor-loading">
        <div className="loading-spinner"></div>
        <p>Loading editor...</p>
      </div>
    )
  }

  if (!activeTab) {
    return (
      <div className="editor-empty">
        <div className="welcome-content">
          <h2>Welcome to Studio IDE</h2>
          <p>Start by creating a new file or opening an existing one</p>
          <button className="create-file-btn" onClick={onCreateNewFile}>
            <Plus size={16} />
            New File
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="editor-group">
      {/* Tab Bar */}
      {tabs.length > 0 && (
        <div className="tab-bar">
          <div className="tabs">
            {tabs.map(tab => (
              <div
                key={tab.id}
                className={`tab ${tab.id === activeTabId ? 'active' : ''}`}
                onClick={() => onTabChange && onTabChange(tab.id)}
              >
                <Circle 
                  size={8} 
                  className={`tab-indicator ${tab.isDirty ? 'dirty' : ''}`}
                />
                <span className="tab-name">{tab.name || tab.title}</span>
                <button 
                  className="tab-close"
                  onClick={(e) => handleTabClose(e, tab.id)}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          
          <div className="tab-actions">
            {/* Save status indicator */}
            {activeTab && activeTab.path && (
              <div className={`save-status save-status-${saveStatus}`} title={
                saveStatus === 'saving' ? 'Saving...' :
                saveStatus === 'saved' ? 'All changes saved' :
                'Error saving file'
              }>
                {saveStatus === 'saving' && <div className="saving-spinner"></div>}
                {saveStatus === 'saved' && '✓'}
                {saveStatus === 'error' && '⚠'}
              </div>
            )}
            
            {/* Error indicator */}
            {editorErrors.length > 0 && (
              <button 
                className={`action-btn error-indicator ${showErrorList ? 'active' : ''}`}
                onClick={() => setShowErrorList(!showErrorList)}
                title={`${editorErrors.filter(e => e.severity === 8).length} errors, ${editorErrors.filter(e => e.severity === 4).length} warnings`}
              >
                <AlertCircle size={16} />
                <span className="error-count">{editorErrors.length}</span>
              </button>
            )}

            {activeTab && isExecutableLanguage(getFileLanguage(activeTab.name)) && (
              <button 
                className={`action-btn ${isExecuting ? 'executing' : ''}`}
                onClick={isExecuting ? () => setIsExecuting(false) : handleRunCode}
                title={isExecuting ? 'Stop Execution' : 'Run Code (Ctrl+Enter)'}
              >
                {isExecuting ? <Square size={16} /> : <Play size={16} />}
              </button>
            )}
            
            <button 
              className="action-btn"
              onClick={onToggleTerminal}
              title="Toggle Terminal"
            >
              <Terminal size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Editor */}
      {activeTab && monacoReady ? (
        <div className="editor-container">
          <Editor
            height="100%"
            language={getFileLanguage(activeTab.name)}
            value={activeTab.content || ''}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            beforeMount={handleEditorBeforeMount}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: 'Fira Code, Consolas, Monaco, monospace',
              lineHeight: 20,
              tabSize: 2,
              insertSpaces: true,
              wordWrap: 'on',
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              suggestOnTriggerCharacters: true,
              quickSuggestions: true,
              parameterHints: { enabled: true },
              formatOnType: true,
              formatOnPaste: true
            }}
          />
        </div>
      ) : activeTab && !monacoReady ? (
        <div className="editor-loading">
          <div className="loading-spinner"></div>
          <p>Initializing editor...</p>
        </div>
      ) : (
        <div className="editor-empty">
          <div className="welcome-content">
            <h2>Welcome to VS Code Studio</h2>
            <p>Start by opening a file or creating a new one</p>
            <button 
              className="action-btn primary"
              onClick={onCreateNewFile}
            >
              <Plus size={16} />
              New File
            </button>
          </div>
        </div>
      )}

      {/* Error List Panel */}
      {showErrorList && (
        <ErrorListPanel
          isVisible={showErrorList}
          onToggle={() => setShowErrorList(false)}
          currentFile={activeTab}
          editor={editorRef.current}
        />
      )}
    </div>
  )
}

export default EditorGroup
