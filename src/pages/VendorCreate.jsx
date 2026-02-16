import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function VendorCreate() {
  const { signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [businessProfile, setBusinessProfile] = useState({
    businessName: '',
    description: '',
    phoneNumber: '',
    location: ''
  })
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!businessProfile.businessName || !businessProfile.description || 
        !businessProfile.phoneNumber || !businessProfile.location) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      // Sign up with Google and create vendor profile
      await signInWithGoogle('vendor')
      
      // Store business profile data for onboarding
      navigate('/vendor/profile', { 
        state: { 
          prefillData: {
            businessName: businessProfile.businessName,
            description: businessProfile.description,
            phone: businessProfile.phoneNumber,
            address: businessProfile.location
          }
        } 
      })
    } catch (err) {
      setError('Failed to create business profile. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setBusinessProfile({
      ...businessProfile,
      [e.target.name]: e.target.value
    })
  }

  return (
    <section className="page page-vendor-create">
      <div className="page-width">
        <div className="card auth-card">
          <h1 className="page-title">Create Business Profile</h1>
          <p className="page-subtitle">
            Tell us about your business to get started
          </p>

          {error && <div className="error-message">{error}</div>}

          <form className="form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="businessName" className="form-label">
                Business Name *
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={businessProfile.businessName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g. Adeola Kitchens"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Brief Description of Service *
              </label>
              <textarea
                id="description"
                name="description"
                value={businessProfile.description}
                onChange={handleInputChange}
                className="form-input"
                rows={4}
                placeholder="Describe what services you offer..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber" className="form-label">
                Phone Number (Preferably WhatsApp) *
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={businessProfile.phoneNumber}
                onChange={handleInputChange}
                className="form-input"
                placeholder="+234 800 000 0000"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="location" className="form-label">
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={businessProfile.location}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g. Lagos, Nigeria"
                required
              />
              <small className="form-help">
                Your location helps customers find you. You can set exact location on map later.
              </small>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-block"
            >
              {loading ? 'Creating Profile...' : 'Create Business Profile'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account?</p>
            <a href="/login/vendor" className="link">Sign in</a>
          </div>
        </div>
      </div>
    </section>
  )
}
