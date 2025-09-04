// Enhanced Routes for Files API
const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs').promises
const { body, validationResult } = require('express-validator')

const router = express.Router()

// Basic status and files endpoint
router.get('/', async (req, res) => {
  try {
    const projectId = 'default'
    const projectPath = path.join(__dirname, '../../storage/projects', projectId)
    
    // Ensure project directory exists
    await fs.mkdir(projectPath, { recursive: true })
    
    const buildFileTree = async (dirPath, relativePath = '') => {
      const items = await fs.readdir(dirPath, { withFileTypes: true })
      const tree = []
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item.name)
        const relativeItemPath = path.join(relativePath, item.name).replace(/\\/g, '/')
        
        if (item.isDirectory()) {
          tree.push({
            name: item.name,
            path: `/${relativeItemPath}`,
            type: 'directory',
            children: await buildFileTree(itemPath, relativeItemPath)
          })
        } else {
          const stats = await fs.stat(itemPath)
          tree.push({
            name: item.name,
            path: `/${relativeItemPath}`,
            type: 'file',
            size: stats.size,
            lastModified: stats.mtime.toISOString(),
            language: getLanguageFromExtension(path.extname(item.name))
          })
        }
      }
      
      return tree
    }
    
    const files = await buildFileTree(projectPath)
    
    res.json({
      success: true,
      message: 'Files Enhanced API v2 is working',
      timestamp: new Date().toISOString(),
      features: ['file management', 'real-time collaboration', 'upload/download', 'search'],
      files: files,
      projectId: projectId,
      workspace: projectPath
    })
  } catch (error) {
    console.error('[Files API] Error getting files:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve files',
      details: error.message
    })
  }
})

// Helper function to get language from file extension
function getLanguageFromExtension(ext) {
  const languageMap = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.css': 'css',
    '.html': 'html',
    '.json': 'json',
    '.md': 'markdown',
    '.py': 'python',
    '.java': 'java',
    '.cpp': 'cpp',
    '.c': 'c',
    '.txt': 'plaintext'
  }
  return languageMap[ext] || 'plaintext'
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const projectPath = path.join(__dirname, '../../storage/projects', req.params.projectId || 'default')
    cb(null, projectPath)
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Add file type validation if needed
    cb(null, true)
  }
})

// Get project files tree
router.get('/tree/:projectId?', async (req, res) => {
  try {
    const projectId = req.params.projectId || 'default'
    const projectPath = path.join(__dirname, '../../storage/projects', projectId)
    
    // Ensure project directory exists
    await fs.mkdir(projectPath, { recursive: true })
    
    const buildFileTree = async (dirPath, relativePath = '') => {
      const items = await fs.readdir(dirPath, { withFileTypes: true })
      const tree = []
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item.name)
        const relativeItemPath = path.join(relativePath, item.name)
        
        if (item.isDirectory()) {
          const children = await buildFileTree(itemPath, relativeItemPath)
          tree.push({
            id: relativeItemPath.replace(/\\\\/g, '/'),
            name: item.name,
            type: 'directory',
            children,
            path: relativeItemPath.replace(/\\\\/g, '/')
          })
        } else {
          const stats = await fs.stat(itemPath)
          tree.push({
            id: relativeItemPath.replace(/\\\\/g, '/'),
            name: item.name,
            type: 'file',
            size: stats.size,
            modified: stats.mtime,
            path: relativeItemPath.replace(/\\\\/g, '/')
          })
        }
      }
      
      return tree.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'directory' ? -1 : 1
        return a.name.localeCompare(b.name)
      })
    }
    
    const tree = await buildFileTree(projectPath)
    res.json({ success: true, tree, projectId })
    
  } catch (error) {
    console.error('Error getting file tree:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Read file content
router.get('/content/:projectId/*', async (req, res) => {
  try {
    const projectId = req.params.projectId
    const filePath = req.params[0] // Get the rest of the path
    const fullPath = path.join(__dirname, '../../storage/projects', projectId, filePath)
    
    // Security check - ensure path is within project directory
    const projectDir = path.join(__dirname, '../../storage/projects', projectId)
    if (!fullPath.startsWith(projectDir)) {
      return res.status(403).json({ success: false, error: 'Access denied' })
    }
    
    const content = await fs.readFile(fullPath, 'utf8')
    const stats = await fs.stat(fullPath)
    
    res.json({
      success: true,
      content,
      metadata: {
        size: stats.size,
        modified: stats.mtime,
        created: stats.birthtime,
        path: filePath
      }
    })
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ success: false, error: 'File not found' })
    } else {
      console.error('Error reading file:', error)
      res.status(500).json({ success: false, error: error.message })
    }
  }
})

