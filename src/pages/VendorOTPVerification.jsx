import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../services/firebase'

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
        const vendorRef = doc(db, 'vendors', vendorId)
        const vendorDoc = await getDoc(vendorRef)
        
        if (!vendorDoc.exists()) {
          setError('Vendor not found')
          return
        }

        const data = vendorDoc.data()
        
        // Check if verification link has expired
        const expirationTime = new Date(data.verificationLinkExpiration)
        if (new Date() > expirationTime) {
          setError('Verification link has expired. Please register again.')
          return
        }

        // Check if already verified
        if (data.emailVerified && data.otpVerified) {
          setError('Account already verified. Please login.')
          setTimeout(() => navigate('/login/vendor'), 3000)
          return
        }

        setVendorData(data)
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

      // Update vendor status to verified
      const vendorRef = doc(db, 'vendors', vendorId)
      await updateDoc(vendorRef, {
        emailVerified: true,
        otpVerified: true,
        status: 'active',
        updatedAt: new Date().toISOString(),
        otp: '', // Clear OTP after verification
        otpExpiration: null,
        verificationLinkExpiration: null
      })

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
      // Generate new OTP and expiration
      const newOTP = Math.floor(100000 + Math.random() * 900000).toString()
      const newExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      // Update vendor with new OTP
      const vendorRef = doc(db, 'vendors', vendorId)
      await updateDoc(vendorRef, {
        otp: newOTP,
        otpExpiration: newExpiration.toISOString(),
        verificationLinkExpiration: newExpiration.toISOString()
      })

      // Send new OTP via email (in production, this would send an actual email)
      console.log('New OTP sent to:', vendorData.email)
      console.log('New OTP:', newOTP)

      setVendorData(prev => ({
        ...prev,
        otp: newOTP,
        otpExpiration: newExpiration.toISOString()
      }))

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
