import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../services/firebase'

export function VendorPasswordStep() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const vendorData = JSON.parse(sessionStorage.getItem('vendorData') || '{}')
  
  // Initialize form with saved data if available
  useEffect(() => {
    const storedData = JSON.parse(sessionStorage.getItem('vendorData') || '{}')
    const formDataFromStorage = storedData.passwordData || {}
    
    if (formDataFromStorage.password || formDataFromStorage.confirmPassword) {
      setFormData(formDataFromStorage)
    }
    
    // Clean up vendorData by removing passwordData
    delete storedData.passwordData
    sessionStorage.setItem('vendorData', JSON.stringify(storedData))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.password) newErrors.password = 'Password is required'
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    return newErrors
  }

  const generateVendorId = () => {
    return `VND_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  }

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  const sendEmailConfirmation = async (vendorData, otp) => {
    // In production, this would send an email with verification link and OTP
    // For now, we'll just log it to avoid delays
    console.log('Email confirmation would be sent to:', vendorData.email)
    console.log('Verification link:', `https://smeconnect.com/verify/${vendorData.vendorId}`)
    console.log('OTP:', otp)
    
    // Return immediately to avoid submission delays
    return Promise.resolve(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    // Check if vendorData exists
    if (!vendorData || Object.keys(vendorData).length === 0) {
      setErrors({ submit: 'Session expired. Please start over.' })
      return
    }

    setLoading(true)

    try {
      const vendorId = generateVendorId()
      const otp = generateOTP()
      const expirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000)
      
      const completeVendorData = {
        ...vendorData,
        vendorId,
        password: formData.password,
        createdAt: new Date().toISOString(),
        status: 'pending_verification',
        emailVerified: false,
        otpVerified: false,
        otp: otp,
        otpExpiration: expirationTime.toISOString(),
        verificationLinkExpiration: expirationTime.toISOString(),
      }

      console.log('Creating vendor profile...')

      // Optimized database write - use setDoc with merge option for better performance
      const vendorRef = doc(db, 'vendors', vendorId)
      await setDoc(vendorRef, completeVendorData, { merge: false })

      console.log('Vendor profile created successfully')

      // Show immediate success feedback
      const successMessage = 'Profile created successfully! Please check your email to confirm your account.'
      
      // Update UI with success message immediately
      setErrors({ submit: 'success' })
      setShowSuccess(true)
      
      // Show success alert
      alert(successMessage)

      // Send email confirmation asynchronously (non-blocking)
      sendEmailConfirmation(completeVendorData, otp).catch(console.error)

      // Clear sessionStorage
      sessionStorage.removeItem('vendorData')
      
      // Navigate after a short delay to allow user to see the success message
      setTimeout(() => {
        navigate('/login/vendor', {
          state: {
            message: 'Profile created! Please check your email for verification link and OTP.'
          }
        })
      }, 500) // Reduced delay for faster response
      
    } catch (error) {
      console.error('Error creating vendor profile:', error)
      setErrors({ submit: 'Failed to create profile. Please try again.' })
      alert('Failed to create profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    // Save current password data to sessionStorage before going back
    const currentData = {
      ...vendorData,
      passwordData: formData
    }
    sessionStorage.setItem('vendorData', JSON.stringify(currentData))
    navigate('/vendor/create')
  }

  return (
    <section className="page page-vendor-password">
      <div className="page-width">
        <div className="card auth-card">
          <h1 className="page-title">Set Password</h1>
          <p className="page-subtitle">
            Create a secure password for your vendor account
          </p>

          {showSuccess && (
            <div className="success-message">
              Profile created successfully! Please check your email to confirm your account.
            </div>
          )}

          {errors.submit && errors.submit !== 'success' && (
            <div className="error-message">
              {errors.submit}
            </div>
          )}

          <form className="form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="password" className="field-label">
                Password
              </label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`field-input ${errors.password ? 'error' : ''}`}
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? '👁' : '👁‍🗨'}
                </button>
              </div>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <div className="field">
              <label htmlFor="confirmPassword" className="field-label">
                Confirm Password
              </label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`field-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Confirm password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex="-1"
                >
                  {showConfirmPassword ? '👁' : '👁‍🗨'}
                </button>
              </div>
              {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={handleBack}
                className="btn btn-ghost"
                disabled={loading}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
