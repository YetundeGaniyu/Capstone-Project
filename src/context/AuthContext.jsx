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

  // Sign in with Google
  async function signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      // Check if user document exists
      const userDocRef = doc(db, 'users', user.uid)
      const userDoc = await getDoc(userDocRef)

      if (!userDoc.exists()) {
        // Create user document without role initially
        await setDoc(userDocRef, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date().toISOString()
        })
      } else {
        // User exists, check if they have a role
        const data = userDoc.data()
        if (data.role) {
          setUserRole(data.role)
        }
      }

      return user
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw error
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
    signInWithGoogle,
    setRole,
    logout,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
