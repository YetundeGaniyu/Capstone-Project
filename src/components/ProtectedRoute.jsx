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
