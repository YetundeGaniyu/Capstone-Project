import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { doc, updateDoc, query, collection, where, getDocs } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../context/AuthContext'

export function VendorLogin() {
  const { signInWithGoogle, currentUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [credentials, setCredentials] = useState({
    businessName: '',
    password: ''
  })
  const [showOTP, setShowOTP] = useState(false)
  const [vendorData, setVendorData] = useState(null)
  const [otp, setOtp] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const successMessage = location.state?.message

  // Redirect if already logged in
  if (currentUser) {
    navigate('/dashboard')
    return null
  }

  const handleBusinessLogin = async (e) => {
    e.preventDefault()
    if (!credentials.businessName || !credentials.password) {
      setError('Please enter both business name and password')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Query vendors collection for business name
      const vendorsRef = collection(db, 'vendors')
      const q = query(vendorsRef, where('businessName', '==', credentials.businessName.trim()))
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        setError('Invalid business name or password')
        return
      }

      const vendorDoc = querySnapshot.docs[0]
      const vendor = vendorDoc.data()

      // Check password (in production, this should be hashed and compared securely)
      if (vendor.password !== credentials.password) {
        setError('Invalid business name or password')
        return
      }

      // Check if account is verified
      if (!vendor.emailVerified || !vendor.otpVerified) {
        // Show OTP verification screen
        setVendorData({ ...vendor, id: vendorDoc.id })
        setShowOTP(true)
        return
      }

      // Check if account is active
      if (vendor.status !== 'active') {
        setError('Account is not active. Please complete verification.')
        return
      }

      // Login successful - proceed with Google auth for session
      await signInWithGoogle('vendor')
      navigate('/dashboard')
      
    } catch (err) {
      console.error('Login error:', err)
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOTPVerification = async (e) => {
    e.preventDefault()
    
    if (!otp.trim()) {
      setError('Please enter the OTP')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Check if OTP has expired
      const expirationTime = new Date(vendorData.otpExpiration)
      if (new Date() > expirationTime) {
        setError('OTP has expired. Please register again.')
        return
      }

      // Verify OTP
      if (otp !== vendorData.otp) {
        setError('Invalid OTP. Please try again.')
        return
      }

      // Update vendor status to verified
      const vendorRef = doc(db, 'vendors', vendorData.id)
      await updateDoc(vendorRef, {
        emailVerified: true,
        otpVerified: true,
        status: 'active',
        updatedAt: new Date().toISOString(),
        otp: '', // Clear OTP after verification
        otpExpiration: null,
        verificationLinkExpiration: null
      })

      // Login successful
      await signInWithGoogle('vendor')
      navigate('/dashboard')
      
    } catch (err) {
      console.error('OTP verification error:', err)
      setError('Verification failed. Please try again.')
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
    <section className="page page-vendor-login">
      <div className="page-width">
        <div className="card auth-card">
          <h1 className="page-title">Vendor Login</h1>
          <p className="page-subtitle">
            Sign in to manage your vendor profile and connect with customers
          </p>

          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          {!showOTP ? (
            <form className="form" onSubmit={handleBusinessLogin}>
              <div className="form-group">
                <label htmlFor="businessName" className="form-label">
                  Business Name
                </label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  value={credentials.businessName}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your business name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-block"
              >
                {loading ? 'Signing in...' : 'Login'}
              </button>
            </form>
          ) : (
            <form className="form" onSubmit={handleOTPVerification}>
              <div className="otp-info">
                <p><strong>Business:</strong> {vendorData?.businessName}</p>
                <p><strong>Email:</strong> {vendorData?.email}</p>
              </div>

              <div className="form-group">
                <label htmlFor="otp" className="form-label">
                  Enter OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="form-input"
                  placeholder="123456"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-block"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <div className="otp-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowOTP(false)
                    setVendorData(null)
                    setOtp('')
                  }}
                  className="btn btn-ghost btn-sm"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}

          <div className="auth-footer">
            <p>New vendor?</p>
            <a href="/vendor/create" className="link">Create Account</a>
          </div>
        </div>
      </div>
    </section>
  )
}
