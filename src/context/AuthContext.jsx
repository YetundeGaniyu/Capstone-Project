import { createContext, useContext, useState, useEffect } from 'react'
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '../services/firebase'

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
  const [savedAccounts, setSavedAccounts] = useState([])

  // Load saved accounts from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('savedGoogleAccounts')
    if (saved) {
      try {
        const parsedSaved = JSON.parse(saved)
        setSavedAccounts(parsedSaved)
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

    setSavedAccounts(prevAccounts => {
      const existingIndex = prevAccounts.findIndex(acc => acc.uid === user.uid)
      let updatedAccounts

      if (existingIndex >= 0) {
        updatedAccounts = [...prevAccounts]
        updatedAccounts[existingIndex] = accountData
      } else {
        updatedAccounts = [...prevAccounts, accountData]
      }

      localStorage.setItem('savedGoogleAccounts', JSON.stringify(updatedAccounts))
      return updatedAccounts
    })
  }

  // Sign in with Google and set role
  async function signInWithGoogle(role = null) {
    try {
      console.log('Starting Google sign-in with role:', role)
      
      // Check if Firebase is properly initialized
      if (!auth || !googleProvider) {
        throw new Error('Firebase not properly initialized')
      }
      
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      
      console.log('Google sign-in successful, user:', user.email)

      // Save Google account for subsequent logins
      saveGoogleAccount(user)

      // Check if user document exists
      const userDocRef = doc(db, 'users', user.uid)
      const userDoc = await getDoc(userDocRef)

      if (!userDoc.exists()) {
        // Create user document with role if provided
        const userData = {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date().toISOString()
        }
        
        if (role) {
          userData.role = role
          setUserRole(role)
          
          // Generate unique vendor ID for vendors
          if (role === 'vendor') {
            userData.vendorId = `VND_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
          }
        }
        
        await setDoc(userDocRef, userData)
        console.log('Created new user document with role:', role)
      } else {
        // User exists, check if they have a role
        const data = userDoc.data()
        if (data.role) {
          setUserRole(data.role)
          console.log('Existing user role:', data.role)
        } else if (role) {
          // Update existing user with role if provided
          const updateData = { role }
          
          // Generate unique vendor ID for vendors if not already present
          if (role === 'vendor' && !data.vendorId) {
            updateData.vendorId = `VND_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
          }
          
          await setDoc(userDocRef, updateData, { merge: true })
          setUserRole(role)
          console.log('Updated existing user with role:', role)
        }
      }

      return user
    } catch (error) {
      console.error('Error signing in with Google:', error)
      
      // Provide more specific error messages
      let errorMessage = 'Failed to sign in. Please try again.'
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in popup was closed. Please try again.'
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Pop-up was blocked by your browser. Please allow pop-ups and try again.'
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized for Google sign-in. Please check your Firebase configuration.'
      } else if (error.code === 'auth/api-key-not-allowed') {
        errorMessage = 'API key is not allowed. Please check your Firebase configuration.'
      } else if (error.message.includes('Firebase not properly initialized')) {
        errorMessage = 'Firebase is not properly configured. Please check your environment variables.'
      }
      
      throw new Error(errorMessage)
    }
  }

  // Set user role
  async function setRole(role) {
    if (!currentUser) return

    try {
      const userDocRef = doc(db, 'users', currentUser.uid)
      await setDoc(
        userDocRef,
        { role },
        { merge: true }
      )
      setUserRole(role)
    } catch (error) {
      console.error('Error setting user role:', error)
      throw error
    }
  }

  // Sign out
  async function logout() {
    try {
      await signOut(auth)
      setUserRole(null)
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)

      if (user) {
        // Fetch user role from Firestore
        try {
          const userDocRef = doc(db, 'users', user.uid)
          const userDoc = await getDoc(userDocRef)
          if (userDoc.exists()) {
            const data = userDoc.data()
            setUserRole(data.role || null)
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
