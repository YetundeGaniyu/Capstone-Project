import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children, requireRole }) {
  const { currentUser, userRole, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    )
  }

  // Check admin session for admin routes
  if (requireRole === 'admin') {
    const session = localStorage.getItem('adminSession')
    if (session) {
      try {
        const sessionData = JSON.parse(session)
        // eslint-disable-next-line
        const sessionAge = Date.now() - new Date(sessionData.timestamp).getTime()
        if (sessionAge < 24 * 60 * 60 * 1000 && sessionData.loggedIn) {
          return children
        }
      } catch (error) {
        console.error('Error parsing admin session:', error)
      }
    }
    return <Navigate to="/admin/access" replace />
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (!userRole) {
    return <Navigate to="/role-selection" replace />
  }

  if (requireRole && userRole !== requireRole) {
    return <Navigate to="/" replace />
  }

  return children
}