// Save file content
router.post('/save/:projectId/*', [
  body('content').exists().withMessage('Content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }
    
    const projectId = req.params.projectId
    const filePath = req.params[0]
    const { content, createBackup = true } = req.body
    const fullPath = path.join(__dirname, '../../storage/projects', projectId, filePath)
    
    // Security check
    const projectDir = path.join(__dirname, '../../storage/projects', projectId)
    if (!fullPath.startsWith(projectDir)) {
      return res.status(403).json({ success: false, error: 'Access denied' })
    }
    
    // Create backup if requested
    if (createBackup) {
      try {
        const existingContent = await fs.readFile(fullPath, 'utf8')
        const backupPath = `${fullPath}.backup.${Date.now()}`
        await fs.writeFile(backupPath, existingContent)
      } catch (err) {
        // File might not exist yet, that's okay
      }
    }
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(fullPath), { recursive: true })
    
    // Save file
    await fs.writeFile(fullPath, content, 'utf8')
    const stats = await fs.stat(fullPath)
    
    // Emit socket event for real-time updates
    req.app.get('io')?.emit('file:updated', {
      projectId,
      filePath,
      timestamp: new Date(),
      size: stats.size
    })
    
    res.json({
      success: true,
      metadata: {
        size: stats.size,
        modified: stats.mtime,
        path: filePath
      }
    })
    
  } catch (error) {
    console.error('Error saving file:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Create new file or directory
router.post('/create/:projectId/*', [
  body('type').isIn(['file', 'directory']).withMessage('Type must be file or directory'),
  body('name').isLength({ min: 1 }).withMessage('Name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }
    
    const projectId = req.params.projectId
    const parentPath = req.params[0] || ''
    const { type, name, content = '' } = req.body
    
    const fullPath = path.join(__dirname, '../../storage/projects', projectId, parentPath, name)
    
    // Security check
    const projectDir = path.join(__dirname, '../../storage/projects', projectId)
    if (!fullPath.startsWith(projectDir)) {
      return res.status(403).json({ success: false, error: 'Access denied' })
    }
    
    // Check if already exists
    try {
      await fs.access(fullPath)
      return res.status(409).json({ success: false, error: 'File or directory already exists' })
    } catch (err) {
      // Good, doesn't exist
    }
    
    if (type === 'directory') {
      await fs.mkdir(fullPath, { recursive: true })
    } else {
      await fs.mkdir(path.dirname(fullPath), { recursive: true })
      await fs.writeFile(fullPath, content, 'utf8')
    }
    
    const stats = await fs.stat(fullPath)
    const relativePath = path.join(parentPath, name).replace(/\\\\/g, '/')
    
    // Emit socket event
    req.app.get('io')?.emit('file:created', {
      projectId,
      path: relativePath,
      type,
      timestamp: new Date()
    })
    
    res.json({
      success: true,
      item: {
        id: relativePath,
        name,
        type,
        path: relativePath,
        size: type === 'file' ? stats.size : undefined,
        modified: stats.mtime,
        created: stats.birthtime
      }
    })
    
  } catch (error) {
    console.error('Error creating item:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Delete file or directory
router.delete('/delete/:projectId/*', async (req, res) => {
  try {
    const projectId = req.params.projectId
    const itemPath = req.params[0]
    const fullPath = path.join(__dirname, '../../storage/projects', projectId, itemPath)
    
    // Security check
    const projectDir = path.join(__dirname, '../../storage/projects', projectId)
    if (!fullPath.startsWith(projectDir)) {
      return res.status(403).json({ success: false, error: 'Access denied' })
    }
    
    const stats = await fs.stat(fullPath)
    
    if (stats.isDirectory()) {
      await fs.rmdir(fullPath, { recursive: true })
    } else {
      await fs.unlink(fullPath)
    }
    
    // Emit socket event
    req.app.get('io')?.emit('file:deleted', {
      projectId,
      path: itemPath,
      type: stats.isDirectory() ? 'directory' : 'file',
      timestamp: new Date()
    })
    
    res.json({ success: true })
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ success: false, error: 'File or directory not found' })
    } else {
      console.error('Error deleting item:', error)
      res.status(500).json({ success: false, error: error.message })
    }
  }
})

// Rename/move file or directory
router.post('/move/:projectId/*', [
  body('newPath').isLength({ min: 1 }).withMessage('New path is required')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }
    
    const projectId = req.params.projectId
    const oldPath = req.params[0]
    const { newPath } = req.body
    
    const oldFullPath = path.join(__dirname, '../../storage/projects', projectId, oldPath)
    const newFullPath = path.join(__dirname, '../../storage/projects', projectId, newPath)
    
    // Security check
    const projectDir = path.join(__dirname, '../../storage/projects', projectId)
    if (!oldFullPath.startsWith(projectDir) || !newFullPath.startsWith(projectDir)) {
      return res.status(403).json({ success: false, error: 'Access denied' })
    }
    
    // Ensure destination directory exists
    await fs.mkdir(path.dirname(newFullPath), { recursive: true })
    
    await fs.rename(oldFullPath, newFullPath)
    
    // Emit socket event
    req.app.get('io')?.emit('file:moved', {
      projectId,
      oldPath,
      newPath,
      timestamp: new Date()
    })
    
    res.json({ success: true })
    
  } catch (error) {
    console.error('Error moving item:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Upload files
router.post('/upload/:projectId/:path?', upload.array('files'), async (req, res) => {
  try {
    const projectId = req.params.projectId
    const uploadPath = req.params.path || ''
    
    const uploadedFiles = req.files.map(file => ({
      name: file.filename,
      size: file.size,
      path: path.join(uploadPath, file.filename).replace(/\\\\/g, '/'),
      type: 'file'
    }))
    
    // Emit socket event
    req.app.get('io')?.emit('files:uploaded', {
      projectId,
      files: uploadedFiles,
      timestamp: new Date()
    })
    
    res.json({ success: true, files: uploadedFiles })
    
  } catch (error) {
    console.error('Error uploading files:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Search files
router.get('/search/:projectId', async (req, res) => {
  try {
    const projectId = req.params.projectId
    const { query, type = 'all' } = req.query
    
    if (!query) {
      return res.status(400).json({ success: false, error: 'Query parameter is required' })
    }
    
    const projectPath = path.join(__dirname, '../../storage/projects', projectId)
    const results = []
    
    const searchDirectory = async (dirPath, relativePath = '') => {
      try {
        const items = await fs.readdir(dirPath, { withFileTypes: true })
        
        for (const item of items) {
          const itemPath = path.join(dirPath, item.name)
          const relativeItemPath = path.join(relativePath, item.name).replace(/\\\\/g, '/')
          
          // Check if name matches
          if (item.name.toLowerCase().includes(query.toLowerCase())) {
            const stats = await fs.stat(itemPath)
            results.push({
              name: item.name,
              path: relativeItemPath,
              type: item.isDirectory() ? 'directory' : 'file',
              size: item.isFile() ? stats.size : undefined,
              modified: stats.mtime
            })
          }
          
          // Search content for files (if type allows)
          if (item.isFile() && (type === 'all' || type === 'content')) {
            try {
              const content = await fs.readFile(itemPath, 'utf8')
              if (content.toLowerCase().includes(query.toLowerCase())) {
                const lines = content.split('\\n')
                const matchingLines = []
                
                lines.forEach((line, index) => {
                  if (line.toLowerCase().includes(query.toLowerCase())) {
                    matchingLines.push({ line: index + 1, text: line.trim() })
                  }
                })
                
                if (matchingLines.length > 0) {
                  results.push({
                    name: item.name,
                    path: relativeItemPath,
                    type: 'file',
                    size: (await fs.stat(itemPath)).size,
                    modified: (await fs.stat(itemPath)).mtime,
                    matches: matchingLines
                  })
                }
              }
            } catch (err) {
              // Skip binary files or files that can't be read
            }
          }
          
          // Recurse into directories
          if (item.isDirectory()) {
            await searchDirectory(itemPath, relativeItemPath)
          }
        }
      } catch (err) {
        // Skip directories we can't read
      }
    }
    
    await searchDirectory(projectPath)
    
    res.json({ success: true, results, query })
    
  } catch (error) {
    console.error('Error searching files:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get file history/versions
router.get('/history/:projectId/*', async (req, res) => {
  try {
    const projectId = req.params.projectId
    const filePath = req.params[0]
    const fullPath = path.join(__dirname, '../../storage/projects', projectId, filePath)
    
    // Find backup files
    const dir = path.dirname(fullPath)
    const fileName = path.basename(fullPath)
    const backupPattern = `${fileName}.backup.`
    
    try {
      const files = await fs.readdir(dir)
      const backups = []
      
      for (const file of files) {
        if (file.startsWith(backupPattern)) {
          const backupPath = path.join(dir, file)
          const stats = await fs.stat(backupPath)
          const timestamp = file.substring(backupPattern.length)
          
          backups.push({
            timestamp: new Date(parseInt(timestamp)),
            size: stats.size,
            path: file
          })
        }
      }
      
      backups.sort((a, b) => b.timestamp - a.timestamp)
      
      res.json({ success: true, history: backups })
      
    } catch (err) {
      res.json({ success: true, history: [] })
    }
    
  } catch (error) {
    console.error('Error getting file history:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

module.exports = router
