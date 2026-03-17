import { createContext, useContext, useState, useEffect } from 'react'
import { doc, getDoc, setDoc, collection, query, where } from 'firebase/firestore'
import { signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../services/firebase'
import { authAPI } from '../services/apiService'

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
  const [loading, setLoading] = useState(true)
  const [savedAccounts, _setSavedAccounts] = useState([])

  // Load saved accounts from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('savedGoogleAccounts')
    if (saved) {
      try {
        const parsedSaved = JSON.parse(saved)
        _setSavedAccounts(parsedSaved)
      } catch (error) {
        console.error('Error loading saved accounts:', error)
      }
    }
  }, [])

  // Save Google account to localStorage
  const saveGoogleAccount = (user) => {
    const accountData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      lastLogin: new Date().toISOString()
    }

    _setSavedAccounts(prevAccounts => {
      const existingIndex = prevAccounts.findIndex(acc => acc.uid === user.uid)
      const updatedAccounts = existingIndex >= 0
        ? [...prevAccounts].map((acc, index) => index === existingIndex ? accountData : acc)
        : [...prevAccounts, accountData]
      
      localStorage.setItem('savedGoogleAccounts', JSON.stringify(updatedAccounts))
      return updatedAccounts
    })
  }

  // Sign in with Google and set role
  async function signInWithGoogle(role = null) {
    try {
      console.log('Starting Google sign-in with role:', role)
      
      // Redirect to Google OAuth endpoint for browser authentication
      window.location.href = 'https://askyello-backend.onrender.com/auth/google'
      
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
    if (!currentUser) return

    try {
      const userDocRef = doc(db, 'users', currentUser.uid)
      await setDoc(userDocRef, { role }, { merge: true })
      setUserRole(role)
    } catch (error) {
      console.error('Error setting user role:', error)
      throw error
    }
  }

  async function logout() {
    try {
      await signOut(auth)
      setUserRole(null)
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)

      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid)
          const userDoc = await getDoc(userDocRef)
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role || null)
          }
        } catch (error) {
          console.error('Error fetching user role:', error)
        }
      } else {
        setUserRole(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

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
