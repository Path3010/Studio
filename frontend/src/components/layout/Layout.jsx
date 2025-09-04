import React, { useState, useEffect, useCallback } from 'react'
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'
import './Layout.css'

/**
 * Main Layout Component - VS Code-like IDE Layout
 * Provides resizable panels and dynamic layout management
 */
const Layout = ({ 
  titleBar,
  activityBar,
  sidebar,
  editorGroup,
  bottomPanel,
  statusBar,
  onLayoutChange,
  defaultLayout = {
    sidebarWidth: 300,
    bottomPanelHeight: 250,
    sidebarVisible: true,
    bottomPanelVisible: true
  }
}) => {
  const [layout, setLayout] = useState(defaultLayout)
  const [isDragging, setIsDragging] = useState(false)

  // Layout persistence
  useEffect(() => {
    const savedLayout = localStorage.getItem('ide-layout')
    if (savedLayout) {
      try {
        const parsed = JSON.parse(savedLayout)
        setLayout(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.warn('Failed to parse saved layout:', error)
      }
    }
  }, [])

  // Save layout changes
  const handleLayoutChange = useCallback((newLayout) => {
    setLayout(prev => {
      const updated = { ...prev, ...newLayout }
      localStorage.setItem('ide-layout', JSON.stringify(updated))
      onLayoutChange?.(updated)
      return updated
    })
  }, [onLayoutChange])

  // Toggle sidebar visibility
  const toggleSidebar = useCallback(() => {
    handleLayoutChange({ sidebarVisible: !layout.sidebarVisible })
  }, [layout.sidebarVisible, handleLayoutChange])

  // Toggle bottom panel visibility
  const toggleBottomPanel = useCallback(() => {
    handleLayoutChange({ bottomPanelVisible: !layout.bottomPanelVisible })
  }, [layout.bottomPanelVisible, handleLayoutChange])

  // Handle panel resize
  const handlePanelResize = useCallback((sizes, panelType) => {
    if (panelType === 'sidebar') {
      handleLayoutChange({ sidebarWidth: sizes[0] })
    } else if (panelType === 'bottom') {
      handleLayoutChange({ bottomPanelHeight: sizes[1] })
    }
  }, [handleLayoutChange])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey) {
        switch (e.key) {
          case 'b':
          case 'B':
            e.preventDefault()
            toggleSidebar()
            break
          case '`':
            e.preventDefault()
            toggleBottomPanel()
            break
          default:
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [toggleSidebar, toggleBottomPanel])

  return (
    <div className="ide-layout" data-dragging={isDragging}>
      {/* Title Bar */}
      <div className="layout-title-bar">
        {titleBar}
      </div>

      {/* Main Content Area */}
      <div className="layout-main">
        <PanelGroup 
          direction="horizontal"
          onLayout={(sizes) => handlePanelResize(sizes, 'sidebar')}
        >
          {/* Activity Bar + Sidebar */}
          {layout.sidebarVisible && (
            <>
              <Panel 
                defaultSize={layout.sidebarWidth} 
                minSize={200}
                maxSize={600}
                className="layout-sidebar-panel"
              >
                <div className="layout-sidebar-container">
                  {/* Activity Bar */}
                  <div className="layout-activity-bar">
                    {activityBar}
                  </div>
                  
                  {/* Sidebar Content */}
                  <div className="layout-sidebar-content">
                    {sidebar}
                  </div>
                </div>
              </Panel>

              <PanelResizeHandle 
                className="layout-resize-handle layout-resize-handle-vertical"
                onDragging={setIsDragging}
              />
            </>
          )}

          {/* Editor + Bottom Panel Area */}
          <Panel minSize={400} className="layout-editor-panel">
            <PanelGroup 
              direction="vertical"
              onLayout={(sizes) => handlePanelResize(sizes, 'bottom')}
            >
              {/* Editor Group */}
              <Panel 
                minSize={300} 
                className="layout-editor-container"
              >
                {editorGroup}
              </Panel>

              {/* Bottom Panel */}
              {layout.bottomPanelVisible && (
                <>
                  <PanelResizeHandle 
                    className="layout-resize-handle layout-resize-handle-horizontal"
                    onDragging={setIsDragging}
                  />
                  
                  <Panel 
                    defaultSize={layout.bottomPanelHeight}
                    minSize={150}
                    maxSize={500}
                    className="layout-bottom-panel"
                  >
                    {bottomPanel}
                  </Panel>
                </>
              )}
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>

      {/* Status Bar */}
      <div className="layout-status-bar">
        {statusBar}
      </div>

      {/* Layout Controls (for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="layout-debug-controls">
          <button onClick={toggleSidebar}>
            Toggle Sidebar (Ctrl+B)
          </button>
          <button onClick={toggleBottomPanel}>
            Toggle Panel (Ctrl+`)
          </button>
          <span>
            Sidebar: {layout.sidebarWidth}px | 
            Panel: {layout.bottomPanelHeight}px
          </span>
        </div>
      )}
    </div>
  )
}

// Layout context for child components
export const LayoutContext = React.createContext({
  layout: {},
  toggleSidebar: () => {},
  toggleBottomPanel: () => {},
  updateLayout: () => {}
})

// Hook for using layout context
export const useLayout = () => {
  const context = React.useContext(LayoutContext)
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider')
  }
  return context
}

// Layout provider component
export const LayoutProvider = ({ children, ...props }) => {
  const [layout, setLayout] = useState(props.defaultLayout || {})

  const toggleSidebar = useCallback(() => {
    setLayout(prev => ({ ...prev, sidebarVisible: !prev.sidebarVisible }))
  }, [])

  const toggleBottomPanel = useCallback(() => {
    setLayout(prev => ({ ...prev, bottomPanelVisible: !prev.bottomPanelVisible }))
  }, [])

  const updateLayout = useCallback((updates) => {
    setLayout(prev => ({ ...prev, ...updates }))
  }, [])

  const value = {
    layout,
    toggleSidebar,
    toggleBottomPanel,
    updateLayout
  }

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  )
}

export default Layout
