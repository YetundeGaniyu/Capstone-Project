import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Admin credentials - in production, these should be stored securely
const ADMIN_CREDENTIALS = {
  username: 'admin@smeconnect.com',
  password: 'Admin@2024!Secure'
}

export function AdminLogin() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!credentials.username || !credentials.password) {
      setError('Please enter both username and password')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Simulate admin authentication
      if (credentials.username === ADMIN_CREDENTIALS.username && 
          credentials.password === ADMIN_CREDENTIALS.password) {
        
        // Store admin session in localStorage
        localStorage.setItem('adminSession', JSON.stringify({
          loggedIn: true,
          timestamp: new Date().toISOString()
        }))
        
        navigate('/admin/dashboard')
      } else {
        setError('Invalid admin credentials')
      }
    } catch (err) {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    })
  }

  return (
    <section className="page page-admin-login">
      <div className="page-width">
        <div className="card auth-card">
          <h1 className="page-title">Admin Login</h1>
          <p className="page-subtitle">
            Access the admin dashboard to monitor activities and manage vendors
          </p>

          {error && <div className="error-message">{error}</div>}

          <form className="form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Admin Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter admin username"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Admin Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter admin password"
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

          <div className="auth-footer">
            <p>Regular user?</p>
            <a href="/login" className="link">User Login</a>
          </div>
        </div>
      </div>
    </section>
  )
}
