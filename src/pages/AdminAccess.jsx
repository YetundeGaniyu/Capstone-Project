import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/apiService'

export function AdminAccess() {
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
    adminKey: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Check admin session
  const checkAdminSession = () => {
    const session = localStorage.getItem('adminSession')
    if (session) {
      try {
        const sessionData = JSON.parse(session)
        const sessionAge = Date.now() - new Date(sessionData.timestamp).getTime()
        // Session expires after 24 hours
        return sessionAge < 24 * 60 * 60 * 1000 && sessionData.loggedIn
      } catch (error) {
        console.error('Error parsing admin session:', error)
        return false
      }
    }
    return false
  }

  // Check if user is admin
  const isAdmin = checkAdminSession()

  const handleAdminLogin = async (e) => {
  e.preventDefault()
  setLoading(true)
  setError('')
  
  try {
    const response = await authAPI.login({
      email: formValues.email,
      password: formValues.password,
      adminKey: formValues.adminKey,
    })
    
    console.log('Admin login response:', response)
    
    if (response.success) {
      // Check role from response.data.role (not response.isAdmin)
      const userRole = response.data?.role
      const token = response.token || response.data?.token
      
      console.log('User role:', userRole)
      console.log('Token:', token ? 'exists' : 'missing')
      
      if (userRole === 'admin') {
        localStorage.setItem('authToken', token)
        localStorage.setItem('isAdmin', 'true')
        localStorage.setItem('adminData', JSON.stringify(response.data))
        navigate('/admin/dashboard')
      } else {
        setError('Access denied. You do not have admin privileges.')
      }
    } else {
      setError(response.message || 'Login failed')
    }
  } catch (error) {
    console.error('Admin login error:', error)
    setError(error.message || 'Login failed. Please try again.')
  } finally {
    setLoading(false)
  }
}

  const handleInputChange = (e) => {
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value
    })
  }

  return (
    <section className="page page-admin-access">
      <div className="page-width">
        <div className="admin-access-container">
          <div className="admin-access-header">
            <h1 className="page-title">Admin Access</h1>
            <p className="page-subtitle">
              Sign in to access the SMEs Connect admin dashboard
            </p>
          </div>

          <div className="admin-access-form">
            {error && <div className="error-message">{error}</div>}
            
            <form className="form" onSubmit={handleAdminLogin} autoComplete="off">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="off"
                  value={formValues.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter admin email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  autoComplete="new-password"
                  value={formValues.password}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter admin password"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="adminKey" className="form-label">
                  Admin Key
                </label>
                <input
                  type="text"
                  id="adminKey"
                  name="adminKey"
                  value={formValues.adminKey}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter admin key"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-block"
              >
                {loading ? 'Signing in...' : 'Admin Login'}
              </button>
            </form>
            
            <div className="admin-access-info">
              <small>
                Contact system administrator for credentials if you don't have access.
              </small>
            </div>

            <div className="admin-access-links">
              <a href="/" className="link">← Back to Home</a>
              <a href="/login" className="link">User Login</a>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
