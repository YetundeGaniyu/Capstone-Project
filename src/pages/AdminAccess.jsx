import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function AdminAccess() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    adminKey: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    console.log('Admin login attempt:', credentials)
    
    if (!credentials.email || !credentials.password || !credentials.adminKey) {
      setError('Please enter email, password, and admin key')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Admin credentials
      const ADMIN_CREDENTIALS = {
        email: 'admin@smeconnect.com',
        password: 'Admin@2024!Secure',
        adminKey: 'ADMIN-2024-KEY'
      }
      
      console.log('Expected credentials:', ADMIN_CREDENTIALS)
      console.log('Email match:', credentials.email === ADMIN_CREDENTIALS.email)
      console.log('Password match:', credentials.password === ADMIN_CREDENTIALS.password)
      console.log('Admin key match:', credentials.adminKey === ADMIN_CREDENTIALS.adminKey)
      
      if (credentials.email === ADMIN_CREDENTIALS.email && 
          credentials.password === ADMIN_CREDENTIALS.password &&
          credentials.adminKey === ADMIN_CREDENTIALS.adminKey) {
        
        console.log('Authentication successful!')
        
        // Store admin session
        const sessionData = {
          loggedIn: true,
          timestamp: new Date().toISOString()
        }
        localStorage.setItem('adminSession', JSON.stringify(sessionData))
        
        console.log('Session stored:', sessionData)
        
        navigate('/admin/dashboard')
      } else {
        console.log('Authentication failed!')
        setError('Invalid admin credentials')
      }
    } catch (err) {
      console.error('Error during authentication:', err)
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
            
            <form className="form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={credentials.email}
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
                  value={credentials.password}
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
                  value={credentials.adminKey}
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
