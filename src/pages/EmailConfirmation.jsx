import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { sendEmailConfirmation, generateConfirmationCode } from '../services/emailService'

export function EmailConfirmation() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [confirmationCode, setConfirmationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resending, setResending] = useState(false)
  
  const email = currentUser?.email || location.state?.email

  const handleConfirm = async (e) => {
    e.preventDefault()
    if (!confirmationCode.trim()) {
      setError('Please enter the confirmation code')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      // In a real implementation, you'd verify the code with your backend
      // For now, we'll simulate successful confirmation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Navigate to the appropriate page based on user role
      navigate('/dashboard')
    } catch (err) {
      setError('Invalid confirmation code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) return
    
    setResending(true)
    setError('')
    
    try {
      const code = generateConfirmationCode()
      await sendEmailConfirmation(email, code)
      // In a real app, you'd store this code securely
      console.log('New confirmation code:', code)
    } catch (err) {
      setError('Failed to resend confirmation email')
    } finally {
      setResending(false)
    }
  }

  if (!email) {
    return (
      <section className="page page-confirmation">
        <div className="page-width">
          <div className="card auth-card">
            <h1 className="page-title">Email Required</h1>
            <p>Please sign up first to confirm your email.</p>
            <button 
              onClick={() => navigate('/signup')} 
              className="btn btn-primary btn-block"
            >
              Sign Up
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="page page-confirmation">
      <div className="page-width">
        <div className="card auth-card">
          <h1 className="page-title">Confirm Your Email</h1>
          <p className="page-subtitle">
            We've sent a confirmation code to {email}
          </p>

          <form className="form" onSubmit={handleConfirm}>
            <div className="form-group">
              <label htmlFor="confirmationCode" className="form-label">
                Confirmation Code
              </label>
              <input
                type="text"
                id="confirmationCode"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value.toUpperCase())}
                className="form-input"
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-block"
            >
              {loading ? 'Confirming...' : 'Confirm Email'}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="btn btn-ghost btn-block"
            >
              {resending ? 'Resending...' : 'Resend Code'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
