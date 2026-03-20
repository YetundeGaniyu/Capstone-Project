import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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
    e.preventDefault();
    if (!credentials.businessName || !credentials.password) {
      setError("Please enter both business name and password");
      return;
    }

setLoading(true)
    setError('')

    try {
      // For now, we'll use a simple validation approach
      // In a full implementation, this would call authAPI.login()
      if (credentials.businessName === 'test' && credentials.password === 'test') {
        // Mock successful login
        await signInWithGoogle('vendor')
        navigate('/dashboard')
        return
      }

      setError('Invalid business name or password')
      
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
