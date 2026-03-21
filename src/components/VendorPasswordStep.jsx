import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/apiService'

export function VendorPasswordStep() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [showSuccess, setShowSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const vendorData = JSON.parse(localStorage.getItem('pendingVendorData') || '{}')
  
  // Initialize form with saved data if available
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('pendingVendorData') || '{}')
    const formDataFromStorage = storedData.passwordData || {}
    
    // Only set form data if there's saved password data
    if (formDataFromStorage.password || formDataFromStorage.confirmPassword) {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        setFormData(formDataFromStorage)
      }, 0)
    }
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

    // Prepare form data for backend
    const completeData = {
      name: vendorData.fullName || vendorData.name,
      businessName: vendorData.businessName,
      email: vendorData.email,
      category: vendorData.category,
      description: vendorData.description,
      phone: vendorData.phone,
      whatsapp: vendorData.whatsapp,
      address: vendorData.address,
      workingHours: vendorData.workingHours,
      password: formData.password,
    }

    console.log('🚀 Form data being sent:', completeData)
    
    setLoading(true)
    setErrors({})

    try {
      console.log('📤 Calling backend API...')
      const response = await authAPI.registerProvider(completeData)
      console.log('✅ Backend response:', response)

      // Show success message
      setShowSuccess(true)
      
      // Clear localStorage
      localStorage.removeItem('pendingVendorData')
      
      // Navigate to login with success message
      setTimeout(() => {
        navigate('/login/vendor', {
          state: {
            message: 'Registration successful! Please check your email for verification link and OTP.'
          }
        })
      }, 2000)

    } catch (error) {
      console.error('❌ Registration error:', error)
      console.error('❌ Error details:', error.message)
      setErrors({ submit: error.message || 'Failed to create profile. Please try again.' })
      setShowSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    // Save current password data to localStorage before going back
    const currentData = {
      ...vendorData,
      passwordData: formData
    }
    localStorage.setItem('pendingVendorData', JSON.stringify(currentData))
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
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  )}
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
                  {showConfirmPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={handleBack}
                className="btn btn-ghost"
              >
                Back
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating Profile...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
