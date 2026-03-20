import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authAPI } from '../services/apiService'

export function VendorOTPVerification() {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [vendorData, setVendorData] = useState(null)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const vendorId = searchParams.get('vendorId')

  useEffect(() => {
    if (!vendorId) {
      setError('Invalid verification link')
      return
    }

    const fetchVendorData = async () => {
      try {
        console.log('🔍 Fetching vendor data for ID:', vendorId)
        
        // Mock vendor data for now - in production, this would call an API
        // const response = await authAPI.getVendorById(vendorId)
        
        // For now, simulate vendor data from sessionStorage or mock
        const mockVendorData = {
          vendorId: vendorId,
          businessName: 'Test Business',
          email: 'test@example.com',
          otp: '123456',
          otpExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          verificationLinkExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          emailVerified: false,
          otpVerified: false,
          status: 'pending_verification'
        }
        
        setVendorData(mockVendorData)
        console.log('✅ Mock vendor data loaded:', mockVendorData)
        
      } catch (error) {
        console.error('Error fetching vendor data:', error)
        setError('Failed to load vendor data')
      }
    }

    fetchVendorData()
  }, [vendorId, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!otp.trim()) {
      setError('Please enter the OTP')
      return
    }

    if (!vendorData) {
      setError('Vendor data not loaded')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('🔐 Verifying OTP:', otp)
      
      // Check if OTP has expired
      const expirationTime = new Date(vendorData.otpExpiration)
      if (new Date() > expirationTime) {
        setError('OTP has expired. Please request a new one.')
        return
      }

      // Verify OTP
      if (otp !== vendorData.otp) {
        setError('Invalid OTP. Please try again.')
        return
      }

      console.log('✅ OTP verification successful')
      
      // In production, this would call an API to update the vendor status
      // await authAPI.verifyVendor(vendorId, { otpVerified: true, status: 'active' })
      
      // For now, just show success and redirect
      setVendorData(prev => ({
        ...prev,
        emailVerified: true,
        otpVerified: true,
        status: 'active'
      }))

      // Redirect to vendor login with success message
      navigate('/login/vendor', { 
        state: { 
          message: 'Account verified successfully! You can now login.' 
        } 
      })
      
    } catch (error) {
      console.error('Error verifying OTP:', error)
      setError('Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!vendorData) return

    setLoading(true)
    setError('')

    try {
      console.log('🔄 Resending OTP for vendor:', vendorData.vendorId)
      
      // Generate new OTP and expiration
      const newOTP = Math.floor(100000 + Math.random() * 900000).toString()
      const newExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      console.log('📧 New OTP generated:', newOTP)

      // In production, this would call an API to update the vendor with new OTP
      // await authAPI.resendVendorOTP(vendorId, { otp: newOTP, otpExpiration: newExpiration })
      
      // For now, just update local state and log
      setVendorData(prev => ({
        ...prev,
        otp: newOTP,
        otpExpiration: newExpiration.toISOString(),
        verificationLinkExpiration: newExpiration.toISOString()
      }))

      // Send new OTP via email (in production, this would send an actual email)
      console.log('📧 New OTP would be sent to:', vendorData.email)
      console.log('🔢 New OTP:', newOTP)

      setError('New OTP sent to your email')
      
    } catch (error) {
      console.error('Error resending OTP:', error)
      setError('Failed to resend OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (error && error.includes('expired') && !vendorData) {
    return (
      <section className="page page-otp-verification">
        <div className="page-width">
          <div className="card auth-card">
            <h1 className="page-title">Verification Failed</h1>
            <p className="page-subtitle">
              {error}
            </p>
            <button 
              onClick={() => navigate('/vendor/create')}
              className="btn btn-primary btn-block"
            >
              Register Again
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="page page-otp-verification">
      <div className="page-width">
        <div className="card auth-card">
          <h1 className="page-title">Verify Your Account</h1>
          <p className="page-subtitle">
            Enter the 6-digit OTP sent to your email to complete verification
          </p>

          {error && <div className="error-message">{error}</div>}

          {vendorData && (
            <div className="vendor-info">
              <p><strong>Business:</strong> {vendorData.businessName}</p>
              <p><strong>Email:</strong> {vendorData.email}</p>
            </div>
          )}

          <form className="form" onSubmit={handleSubmit}>
            <label className="field">
              <span className="field-label">Enter OTP</span>
              <input
                className="field-input"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                pattern="[0-9]{6}"
                required
              />
            </label>

            <button
              type="submit"
              disabled={loading || !vendorData}
              className="btn btn-primary btn-block"
            >
              {loading ? 'Verifying...' : 'Verify Account'}
            </button>

            <div className="otp-actions">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading || !vendorData}
                className="btn btn-ghost btn-sm"
              >
                Resend OTP
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/login/vendor')}
                className="btn btn-ghost btn-sm"
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
