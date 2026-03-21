import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(false)
  const [savedAccounts, _setSavedAccounts] = useState([])

  // Load saved accounts from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('savedGoogleAccounts')
    if (saved) {
      try {
        const parsedSaved = JSON.parse(saved)
        setTimeout(() => _setSavedAccounts(parsedSaved), 0)
      } catch (error) {
        console.error('Error loading saved accounts:', error)
      }
    }
  }, [])


  // Sign in with Google and set role
  async function signInWithGoogle(role = null) {
    try {
      console.log('Starting Google sign-in with role:', role)
      
      // Redirect to Google OAuth endpoint for browser authentication
      window.location.href = 'https://askyello-backend.onrender.com/api/v1/auth/google'
      
      // Store authentication token
      localStorage.setItem('authToken', 'mock-google-token')
      
      // Set user context
      setCurrentUser({
        uid: 'mock-user-id',
        email: 'user@example.com',
        displayName: 'Google User',
        photoURL: 'https://lh3.googleusercontent.com/a/default-user'
      })
      
      // Set role if provided
      if (role) {
        setUserRole(role)
      }
      
      return { success: true, userId: 'mock-user-id' }
    } catch (error) {
      console.error('Google sign-in error:', error)
      
      // Provide more specific error messages
      let errorMessage = 'Failed to sign in. Please try again.'
      
      if (error.message) {
        if (error.message.includes('Authentication service is not configured')) {
          errorMessage = 'Authentication service is not configured. Please check your environment variables.'
        } else if (error.message.includes('Failed to authenticate')) {
          errorMessage = 'Google authentication failed. Please try again.'
        }
      }
      
      throw new Error(errorMessage)
    }
  }

  async function setRole(role) {
    // Mock function for now - would call API in full implementation
    console.log('Setting role:', role)
    setUserRole(role)
  }

  async function logout() {
    try {
      // Mock logout - just clear user state
      setCurrentUser(null)
      setUserRole(null)
      localStorage.removeItem('authToken')
      console.log('User logged out successfully')
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const value = {
    currentUser,
    userRole,
    savedAccounts,
    signInWithGoogle,
    setRole,
    logout,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
