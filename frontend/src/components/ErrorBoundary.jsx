import React from 'react'

/**
 * ErrorBoundary Component
 * Catches and displays React errors in development
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Update state with error details
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div style={{
          padding: '20px',
          margin: '20px',
          border: '2px solid #ff6b6b',
          borderRadius: '8px',
          backgroundColor: '#fff5f5',
          color: '#d63031',
          fontFamily: 'monospace'
        }}>
          <h2>🚨 Something went wrong!</h2>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
            <summary>Error Details (click to expand)</summary>
            
            {this.state.error && (
              <div style={{
                backgroundColor: '#333',
                color: '#fff',
                padding: '15px',
                borderRadius: '4px',
                marginTop: '10px'
              }}>
                <h3>Error Message:</h3>
                <pre>{this.state.error.toString()}</pre>
              </div>
            )}
            
            {this.state.errorInfo && this.state.errorInfo.componentStack && (
              <div style={{
                backgroundColor: '#333',
                color: '#fff',
                padding: '15px',
                borderRadius: '4px',
                marginTop: '10px'
              }}>
                <h3>Component Stack:</h3>
                <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}
          </details>
          
          <button 
            onClick={() => {
              this.setState({ hasError: false, error: null, errorInfo: null })
              window.location.reload()
            }}
            style={{
              marginTop: '15px',
              padding: '10px 20px',
              backgroundColor: '#0984e3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      )
    }

    // Normally, just render children
    return this.props.children
  }
}

export default ErrorBoundary
