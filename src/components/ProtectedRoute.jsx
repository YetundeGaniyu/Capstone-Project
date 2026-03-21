import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children, requireRole }) {
  const { currentUser, userRole, isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    )
  }

  // Check admin session for admin routes
  if (requireRole === 'admin') {
    const token = localStorage.getItem('authToken')
    const isAdmin = localStorage.getItem('isAdmin') === 'true'
    
    if (!token || !isAdmin) {
      return <Navigate to="/admin/access" replace />
    }
    return children
  }

  if (!isAuthenticated) {
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
