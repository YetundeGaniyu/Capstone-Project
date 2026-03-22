import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/apiService'

export function VendorLogin() {
  const { signInWithGoogle, currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
    navigate("/dashboard");
    return null;
  }

  const handleBusinessLogin = async (e) => {
    e.preventDefault()
    console.log('Calling vendor login endpoint...')
    
    const { businessName, password } = credentials
    
    if (!businessName || !password) {
      setError('Business name and password are required')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const response = await authAPI.loginProvider({
        businessName: businessName.trim(),
        password: password
      })
      
      console.log('Vendor login response:', response)
      
      if (response.success) {
        localStorage.setItem('authToken', 
          response.token || response.data?.token
        )
        localStorage.setItem('isVendor', 'true')
        localStorage.setItem('vendorBusinessName', businessName)
        localStorage.setItem('vendorData', JSON.stringify(response.data || response))
        
        console.log('Full login response data:', response.data)
        
        // Check if vendor needs OTP verification or is already verified
        const isOtpVerified = response.data?.otpVerified || 
                              response.data?.isVerified ||
                              response.otpVerified

        console.log('OTP verified status:', isOtpVerified)
        
        if (isOtpVerified) {
          // Already verified — go straight to profile
          navigate('/vendor/profile')
        } else {
          // Needs OTP verification
          navigate('/vendor/verify-otp', { state: { businessName } })
        }
      } else {
        setError(response.message || 'Login failed')
      }
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOTPVerification = async (e) => {
    e.preventDefault()
    
    if (!otp.trim()) {
      setError('Please enter OTP')
      return
    }

    setLoading(true)
    setError('')

    try {
      // For now, we'll use a simple OTP validation
      // In a full implementation, this would call authAPI.verifyOTP()
      if (otp === '123456') {
        // Mock successful OTP verification
        await signInWithGoogle('vendor')
        navigate('/dashboard')
        return
      }

      setError('Invalid OTP. Please try again.')
      
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
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section className="page page-vendor-login">
      <div className="page-width">
        <div className="card auth-card vendor-login-simple">
          <h1 className="page-title">Vendor Login</h1>
          <p className="page-subtitle">
            Sign in to manage your business profile
          </p>

          {successMessage && (
            <div style={{
              background: '#d1fae5', color: '#065f46',
              padding: '12px', borderRadius: '8px', marginBottom: '16px',
              textAlign: 'center'
            }}>
              ✅ {successMessage}
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
                  placeholder="Enter your registered business name"
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
                className="btn btn-vendor-login btn-block"
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
                className="btn btn-vendor-login btn-block"
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

          <hr className="auth-divider" />

          <div className="auth-footer">
            <p>New Service provider?</p>
            <a href="/vendor/create" className="link">
              Create Account
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
