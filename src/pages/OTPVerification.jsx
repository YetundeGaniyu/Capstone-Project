import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { sendOTPCode, generateOTPCode } from '../services/emailService'

export function OTPVerification() {
  const { currentUser: _currentUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [otpCode, setOtpCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resending, setResending] = useState(false)
  
  const phoneNumber = location.state?.phoneNumber

  const handleVerify = async (e) => {
    e.preventDefault()
    if (!otpCode.trim()) {
      setError('Please enter the OTP code')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      // In a real implementation, you'd verify the OTP with your backend
      // For now, we'll simulate successful verification
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Navigate to the appropriate page based on user role
      navigate('/dashboard')
    } catch (error) {
      console.error('OTP verification error:', error)
      setError('Invalid OTP code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!phoneNumber) return
    
    setResending(true)
    setError('')
    
    try {
      const code = generateOTPCode()
      await sendOTPCode(phoneNumber, code)
      // In a real app, you'd store this code securely
      console.log('New OTP code:', code)
    } catch (error) {
      console.error('OTP resend error:', error)
      setError('Failed to resend OTP code')
    } finally {
      setResending(false)
    }
  }

  if (!phoneNumber) {
    return (
      <section className="page page-otp">
        <div className="page-width">
          <div className="card auth-card">
            <h1 className="page-title">Phone Number Required</h1>
            <p>Please provide a phone number first.</p>
            <button 
              onClick={() => navigate(-1)} 
              className="btn btn-primary btn-block"
            >
              Go Back
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="page page-otp">
      <div className="page-width">
        <div className="card auth-card">
          <h1 className="page-title">Verify Your Phone</h1>
          <p className="page-subtitle">
            We've sent a 6-digit code to {phoneNumber}
          </p>

          <form className="form" onSubmit={handleVerify}>
            <div className="form-group">
              <label htmlFor="otpCode" className="form-label">
                OTP Code
              </label>
              <input
                type="text"
                id="otpCode"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
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
              {loading ? 'Verifying...' : 'Verify OTP'}
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
