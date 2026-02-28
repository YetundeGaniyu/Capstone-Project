import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function AdminGateway() {
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
      // Admin credentials
      const ADMIN_CREDENTIALS = {
        username: 'admin@smeconnect.com',
        password: 'Admin@2024!Secure'
      }
      
      if (credentials.username === ADMIN_CREDENTIALS.username && 
          credentials.password === ADMIN_CREDENTIALS.password) {
        
        // Store admin session
        localStorage.setItem('adminSession', JSON.stringify({
          loggedIn: true,
          timestamp: new Date().toISOString()
        }))
        
        navigate('/admin/dashboard')
      } else {
        setError('Invalid admin credentials')
      }
    } catch (err) {
      console.error('Admin login error:', err)
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
    <div className="admin-gateway">
      <div className="admin-gateway-content">
        <h2>Admin Access</h2>
        <p>Sign in to access the admin dashboard</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form className="admin-form" onSubmit={handleSubmit}>
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
        
        <div className="admin-info">
          <small>
            Contact system administrator for credentials if you don't have access.
          </small>
        </div>
      </div>
    </div>
  )
}
