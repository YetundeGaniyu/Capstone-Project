import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function UserSignUp() {
  const { signInWithGoogle, currentUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Redirect if already logged in
  if (currentUser) {
    navigate('/dashboard')
    return null
  }

  const handleGoogleSignUp = async () => {
    setLoading(true)
    setError('')
    try {
      await signInWithGoogle('user')
      // Navigate to dashboard since role is set
      navigate('/dashboard')
    } catch (err) {
      setError('Failed to sign up. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page page-signup">
      <div className="page-width">
        <div className="card auth-card">
          <h1 className="page-title">Sign up as SME Owner</h1>
          <p className="page-subtitle">
            Connect with talented artisans and vendors for your business needs
          </p>

          {error && <div className="error-message">{error}</div>}

          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="btn btn-primary btn-block"
          >
            {loading ? 'Signing up...' : 'Sign up with Google'}
          </button>

          <div className="auth-footer">
            <p>Already have an account?</p>
            <a href="/login" className="link">Sign in</a>
          </div>
        </div>
      </div>
    </section>
  )
}
