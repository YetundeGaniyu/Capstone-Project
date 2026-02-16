import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function AdminAccess() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    console.log('Admin login attempt:', credentials)
    
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
      
      console.log('Expected credentials:', ADMIN_CREDENTIALS)
      console.log('Username match:', credentials.username === ADMIN_CREDENTIALS.username)
      console.log('Password match:', credentials.password === ADMIN_CREDENTIALS.password)
      
      if (credentials.username === ADMIN_CREDENTIALS.username && 
          credentials.password === ADMIN_CREDENTIALS.password) {
        
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
            
            <div className="admin-access-info">
              <small>
                Contact system administrator for credentials if you don't have access.
              </small>
            </div>

            <div className="admin-access-links">
              <a href="/" className="link">← Back to Home</a>
              <a href="/login" className="link">User Login</a>
            </div>

            <div className="admin-test-section">
              <button 
                onClick={() => {
                  const testCreds = {
                    username: 'admin@smeconnect.com',
                    password: 'Admin@2024!Secure'
                  }
                  setCredentials(testCreds)
                  console.log('Test credentials filled:', testCreds)
                }}
                className="btn btn-secondary btn-sm"
              >
                Fill Test Credentials
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
