import React, { useState, useEffect, useCallback, useRef } from 'react'
import { 
  ChevronRight, 
  ChevronDown, 
  File, 
  Folder, 
  FolderOpen,
  Plus,
  Search,
  MoreHorizontal,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Edit2,
  Copy,
  FileText,
  Image,
  Code,
  Settings
} from 'lucide-react'
import './FileExplorer.css'

/**
 * FileExplorer Component - VS Code-like file tree
 * Manages file and folder navigation with context menus and backend integration
 */
const FileExplorer = ({ 
  fileTree = [], 
  onFileSelect, 
  onFileCreate, 
  onFileDelete, 
  onFileRename,
  onFolderCreate,
  onFolderExpand,
  currentFile,
  className = '' 
}) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set())
  const [selectedNode, setSelectedNode] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredTree, setFilteredTree] = useState(fileTree)
  const [contextMenu, setContextMenu] = useState(null)
  const [renamingNode, setRenamingNode] = useState(null)
  const [newNodeParent, setNewNodeParent] = useState(null)
  const [newNodeType, setNewNodeType] = useState(null)
  
  const contextMenuRef = useRef(null)
  const renameInputRef = useRef(null)
  
  // Base URL for API calls
  const baseURL = 'http://localhost:3001/api/v2'

  // Backend integration functions
  const createFileInBackend = async (parentPath, fileName, type = 'file') => {
    try {
      const fullPath = parentPath ? `${parentPath}/${fileName}` : `/${fileName}`
      const response = await fetch(`${baseURL}/files/create/default${fullPath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: type === 'file' ? '' : undefined,
          type: type
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log(`${type} created successfully:`, data)
        // Call parent handlers to update the tree
        if (type === 'file') {
          onFileCreate?.(parentPath, fileName)
        } else {
          onFolderCreate?.(parentPath, fileName)
        }
        return true
      } else {
        console.error(`Failed to create ${type}:`, response.statusText)
        return false
      }
    } catch (error) {
      console.error(`Error creating ${type}:`, error)
      return false
    }
  }

  const deleteFileInBackend = async (filePath) => {
    try {
      const response = await fetch(`${baseURL}/files/delete/default${filePath}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        console.log('File deleted successfully')
        onFileDelete?.(filePath)
        return true
      } else {
        console.error('Failed to delete file:', response.statusText)
        return false
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      return false
    }
  }

  const renameFileInBackend = async (oldPath, newName) => {
    try {
      const pathParts = oldPath.split('/')
      pathParts.pop() // Remove old filename
      const newPath = [...pathParts, newName].join('/')
      
      const response = await fetch(`${baseURL}/files/move/default${oldPath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPath: newPath
        })
      })
      
      if (response.ok) {
        console.log('File renamed successfully')
        onFileRename?.(oldPath, newPath)
        return true
      } else {
        console.error('Failed to rename file:', response.statusText)
        return false
      }
    } catch (error) {
      console.error('Error renaming file:', error)
      return false
    }
  }

  // Update filtered tree when search term or file tree changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTree(fileTree)
    } else {
      const filtered = filterTreeBySearch(fileTree, searchTerm.toLowerCase())
      setFilteredTree(filtered)
      // Auto-expand search results
      expandSearchResults(filtered)
    }
  }, [searchTerm, fileTree])

  // Auto-select current file
  useEffect(() => {
    if (currentFile) {
      setSelectedNode(currentFile)
    }
  }, [currentFile])

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setContextMenu(null)
      }
    }

    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [contextMenu])

  // Focus rename input when renaming starts
  useEffect(() => {
    if (renamingNode && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [renamingNode])

  // Filter file tree by search term
  const filterTreeBySearch = (tree, term) => {
    return tree.reduce((acc, node) => {
      const matchesName = node.name.toLowerCase().includes(term)
      const matchesPath = node.path?.toLowerCase().includes(term)
      
      if (node.type === 'folder' && node.children) {
        const filteredChildren = filterTreeBySearch(node.children, term)
        if (filteredChildren.length > 0 || matchesName || matchesPath) {
          acc.push({
            ...node,
            children: filteredChildren
          })
        }
      } else if (matchesName || matchesPath) {
        acc.push(node)
      }
      
      return acc
    }, [])
  }

  // Auto-expand nodes that contain search results
  const expandSearchResults = (tree) => {
    const newExpanded = new Set(expandedNodes)
    
    const expandParents = (nodes) => {
      nodes.forEach(node => {
        if (node.type === 'folder') {
          newExpanded.add(node.id)
          if (node.children) {
            expandParents(node.children)
          }
        }
      })
    }
    
    expandParents(tree)
    setExpandedNodes(newExpanded)
  }

  // Get file icon based on extension
  const getFileIcon = (fileName, isFolder = false, isOpen = false) => {
    if (isFolder) {
      return isOpen ? <FolderOpen size={16} /> : <Folder size={16} />
    }
    
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    const iconMap = {
      'js': <Code size={16} className="file-icon-js" />,
      'jsx': <Code size={16} className="file-icon-react" />,
      'ts': <Code size={16} className="file-icon-ts" />,
      'tsx': <Code size={16} className="file-icon-react" />,
      'html': <Code size={16} className="file-icon-html" />,
      'css': <Code size={16} className="file-icon-css" />,
      'scss': <Code size={16} className="file-icon-scss" />,
      'json': <Settings size={16} className="file-icon-json" />,
      'md': <FileText size={16} className="file-icon-md" />,
      'png': <Image size={16} className="file-icon-image" />,
      'jpg': <Image size={16} className="file-icon-image" />,
      'jpeg': <Image size={16} className="file-icon-image" />,
      'gif': <Image size={16} className="file-icon-image" />,
      'svg': <Image size={16} className="file-icon-image" />
    }
    
    return iconMap[extension] || <File size={16} />
  }

  // Handle node expansion/collapse
  const handleNodeToggle = useCallback((nodeId, node) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId)
      } else {
        newSet.add(nodeId)
        // Notify parent of folder expansion
        onFolderExpand?.(node)
      }
      return newSet
    })
  }, [onFolderExpand])

  // Handle file/folder selection
  const handleNodeSelect = useCallback((node, event) => {
    event.stopPropagation()
    
    if (node.type === 'file') {
      setSelectedNode(node.id)
      onFileSelect?.(node)
    } else {
      handleNodeToggle(node.id, node)
    }
  }, [handleNodeToggle, onFileSelect])

  // Handle context menu
  const handleContextMenu = useCallback((event, node) => {
    event.preventDefault()
    event.stopPropagation()
    
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      node
    })
  }, [])

  // Handle rename
  const handleRename = useCallback(async (node, newName) => {
    if (newName && newName !== node.name) {
      const success = await renameFileInBackend(node.path, newName)
      if (!success) {
        alert('Failed to rename file. Please try again.')
      }
    }
    setRenamingNode(null)
  }, [])

  // Handle new file/folder creation
  const handleNewItem = useCallback(async (parentNode, type, name) => {
    if (name) {
      const parentPath = parentNode ? parentNode.path : ''
      const success = await createFileInBackend(parentPath, name, type)
      if (!success) {
        alert(`Failed to create ${type}. Please try again.`)
      }
    }
    setNewNodeParent(null)
    setNewNodeType(null)
  }, [])

  // Context menu actions
  const contextMenuActions = [
    {
      label: 'New File',
      icon: <Plus size={14} />,
      action: (node) => {
        setNewNodeParent(node.type === 'folder' ? node : null)
        setNewNodeType('file')
        setContextMenu(null)
      }
    },
    {
      label: 'New Folder',
      icon: <Folder size={14} />,
      action: (node) => {
        setNewNodeParent(node.type === 'folder' ? node : null)
        setNewNodeType('folder')
        setContextMenu(null)
      }
    },
    { separator: true },
    {
      label: 'Rename',
      icon: <Edit2 size={14} />,
      action: (node) => {
        setRenamingNode(node.id)
        setContextMenu(null)
      }
    },
    {
      label: 'Copy',
      icon: <Copy size={14} />,
      action: (node) => {
        // Copy to clipboard or internal state
        console.log('Copy:', node)
        setContextMenu(null)
      }
    },
    {
      label: 'Delete',
      icon: <Trash2 size={14} />,
      action: async (node) => {
        if (confirm(`Are you sure you want to delete ${node.name}?`)) {
          const success = await deleteFileInBackend(node.path)
          if (!success) {
            alert('Failed to delete file. Please try again.')
          }
        }
        setContextMenu(null)
      },
      className: 'context-menu-danger'
    }
  ]

  // Render tree node
  const renderNode = (node, level = 0) => {
    const isExpanded = expandedNodes.has(node.id)
    const isSelected = selectedNode === node.id
    const isRenaming = renamingNode === node.id
    const hasChildren = node.children && node.children.length > 0
    
    return (
      <div key={node.id} className="file-tree-node">
        <div 
          className={`file-tree-item ${isSelected ? 'selected' : ''} ${node.type}`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={(e) => handleNodeSelect(node, e)}
          onContextMenu={(e) => handleContextMenu(e, node)}
          title={node.path}
        >
          {/* Expansion arrow for folders */}
          {node.type === 'folder' && (
            <button 
              className={`expand-button ${hasChildren ? '' : 'empty'}`}
              onClick={(e) => {
                e.stopPropagation()
                handleNodeToggle(node.id, node)
              }}
            >
              {hasChildren && (isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
            </button>
          )}
          
          {/* File/folder icon */}
          <span className="file-icon">
            {getFileIcon(node.name, node.type === 'folder', isExpanded)}
          </span>
          
          {/* File/folder name */}
          {isRenaming ? (
            <input
              ref={renameInputRef}
              type="text"
              defaultValue={node.name}
              className="rename-input"
              onBlur={(e) => handleRename(node, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRename(node, e.target.value)
                } else if (e.key === 'Escape') {
                  setRenamingNode(null)
                }
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="file-name">{node.name}</span>
          )}
        </div>
        
        {/* Render children if expanded */}
        {node.type === 'folder' && isExpanded && node.children && (
          <div className="file-tree-children">
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
        
        {/* New item input */}
        {newNodeParent?.id === node.id && (
          <div 
            className="file-tree-item new-item"
            style={{ paddingLeft: `${(level + 1) * 20 + 8}px` }}
          >
            <span className="file-icon">
              {newNodeType === 'folder' ? <Folder size={16} /> : <File size={16} />}
            </span>
            <input
              type="text"
              placeholder={`New ${newNodeType}...`}
              className="new-item-input"
              autoFocus
              onBlur={(e) => handleNewItem(node, newNodeType, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleNewItem(node, newNodeType, e.target.value)
                } else if (e.key === 'Escape') {
                  setNewNodeParent(null)
                  setNewNodeType(null)
                }
              }}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`file-explorer ${className}`}>
      {/* Header */}
      <div className="file-explorer-header">
        <h3>Explorer</h3>
        <div className="header-actions">
          <button 
            title="New File"
            onClick={() => {
              setNewNodeParent(null)
              setNewNodeType('file')
            }}
          >
            <Plus size={16} />
          </button>
          <button 
            title="New Folder"
            onClick={() => {
              setNewNodeParent(null)
              setNewNodeType('folder')
            }}
          >
            <Folder size={16} />
          </button>
          <button title="Refresh">
            <RefreshCw size={16} />
          </button>
          <button title="More Actions">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="file-explorer-search">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="Search files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* File Tree */}
      <div className="file-tree">
        {filteredTree.length > 0 ? (
          filteredTree.map(node => renderNode(node))
        ) : (
          <div className="empty-state">
            {searchTerm ? 'No files match your search' : 'No files in workspace'}
          </div>
        )}
        
        {/* Root level new item */}
        {newNodeParent === null && newNodeType && (
          <div className="file-tree-item new-item" style={{ paddingLeft: '8px' }}>
            <span className="file-icon">
              {newNodeType === 'folder' ? <Folder size={16} /> : <File size={16} />}
            </span>
            <input
              type="text"
              placeholder={`New ${newNodeType}...`}
              className="new-item-input"
              autoFocus
              onBlur={(e) => handleNewItem(null, newNodeType, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleNewItem(null, newNodeType, e.target.value)
                } else if (e.key === 'Escape') {
                  setNewNodeType(null)
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div 
          ref={contextMenuRef}
          className="context-menu"
          style={{ 
            left: contextMenu.x, 
            top: contextMenu.y 
          }}
        >
          {contextMenuActions.map((action, index) => (
            action.separator ? (
              <div key={index} className="context-menu-separator" />
            ) : (
              <button
                key={index}
                className={`context-menu-item ${action.className || ''}`}
                onClick={() => action.action(contextMenu.node)}
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            )
          ))}
        </div>
      )}
    </div>
  )
}

export default FileExplorer
