import React, { useState } from 'react'
import { useUser } from '../../contexts/UserContext'
import './Login.css'

const Login = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { login, register } = useUser()

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let result
      if (isLogin) {
        result = await login(formData.email, formData.password)
      } else {
        result = await register(formData.name, formData.email, formData.password)
      }

      if (!result.success) {
        setError(result.error || 'An error occurred')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setError('')
    setFormData({
      email: '',
      password: '',
      name: ''
    })
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>AI-Powered IDE</h1>
          <p>Welcome to your web-based development environment</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <h2>{isLogin ? 'Sign In' : 'Create Account'}</h2>
          
          {error && <div className="error-message">{error}</div>}

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required={!isLogin}
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Enter your password"
              minLength="6"
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>

          <div className="login-toggle">
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button" 
                className="toggle-button"
                onClick={toggleMode}
              >
                {isLogin ? 'Create Account' : 'Sign In'}
              </button>
            </p>
          </div>
        </form>

        <div className="login-features">
          <h3>Features</h3>
          <ul>
            <li>✨ AI-powered code completion</li>
            <li>🚀 Multi-language support</li>
            <li>💾 Persistent workspace</li>
            <li>⚡ Real-time code execution</li>
            <li>🌐 Collaborate in real-time</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Login
