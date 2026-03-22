import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authAPI } from '../services/apiService'

const VendorOtpVerification = () => {
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const businessName = location.state?.businessName || 
                       localStorage.getItem('vendorBusinessName')

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      console.log('=== OTP VERIFICATION ===')
      console.log('OTP entered:', otp)
      console.log('Business name:', businessName)
      
      const response = await authAPI.verifyOTP({ 
        otp, 
        businessName 
      })
      
      console.log('OTP response:', response)
      
      if (response.success) {
        console.log('OTP verified! Navigating to /vendor/profile')
        localStorage.setItem('otpVerified', 'true')
        // Save updated vendor data if returned
        if (response.data) {
          localStorage.setItem('vendorData', JSON.stringify(response.data))
        }
        navigate('/vendor/profile')
      } else {
        console.log('OTP failed:', response.message)
        setError(response.message || 'Invalid OTP. Please try again.')
      }
    } catch (error) {
      console.error('OTP error:', error)
      setError(error.message || 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: 'url(/afro-img.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>
          Enter OTP
        </h2>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '24px' }}>
          Enter OTP sent to your email alongside your confirmation link
        </p>
        {error && (
          <div style={{
            background: '#fee2e2', color: '#dc2626',
            padding: '12px', borderRadius: '8px', marginBottom: '16px'
          }}>
            {error}
          </div>
        )}
        <form onSubmit={handleVerifyOtp}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              OTP Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              maxLength={6}
              style={{
                width: '100%', padding: '12px',
                borderRadius: '8px', border: '1px solid #e5e7eb',
                fontSize: '20px', textAlign: 'center', letterSpacing: '6px'
              }}
              required
            />
          </div>
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px',
            borderRadius: '8px', background: '#f59e0b',
            color: 'white', border: 'none',
            fontWeight: '600', cursor: 'pointer', fontSize: '16px'
          }}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '16px', color: '#6b7280' }}>
          Didn't receive OTP?{' '}
          <span onClick={() => navigate('/vendor/login')}
            style={{ color: '#f59e0b', cursor: 'pointer' }}>
            Go back to login
          </span>
        </p>
      </div>
    </div>
  )
}

export default VendorOtpVerification
