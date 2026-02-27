import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../services/firebase'

const CATEGORIES = [
  'Logistics',
  'Photography',
  'Graphic design',
  'Creative arts',
  'Electrician',
  'Plumber',
  'Painter',
  'Carpenter',
  'Catering',
  'Cleaning Services',
  'Events',
  'Fashion designing',
  'Repairs',
  'Hairstylist',
  'Other',
]

export function VendorForm() {
  const location = useLocation()
  const prefilled = location.state?.prefilled

  const [formValues, setFormValues] = useState({
    fullName: '',
    businessName: '',
    email: '',
    category: '',
    description: '',
    phone: '',
    whatsapp: '',
    address: '',
    password: '',
    confirmPassword: '',
    workingHours: {
      monday: { open: '', close: '', closed: false },
      tuesday: { open: '', close: '', closed: false },
      wednesday: { open: '', close: '', closed: false },
      thursday: { open: '', close: '', closed: false },
      friday: { open: '', close: '', closed: false },
      saturday: { open: '', close: '', closed: false },
      sunday: { open: '', close: '', closed: false },
    },
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (prefilled && typeof prefilled === 'object') {
      setFormValues((prev) => ({
        ...prev,
        businessName: prefilled.businessName ?? prev.businessName,
        category: prefilled.category ?? prev.category,
        description: prefilled.description ?? prev.description,
        phone: prefilled.phone ?? prev.phone,
        whatsapp: prefilled.whatsapp ?? prev.whatsapp,
        address: prefilled.address ?? prev.address,
        latitude: prefilled.latitude ?? prev.latitude,
        longitude: prefilled.longitude ?? prev.longitude,
      }))
    }
  }, [prefilled])

  // For new vendor registration, we don't require authentication
  // The form will handle authentication during submission

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    
    if (name.includes('workingHours')) {
      const [day, field] = name.split('.')
      setFormValues((prev) => ({
        ...prev,
        workingHours: {
          ...prev.workingHours,
          [day]: {
            ...prev.workingHours[day],
            [field]: type === 'checkbox' ? checked : value,
          },
        },
      }))
    } else {
      setFormValues((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
    
    setErrors((prev) => ({ ...prev, [name]: '' }))
    setSavedMessage('')
  }

  const validate = () => {
    const newErrors = {}
    if (!formValues.fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!formValues.businessName.trim()) newErrors.businessName = 'Business name is required'
    if (!formValues.email.trim()) newErrors.email = 'Email is required'
    if (!/\S+@\S+\.\S+/.test(formValues.email)) newErrors.email = 'Please enter a valid email'
    if (!formValues.category) newErrors.category = 'Category is required'
    if (!formValues.description.trim()) newErrors.description = 'Description is required'
    if (!formValues.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formValues.address.trim()) newErrors.address = 'Address is required'
    if (!formValues.password) newErrors.password = 'Password is required'
    if (formValues.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (!formValues.confirmPassword) newErrors.confirmPassword = 'Please confirm your password'
    if (formValues.password !== formValues.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    return newErrors
  }

  const generateVendorId = () => {
    return `VND_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  }

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  const sendEmailConfirmation = async (vendorData, otp) => {
    // This would integrate with an email service like SendGrid, Firebase Functions, etc.
    // For now, we'll simulate the email sending
    console.log('Email confirmation sent to:', vendorData.email)
    console.log('Verification link:', `https://smeconnect.com/verify/${vendorData.vendorId}`)
    console.log('OTP:', otp)
    
    // In a real implementation, you would:
    // 1. Send email with verification link and OTP
    // 2. Store OTP and expiration in database
    // 3. Set expiration time (24 hours)
    
    return true
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSaving(true)
    setSavedMessage('')

    try {
      const vendorId = generateVendorId()
      const otp = generateOTP()
      const expirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      
      const vendorData = {
        vendorId,
        fullName: formValues.fullName.trim(),
        businessName: formValues.businessName.trim(),
        category: formValues.category,
        description: formValues.description.trim(),
        phone: formValues.phone.trim(),
        whatsapp: formValues.whatsapp.trim(),
        address: formValues.address.trim(),
        password: formValues.password, // In production, this should be hashed
        workingHours: formValues.workingHours,
        email: formValues.email.trim(),
        createdAt: new Date().toISOString(),
        status: 'pending_verification',
        emailVerified: false,
        otpVerified: false,
        otp: otp,
        otpExpiration: expirationTime.toISOString(),
        verificationLinkExpiration: expirationTime.toISOString(),
      }

      // Store vendor data in Firestore
      const vendorRef = doc(db, 'vendors', vendorId)
      await setDoc(vendorRef, vendorData)

      // Send email confirmation with OTP
      await sendEmailConfirmation(vendorData, otp)

      setSavedMessage('Vendor profile created! Please check your email for verification link and OTP.')
      
      // Redirect to vendor login after successful registration
      setTimeout(() => {
        navigate('/login/vendor')
      }, 3000)
      
    } catch (error) {
      console.error('Error creating vendor profile:', error)
      setSavedMessage('Something went wrong while creating your profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page page-vendor-form">
      <div className="page-width">
        <div className="card auth-card">
          <h1 className="page-title">Create Vendor Profile</h1>
          <p className="page-subtitle">
            Complete your vendor profile to start connecting with customers.
          </p>

          <form className="form" onSubmit={handleSubmit} noValidate>
            <label className="field">
              <span className="field-label">Full Name</span>
              <input
                className="field-input"
                name="fullName"
                type="text"
                value={formValues.fullName}
                onChange={handleChange}
                placeholder="John Doe"
              />
              {errors.fullName && <span className="field-error">{errors.fullName}</span>}
            </label>

            <label className="field">
              <span className="field-label">Business Name</span>
              <input
                className="field-input"
                name="businessName"
                type="text"
                value={formValues.businessName}
                onChange={handleChange}
                placeholder="Adeola Kitchens"
              />
              {errors.businessName && <span className="field-error">{errors.businessName}</span>}
            </label>

            <label className="field">
              <span className="field-label">Email Address</span>
              <input
                className="field-input"
                name="email"
                type="email"
                value={formValues.email}
                onChange={handleChange}
                placeholder="john@example.com"
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </label>

            <label className="field">
              <span className="field-label">Service Category</span>
              <select
                className="field-input"
                name="category"
                value={formValues.category}
                onChange={handleChange}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && <span className="field-error">{errors.category}</span>}
            </label>

            <label className="field">
              <span className="field-label">Description</span>
              <textarea
                className="field-input field-textarea"
                name="description"
                rows="4"
                value={formValues.description}
                onChange={handleChange}
                placeholder="Short overview of your services, ideal order sizes, and typical clients."
              />
              {errors.description && <span className="field-error">{errors.description}</span>}
            </label>

            <label className="field">
              <span className="field-label">Phone Number</span>
              <input
                className="field-input"
                name="phone"
                type="tel"
                value={formValues.phone}
                onChange={handleChange}
                placeholder="+234..."
              />
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </label>

            <label className="field">
              <span className="field-label">WhatsApp Link (optional)</span>
              <input
                className="field-input"
                name="whatsapp"
                type="url"
                value={formValues.whatsapp}
                onChange={handleChange}
                placeholder="https://wa.me/..."
              />
            </label>

            <label className="field">
              <span className="field-label">Address</span>
              <input
                className="field-input"
                name="address"
                type="text"
                value={formValues.address}
                onChange={handleChange}
                placeholder="123 Main Street, Lagos, Nigeria"
              />
              {errors.address && <span className="field-error">{errors.address}</span>}
            </label>

            <label className="field">
              <span className="field-label">Password</span>
              <input
                className="field-input"
                name="password"
                type="password"
                value={formValues.password}
                onChange={handleChange}
                placeholder="Create a secure password"
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </label>

            <label className="field">
              <span className="field-label">Confirm Password</span>
              <input
                className="field-input"
                name="confirmPassword"
                type="password"
                value={formValues.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
            </label>

            <div className="working-hours-section">
              <h3 className="section-title">Working Hours</h3>
              <div className="working-hours-grid">
                {Object.entries(formValues.workingHours).map(([day, hours]) => (
                  <div key={day} className="working-hours-day">
                    <label className="field">
                      <div className="day-header">
                        <span className="field-label">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                        <div className="closed-checkbox">
                          <input
                            type="checkbox"
                            name={`${day}.closed`}
                            checked={hours.closed}
                            onChange={handleChange}
                          />
                          <label htmlFor={`${day}.closed`}>Closed</label>
                        </div>
                      </div>
                      <div className="time-inputs">
                        <select
                          name={`${day}.open`}
                          value={hours.open}
                          onChange={handleChange}
                          disabled={hours.closed}
                          className="field-input time-select"
                        >
                          <option value="">Open Time</option>
                          <option value="06:00">6:00 AM</option>
                          <option value="07:00">7:00 AM</option>
                          <option value="08:00">8:00 AM</option>
                          <option value="09:00">9:00 AM</option>
                          <option value="10:00">10:00 AM</option>
                          <option value="11:00">11:00 AM</option>
                          <option value="12:00">12:00 PM</option>
                          <option value="13:00">1:00 PM</option>
                          <option value="14:00">2:00 PM</option>
                          <option value="15:00">3:00 PM</option>
                          <option value="16:00">4:00 PM</option>
                          <option value="17:00">5:00 PM</option>
                          <option value="18:00">6:00 PM</option>
                          <option value="19:00">7:00 PM</option>
                          <option value="20:00">8:00 PM</option>
                          <option value="21:00">9:00 PM</option>
                          <option value="22:00">10:00 PM</option>
                        </select>
                        <span>-</span>
                        <select
                          name={`${day}.close`}
                          value={hours.close}
                          onChange={handleChange}
                          disabled={hours.closed}
                          className="field-input time-select"
                        >
                          <option value="">Close Time</option>
                          <option value="10:00">10:00 AM</option>
                          <option value="11:00">11:00 AM</option>
                          <option value="12:00">12:00 PM</option>
                          <option value="13:00">1:00 PM</option>
                          <option value="14:00">2:00 PM</option>
                          <option value="15:00">3:00 PM</option>
                          <option value="16:00">4:00 PM</option>
                          <option value="17:00">5:00 PM</option>
                          <option value="18:00">6:00 PM</option>
                          <option value="19:00">7:00 PM</option>
                          <option value="20:00">8:00 PM</option>
                          <option value="21:00">9:00 PM</option>
                          <option value="22:00">10:00 PM</option>
                          <option value="23:00">11:00 PM</option>
                          <option value="00:00">12:00 AM</option>
                          <option value="01:00">1:00 AM</option>
                          <option value="02:00">2:00 AM</option>
                        </select>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
              {saving ? 'Creating Profile...' : 'Create Vendor Profile'}
            </button>

            {savedMessage && <p className="field-help">{savedMessage}</p>}
          </form>
        </div>
      </div>
    </section>
  )
}

