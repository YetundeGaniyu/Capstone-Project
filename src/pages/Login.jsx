import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Login() {
  const { signInWithGoogle, currentUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Redirect if already logged in
  if (currentUser) {
    navigate('/dashboard')
    return null
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    try {
      await signInWithGoogle('user')
      navigate('/dashboard')
    } catch (err) {
      setError('Failed to sign in. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page page-login">
      <div className="page-width">
        <div className="card auth-card">
          <h1 className="page-title">User Sign In</h1>
          <p className="page-subtitle">
            Sign in to find and connect with trusted service providers
          </p>

          {error && <div className="error-message">{error}</div>}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="btn btn-primary btn-block"
          >
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>

          <div className="auth-footer">
            <p>New user?</p>
            <a href="/signup/user" className="link">Create an account</a>
          </div>
          
          <div className="auth-footer">
            <p>Are you a vendor?</p>
            <a href="/login/vendor" className="link">Sign in as vendor</a>
          </div>
        </div>
      </div>
    </section>
  )
}

