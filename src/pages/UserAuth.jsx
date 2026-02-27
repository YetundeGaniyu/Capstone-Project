import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function UserAuth() {
  const { signInWithGoogle, currentUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [authMode, setAuthMode] = useState('signin') // 'signin' or 'signup'
  const navigate = useNavigate()

  // Redirect if already logged in
  if (currentUser) {
    navigate('/dashboard')
    return null
  }

  const handleGoogleAuth = async () => {
    setLoading(true)
    setError('')
    try {
      await signInWithGoogle('user')
      navigate('/dashboard')
    } catch (err) {
      setError('Failed to authenticate with Google. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page page-user-auth">
      <div className="page-width">
        <div className="card auth-card">
          <h1 className="page-title">
            {authMode === 'signin' ? 'User Sign In' : 'User Sign Up'}
          </h1>
          <p className="page-subtitle">
            {authMode === 'signin' 
              ? 'Sign in to find and connect with trusted service providers'
              : 'Join SMEsConnect to discover amazing service providers'
            }
          </p>

          {error && <div className="error-message">{error}</div>}

          <div className="auth-mode-toggle">
            <button
              type="button"
              className={`btn ${authMode === 'signin' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setAuthMode('signin')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`btn ${authMode === 'signup' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setAuthMode('signup')}
            >
              Sign Up
            </button>
          </div>

          <div className="auth-content">
            {authMode === 'signin' ? (
              <div className="signin-form">
                <p className="auth-description">
                  Welcome back! Sign in to continue finding trusted service providers for your business.
                </p>
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="btn btn-primary btn-block"
                >
                  {loading ? 'Signing in...' : 'Continue with Google'}
                </button>
              </div>
            ) : (
              <div className="signup-form">
                <p className="auth-description">
                  New to SMEsConnect? Create an account to start connecting with verified vendors and artisans.
                </p>
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="btn btn-primary btn-block"
                >
                  {loading ? 'Creating account...' : 'Continue with Google'}
                </button>
              </div>
            )}
          </div>

          <div className="auth-footer">
            {authMode === 'signin' ? (
              <>
                <p>New user?</p>
                <button 
                  onClick={() => setAuthMode('signup')} 
                  className="link"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                <p>Already have an account?</p>
                <button 
                  onClick={() => setAuthMode('signin')} 
                  className="link"
                >
                  Sign in
                </button>
              </>
            )}
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
