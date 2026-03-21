import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/apiService'

export function EmailVerification() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setError('No verification token provided')
      setLoading(false)
      return
    }

    const verifyEmail = async () => {
      try {
        console.log('🔍 Verifying email with token:', token)
        
        const response = await authAPI.verifyEmail({ token })
        console.log('✅ Email verification response:', response)
        
        if (response.success) {
          setSuccess(true)
          setError(null)
          
          // Redirect to login after showing success message
          setTimeout(() => {
            navigate('/login/vendor', {
              state: {
                message: 'Email verified successfully! You can now log in.'
              }
            })
          }, 2000)
        } else {
          setError(response.message || 'Email verification failed')
        }
      } catch (error) {
        console.error('❌ Email verification error:', error)
        setError(error.message || 'Link expired or invalid')
      } finally {
        setLoading(false)
      }
    }

    verifyEmail()
  }, [token, navigate])

  const handleGoToLogin = () => {
    navigate('/login/vendor')
  }

  return (
    <section className="page page-email-verification">
      <div className="page-width">
        <div className="card auth-card">
          <h1 className="page-title">Email Verification</h1>
          
          {loading ? (
            <div className="verification-loading">
              <div className="spinner"></div>
              <p>Verifying your email...</p>
            </div>
          ) : success ? (
            <div className="verification-success">
              <div className="verification-icon">✅</div>
              <h2>Email Verified!</h2>
              <p>Your email has been successfully verified.</p>
              <p>You will be redirected to login shortly...</p>
            </div>
          ) : (
            <div className="verification-error">
              <div className="verification-icon">❌</div>
              <h2>Verification Failed</h2>
              <p>{error || 'Link expired or invalid'}</p>
              <button 
                onClick={handleGoToLogin}
                className="btn btn-primary"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
