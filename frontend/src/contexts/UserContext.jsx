import { createContext, useContext, useState, useEffect } from 'react'
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { auth } from '../config/firebase'

const UserContext = createContext()

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          photoURL: firebaseUser.photoURL
        })
      } else {
        // User is signed out
        setUser(null)
      }
      setLoading(false)
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  const register = async (name, email, password) => {
    try {
      setLoading(true)
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update user profile with display name
      await updateProfile(userCredential.user, {
        displayName: name
      })

      return { 
        success: true, 
        user: {
          id: userCredential.user.uid,
          email: userCredential.user.email,
          name: name
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { 
        success: false, 
        error: getFirebaseErrorMessage(error.code) 
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      setLoading(true)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      return { 
        success: true, 
        user: {
          id: userCredential.user.uid,
          email: userCredential.user.email,
          name: userCredential.user.displayName || userCredential.user.email.split('@')[0]
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: getFirebaseErrorMessage(error.code) 
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      return { success: false, error: 'Failed to logout' }
    }
  }

  const checkAuth = () => {
    // Firebase handles this automatically with onAuthStateChanged
    return user
  }

  // Convert Firebase error codes to user-friendly messages
  const getFirebaseErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address'
      case 'auth/wrong-password':
        return 'Incorrect password'
      case 'auth/email-already-in-use':
        return 'An account with this email already exists'
      case 'auth/weak-password':
        return 'Password should be at least 6 characters'
      case 'auth/invalid-email':
        return 'Invalid email address'
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later'
      default:
        return 'An error occurred. Please try again'
    }
  }

  return (
    <UserContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      checkAuth
    }}>
      {children}
    </UserContext.Provider>
  )
}
