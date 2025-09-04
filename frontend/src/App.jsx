import React from 'react'
import { UserProvider, useUser } from './contexts/UserContext'
import Workbench from './workbench/Workbench'
import Login from './components/Auth/Login'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'

function AppContent() {
  const { user, loading } = useUser()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  return user ? <Workbench /> : <Login />
}

function App() {
  return (
    <ErrorBoundary>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </ErrorBoundary>
  )
}

export default App
