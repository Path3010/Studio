import React, { useState } from 'react'
import FileExplorer from '../Panels/FileExplorer'
import SearchPanel from '../Panels/SearchPanel'
import GitPanel from '../Panels/GitPanel'
import DebugVariables from './DebugVariables'
import DebugCallStack from './DebugCallStack'
import DebugWatch from './DebugWatch'
import DebugBreakpoints from './DebugBreakpoints'
import DebugTestRunner from './DebugTestRunner'
import './SideBar.css'

const SideBar = ({ 
  activeView, 
  fileTree, 
  onFileSelect, 
  onToggleFolder,
  onFileOperation,
  selectedFile,
  expandedFolders = new Set(),
  isVisible = true,
  // Debug props
  debugVariables = {},
  debugCallStack = [],
  debugWatchExpressions = [],
  debugBreakpoints = [],
  isDebugging = false,
  isPaused = false,
  onDebugAction
}) => {
  const [expandedVariablePaths, setExpandedVariablePaths] = useState(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  const renderView = () => {
    switch (activeView) {
      case 'explorer':
        return (
          <FileExplorer
            fileTree={fileTree}
            onFileSelect={onFileSelect}
            onFileCreate={onFileOperation}
            onFileDelete={onFileOperation}
            onFileRename={onFileOperation}
            onFolderCreate={onFileOperation}
            onFolderExpand={onToggleFolder}
            currentFile={selectedFile}
          />
        )
      case 'search':
        return (
          <SearchPanel
            onSearch={(query, options) => {
              console.log('Search:', query, options)
              // Implement search functionality
            }}
            onReplace={(searchTerm, replaceWith, options) => {
              console.log('Replace:', searchTerm, replaceWith, options)
              // Implement replace functionality
            }}
            fileTree={fileTree}
          />
        )
      case 'source-control':
        return (
          <GitPanel
            repository={{ name: 'Studio IDE', path: '/workspace' }}
            changes={[
              { path: 'src/App.jsx', status: 'modified' },
              { path: 'src/components/Layout.jsx', status: 'added' },
              { path: 'README.md', status: 'staged' }
            ]}
            branches={[
              { name: 'main', ahead: 0, behind: 0 },
              { name: 'feature/new-ui', ahead: 3, behind: 1 }
            ]}
            currentBranch="main"
            onCommit={(message, files) => {
              console.log('Commit:', message, files)
              // Implement commit functionality
            }}
            onPush={() => console.log('Push')}
            onPull={() => console.log('Pull')}
            onStage={(change) => console.log('Stage:', change)}
            onUnstage={(change) => console.log('Unstage:', change)}
            onDiscard={(change) => console.log('Discard:', change)}
            onCreateBranch={(name) => console.log('Create branch:', name)}
            onSwitchBranch={(branch) => console.log('Switch to:', branch.name)}
          />
        )
      case 'run':
        return (
          <div className="sidebar-section debug-section">
            <div className="section-header">
              <span className="section-title">RUN AND DEBUG</span>
            </div>
            <div className="debug-panels">
              <div className="debug-panel">
                <DebugTestRunner 
                  onDebugAction={onDebugAction}
                  isDebugging={isDebugging}
                  isPaused={isPaused}
                />
              </div>
              
              <div className="debug-panel">
                <DebugVariables 
                  variables={debugVariables}
                  expandedPaths={expandedVariablePaths}
                  onVariableExpand={(path) => {
                    const newExpanded = new Set(expandedVariablePaths)
                    if (newExpanded.has(path)) {
                      newExpanded.delete(path)
                    } else {
                      newExpanded.add(path)
                    }
                    setExpandedVariablePaths(newExpanded)
                  }}
                />
              </div>
              
              <div className="debug-panel">
                <DebugWatch 
                  watchExpressions={debugWatchExpressions}
                  onAddWatch={(expression) => onDebugAction?.('addWatch', expression)}
                  onRemoveWatch={(index) => onDebugAction?.('removeWatch', index)}
                  onUpdateWatch={(index, expression) => onDebugAction?.('updateWatch', index, expression)}
                  onRefreshWatch={() => onDebugAction?.('refreshWatch')}
                />
              </div>
              
              <div className="debug-panel">
                <DebugCallStack 
                  callStack={debugCallStack}
                  onFrameSelect={(index) => onDebugAction?.('selectFrame', index)}
                />
              </div>
              
              <div className="debug-panel">
                <DebugBreakpoints 
                  breakpoints={debugBreakpoints}
                  onToggleBreakpoint={(index) => onDebugAction?.('toggleBreakpoint', index)}
                  onRemoveBreakpoint={(index) => onDebugAction?.('removeBreakpoint', index)}
                  onRemoveAllBreakpoints={() => onDebugAction?.('removeAllBreakpoints')}
                  onGoToBreakpoint={(bp) => onDebugAction?.('goToBreakpoint', bp)}
                />
              </div>
            </div>
          </div>
        )
      case 'extensions':
        return (
          <div className="sidebar-section">
            <div className="section-header">
              <span className="section-title">EXTENSIONS</span>
            </div>
            <div className="content">
              <p>Extension marketplace coming soon...</p>
            </div>
          </div>
        )
      default:
        return (
          <div className="sidebar-section">
            <div className="section-header">
              <span className="section-title">{activeView.toUpperCase()}</span>
            </div>
            <div className="content">Coming soon...</div>
          </div>
        )
    }
  }

  if (!isVisible) return null

  return (
    <div className="sidebar">
      {renderView()}
    </div>
  )
}

export default SideBar
