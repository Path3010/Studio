import React, { useState, useEffect, useCallback } from 'react'
import { Search, Replace, CaseSensitive, Regex, Book, X } from 'lucide-react'
import './SearchPanel.css'

/**
 * SearchPanel Component - VS Code-like search and replace
 * Provides file search, replace, and find-in-files functionality
 */
const SearchPanel = ({ 
  onSearch, 
  onReplace, 
  onFindInFiles,
  searchResults = [],
  currentFile,
  className = '' 
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [replaceTerm, setReplaceTerm] = useState('')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)
  const [useRegex, setUseRegex] = useState(false)
  const [includeFiles, setIncludeFiles] = useState('**/*')
  const [excludeFiles, setExcludeFiles] = useState('**/node_modules/**')
  const [showReplace, setShowReplace] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  // Perform search when parameters change
  useEffect(() => {
    if (searchTerm.trim()) {
      const timeoutId = setTimeout(() => {
        performSearch()
      }, 300) // Debounce search

      return () => clearTimeout(timeoutId)
    }
  }, [searchTerm, caseSensitive, wholeWord, useRegex, includeFiles, excludeFiles])

  const performSearch = useCallback(async () => {
    if (!searchTerm.trim()) return

    setIsSearching(true)
    try {
      await onFindInFiles?.({
        query: searchTerm,
        caseSensitive,
        wholeWord,
        useRegex,
        includeFiles,
        excludeFiles
      })
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }, [searchTerm, caseSensitive, wholeWord, useRegex, includeFiles, excludeFiles, onFindInFiles])

  const handleSearchChange = (value) => {
    setSearchTerm(value)
  }

  const handleReplaceAll = () => {
    if (searchTerm && replaceTerm) {
      onReplace?.({
        searchTerm,
        replaceTerm,
        caseSensitive,
        wholeWord,
        useRegex,
        replaceAll: true
      })
    }
  }

  const handleReplaceInFile = (file) => {
    if (searchTerm && replaceTerm) {
      onReplace?.({
        searchTerm,
        replaceTerm,
        caseSensitive,
        wholeWord,
        useRegex,
        file: file.path
      })
    }
  }

  const handleResultClick = (result) => {
    onSearch?.(result)
  }

  const clearSearch = () => {
    setSearchTerm('')
    setReplaceTerm('')
  }

  return (
    <div className={`search-panel ${className}`}>
      {/* Header */}
      <div className="search-panel-header">
        <h3>Search</h3>
        <button 
          className="toggle-replace-button"
          onClick={() => setShowReplace(!showReplace)}
          title="Toggle Replace"
        >
          <Replace size={16} />
        </button>
      </div>

      {/* Search Input */}
      <div className="search-input-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              className="clear-search-button"
              onClick={clearSearch}
              title="Clear"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Search Options */}
        <div className="search-options">
          <button
            className={`search-option ${caseSensitive ? 'active' : ''}`}
            onClick={() => setCaseSensitive(!caseSensitive)}
            title="Match Case"
          >
            <CaseSensitive size={16} />
          </button>
          <button
            className={`search-option ${wholeWord ? 'active' : ''}`}
            onClick={() => setWholeWord(!wholeWord)}
            title="Match Whole Word"
          >
            <Book size={16} />
          </button>
          <button
            className={`search-option ${useRegex ? 'active' : ''}`}
            onClick={() => setUseRegex(!useRegex)}
            title="Use Regular Expression"
          >
            <Regex size={16} />
          </button>
        </div>
      </div>

      {/* Replace Input */}
      {showReplace && (
        <div className="replace-input-container">
          <div className="replace-input-wrapper">
            <input
              type="text"
              placeholder="Replace"
              value={replaceTerm}
              onChange={(e) => setReplaceTerm(e.target.value)}
              className="replace-input"
            />
          </div>
          <div className="replace-actions">
            <button
              onClick={handleReplaceAll}
              disabled={!searchTerm || !replaceTerm}
              className="replace-all-button"
              title="Replace All"
            >
              Replace All
            </button>
          </div>
        </div>
      )}

      {/* File Filters */}
      <div className="file-filters">
        <div className="filter-group">
          <label>Files to include:</label>
          <input
            type="text"
            value={includeFiles}
            onChange={(e) => setIncludeFiles(e.target.value)}
            className="filter-input"
            placeholder="**/*"
          />
        </div>
        <div className="filter-group">
          <label>Files to exclude:</label>
          <input
            type="text"
            value={excludeFiles}
            onChange={(e) => setExcludeFiles(e.target.value)}
            className="filter-input"
            placeholder="**/node_modules/**"
          />
        </div>
      </div>

      {/* Search Results */}
      <div className="search-results">
        {isSearching && (
          <div className="search-loading">
            <div className="loading-spinner"></div>
            <span>Searching...</span>
          </div>
        )}

        {!isSearching && searchResults.length === 0 && searchTerm && (
          <div className="no-results">
            No results found for "{searchTerm}"
          </div>
        )}

        {!isSearching && searchResults.length > 0 && (
          <>
            <div className="results-summary">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} in {
                new Set(searchResults.map(r => r.file)).size
              } file{new Set(searchResults.map(r => r.file)).size !== 1 ? 's' : ''}
            </div>

            <div className="results-list">
              {searchResults.reduce((acc, result) => {
                const existingFile = acc.find(item => item.file === result.file)
                if (existingFile) {
                  existingFile.matches.push(result)
                } else {
                  acc.push({
                    file: result.file,
                    matches: [result]
                  })
                }
                return acc
              }, []).map(fileGroup => (
                <div key={fileGroup.file} className="file-group">
                  <div className="file-header">
                    <span className="file-name">{fileGroup.file}</span>
                    <span className="match-count">{fileGroup.matches.length}</span>
                    {showReplace && (
                      <button
                        className="replace-in-file-button"
                        onClick={() => handleReplaceInFile(fileGroup)}
                        title="Replace in this file"
                      >
                        <Replace size={12} />
                      </button>
                    )}
                  </div>
                  <div className="matches-list">
                    {fileGroup.matches.map((match, index) => (
                      <div
                        key={index}
                        className="match-item"
                        onClick={() => handleResultClick(match)}
                      >
                        <span className="line-number">{match.line}</span>
                        <span className="match-text">
                          {match.text.substring(0, match.column - 1)}
                          <mark className="highlight">
                            {match.match}
                          </mark>
                          {match.text.substring(match.column - 1 + match.match.length)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SearchPanel
