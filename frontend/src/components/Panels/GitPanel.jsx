import React, { useState, useEffect, useCallback } from 'react'
import { 
  GitBranch, 
  GitCommit, 
  GitPullRequest, 
  GitMerge,
  Plus,
  Minus,
  RotateCcw,
  Upload,
  Download,
  RefreshCw,
  CheckCircle,
  Circle,
  AlertCircle
} from 'lucide-react'
import './GitPanel.css'

/**
 * GitPanel Component - VS Code-like Git integration
 * Provides version control functionality and repository management
 */
const GitPanel = ({ 
  repository,
  changes = [],
  branches = [],
  currentBranch = 'main',
  onCommit,
  onPush,
  onPull,
  onStage,
  onUnstage,
  onDiscard,
  onCreateBranch,
  onSwitchBranch,
  className = '' 
}) => {
  const [commitMessage, setCommitMessage] = useState('')
  const [showAllChanges, setShowAllChanges] = useState(true)
  const [isCommitting, setIsCommitting] = useState(false)
  const [newBranchName, setNewBranchName] = useState('')
  const [showBranchInput, setShowBranchInput] = useState(false)

  // Group changes by status
  const groupedChanges = changes.reduce((acc, change) => {
    const status = change.status || 'modified'
    if (!acc[status]) acc[status] = []
    acc[status].push(change)
    return acc
  }, {})

  const stagedChanges = groupedChanges.staged || []
  const unstagedChanges = [...(groupedChanges.modified || []), ...(groupedChanges.untracked || [])]

  const handleCommit = async () => {
    if (!commitMessage.trim() || stagedChanges.length === 0) return

    setIsCommitting(true)
    try {
      await onCommit?.(commitMessage, stagedChanges)
      setCommitMessage('')
    } catch (error) {
      console.error('Commit failed:', error)
    } finally {
      setIsCommitting(false)
    }
  }

  const handleStageAll = () => {
    unstagedChanges.forEach(change => onStage?.(change))
  }

  const handleUnstageAll = () => {
    stagedChanges.forEach(change => onUnstage?.(change))
  }

  const handleCreateBranch = () => {
    if (newBranchName.trim()) {
      onCreateBranch?.(newBranchName)
      setNewBranchName('')
      setShowBranchInput(false)
    }
  }

  const getChangeIcon = (change) => {
    switch (change.status) {
      case 'added':
      case 'untracked':
        return <Plus size={14} className="change-icon-added" />
      case 'deleted':
        return <Minus size={14} className="change-icon-deleted" />
      case 'modified':
        return <Circle size={14} className="change-icon-modified" />
      case 'staged':
        return <CheckCircle size={14} className="change-icon-staged" />
      case 'conflict':
        return <AlertCircle size={14} className="change-icon-conflict" />
      default:
        return <Circle size={14} className="change-icon-modified" />
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'added': '#28a745',
      'untracked': '#28a745', 
      'deleted': '#dc3545',
      'modified': '#ffc107',
      'staged': '#007acc',
      'conflict': '#dc3545'
    }
    return colors[status] || '#ffc107'
  }

  return (
    <div className={`git-panel ${className}`}>
      {/* Header */}
      <div className="git-panel-header">
        <h3>Source Control</h3>
        <div className="header-actions">
          <button title="Refresh" onClick={() => window.location.reload()}>
            <RefreshCw size={16} />
          </button>
          <button title="Pull" onClick={onPull}>
            <Download size={16} />
          </button>
          <button title="Push" onClick={onPush}>
            <Upload size={16} />
          </button>
        </div>
      </div>

      {/* Repository Info */}
      {repository && (
        <div className="repository-info">
          <div className="current-branch">
            <GitBranch size={14} />
            <span className="branch-name">{currentBranch}</span>
            <button 
              className="new-branch-button"
              onClick={() => setShowBranchInput(!showBranchInput)}
              title="Create new branch"
            >
              <Plus size={12} />
            </button>
          </div>
          
          {showBranchInput && (
            <div className="new-branch-input">
              <input
                type="text"
                placeholder="New branch name..."
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateBranch()}
                onBlur={handleCreateBranch}
                autoFocus
              />
            </div>
          )}
          
          <div className="repository-path">
            {repository.name || repository.path}
          </div>
        </div>
      )}

      {/* Commit Section */}
      {stagedChanges.length > 0 && (
        <div className="commit-section">
          <textarea
            placeholder="Commit message..."
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            className="commit-message-input"
            rows={3}
          />
          <div className="commit-actions">
            <button
              className="commit-button"
              onClick={handleCommit}
              disabled={!commitMessage.trim() || isCommitting}
            >
              {isCommitting ? (
                <>
                  <div className="loading-spinner"></div>
                  Committing...
                </>
              ) : (
                <>
                  <GitCommit size={14} />
                  Commit ({stagedChanges.length})
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Changes Section */}
      <div className="changes-section">
        {/* Staged Changes */}
        {stagedChanges.length > 0 && (
          <div className="change-group">
            <div className="change-group-header">
              <span className="group-title">
                Staged Changes ({stagedChanges.length})
              </span>
              <div className="group-actions">
                <button 
                  title="Unstage All"
                  onClick={handleUnstageAll}
                >
                  <Minus size={14} />
                </button>
              </div>
            </div>
            <div className="change-list">
              {stagedChanges.map((change, index) => (
                <div key={index} className="change-item staged">
                  <div className="change-info">
                    {getChangeIcon(change)}
                    <span className="change-path">{change.path}</span>
                  </div>
                  <div className="change-actions">
                    <button
                      title="Unstage"
                      onClick={() => onUnstage?.(change)}
                    >
                      <Minus size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unstaged Changes */}
        {unstagedChanges.length > 0 && (
          <div className="change-group">
            <div className="change-group-header">
              <span className="group-title">
                Changes ({unstagedChanges.length})
              </span>
              <div className="group-actions">
                <button 
                  title="Stage All"
                  onClick={handleStageAll}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <div className="change-list">
              {unstagedChanges.map((change, index) => (
                <div key={index} className="change-item unstaged">
                  <div className="change-info">
                    {getChangeIcon(change)}
                    <span className="change-path">{change.path}</span>
                    <span 
                      className="change-status"
                      style={{ color: getStatusColor(change.status) }}
                    >
                      {change.status?.toUpperCase() || 'M'}
                    </span>
                  </div>
                  <div className="change-actions">
                    <button
                      title="Stage"
                      onClick={() => onStage?.(change)}
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      title="Discard Changes"
                      onClick={() => onDiscard?.(change)}
                      className="discard-button"
                    >
                      <RotateCcw size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Changes */}
        {stagedChanges.length === 0 && unstagedChanges.length === 0 && (
          <div className="no-changes">
            <GitCommit size={32} className="no-changes-icon" />
            <p>No changes detected</p>
            <small>Your working directory is clean</small>
          </div>
        )}
      </div>

      {/* Branches Section */}
      {branches.length > 0 && (
        <div className="branches-section">
          <div className="section-header">
            <h4>Branches</h4>
          </div>
          <div className="branch-list">
            {branches.map((branch, index) => (
              <div 
                key={index} 
                className={`branch-item ${branch.name === currentBranch ? 'current' : ''}`}
                onClick={() => branch.name !== currentBranch && onSwitchBranch?.(branch)}
              >
                <GitBranch size={14} />
                <span className="branch-name">{branch.name}</span>
                {branch.name === currentBranch && (
                  <span className="current-indicator">current</span>
                )}
                {branch.ahead > 0 && (
                  <span className="ahead-indicator">+{branch.ahead}</span>
                )}
                {branch.behind > 0 && (
                  <span className="behind-indicator">-{branch.behind}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="action-button" onClick={onPull}>
          <Download size={14} />
          Pull
        </button>
        <button className="action-button" onClick={onPush}>
          <Upload size={14} />
          Push
        </button>
        <button className="action-button">
          <GitMerge size={14} />
          Merge
        </button>
        <button className="action-button">
          <GitPullRequest size={14} />
          PR
        </button>
      </div>
    </div>
  )
}

export default GitPanel
