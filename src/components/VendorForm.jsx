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
    setFormValues((prev) => {
      if (name === 'workingHours') {
        return {
          ...prev,
          workingHours: JSON.parse(value)
        }
      }
      if (name.includes('.')) {
        const [field, subField] = name.split('.')
        return {
          ...prev,
          [field]: {
            ...prev[field],
            [subField]: type === 'checkbox' ? checked : value
          }
        }
      }
      return {
        ...prev,
        [name]: value
      }
    })
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleWorkingHoursChange = (event) => {
    const workingHours = JSON.parse(event.target.value)
    setFormValues(prev => ({
      ...prev,
      workingHours
    }))
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
    <section className="page page-vendor-create">
      <div className="page-width">
        <div className="card">
          <h1 className="page-title">Create Business Profile</h1>
          <p className="page-subtitle">
            Tell us about your business to get started.
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
                placeholder="Describe what services you offer...."
              />
              {errors.description && <span className="field-error">{errors.description}</span>}
            </label>

            <label className="field">
              <span className="field-label">Phone Number (Preferrably WhatsApp Number)</span>
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
              <label className="field">
                <span className="field-label">Working Hours</span>
                <select
                  name="workingHours"
                  value={JSON.stringify(formValues.workingHours)}
                  onChange={handleWorkingHoursChange}
                  className="field-input time-select"
                >
                  <option value="">Select Working Hours</option>
                  <option value='{"monday":{"open":"09:00","close":"17:00","closed":false},"tuesday":{"open":"09:00","close":"17:00","closed":false},"wednesday":{"open":"09:00","close":"17:00","closed":false},"thursday":{"open":"09:00","close":"17:00","closed":false},"friday":{"open":"09:00","close":"17:00","closed":false},"saturday":{"open":"10:00","close":"14:00","closed":false},"sunday":{"open":"10:00","close":"14:00","closed":false}}'>
                    Monday - Friday: 9AM-5PM, Saturday - Sunday: 10AM-2PM
                  </option>
                  <option value='{"monday":{"open":"08:00","close":"18:00","closed":false},"tuesday":{"open":"08:00","close":"18:00","closed":false},"wednesday":{"open":"08:00","close":"18:00","closed":false},"thursday":{"open":"08:00","close":"18:00","closed":false},"friday":{"open":"08:00","close":"18:00","closed":false},"saturday":{"open":"09:00","close":"16:00","closed":false},"sunday":{"open":"09:00","close":"16:00","closed":false}}'>
                    Monday - Friday: 8AM-6PM, Saturday - Sunday: 9AM-4PM
                  </option>
                  <option value='{"monday":{"open":"07:00","close":"19:00","closed":false},"tuesday":{"open":"07:00","close":"19:00","closed":false},"wednesday":{"open":"07:00","close":"19:00","closed":false},"thursday":{"open":"07:00","close":"19:00","closed":false},"friday":{"open":"07:00","close":"19:00","closed":false},"saturday":{"open":"08:00","close":"17:00","closed":false},"sunday":{"open":"08:00","close":"17:00","closed":false}}'>
                    Monday - Friday: 7AM-7PM, Saturday - Sunday: 8AM-5PM
                  </option>
                  <option value='{"monday":{"open":"06:00","close":"22:00","closed":false},"tuesday":{"open":"06:00","close":"22:00","closed":false},"wednesday":{"open":"06:00","close":"22:00","closed":false},"thursday":{"open":"06:00","close":"22:00","closed":false},"friday":{"open":"06:00","close":"22:00","closed":false},"saturday":{"open":"07:00","close":"21:00","closed":false},"sunday":{"open":"07:00","close":"21:00","closed":false}}'>
                    Monday - Friday: 6AM-10PM, Saturday - Sunday: 7AM-9PM
                  </option>
                  <option value='{"monday":{"open":"09:00","close":"17:00","closed":false},"tuesday":{"open":"09:00","close":"17:00","closed":false},"wednesday":{"open":"09:00","close":"17:00","closed":false},"thursday":{"open":"09:00","close":"17:00","closed":false},"friday":{"open":"09:00","close":"17:00","closed":false},"saturday":{"closed":true},"sunday":{"closed":true}}'>
                    Monday - Friday: 9AM-5PM, Saturday - Sunday: Closed
                  </option>
                  <option value='{"monday":{"closed":true},"tuesday":{"closed":true},"wednesday":{"closed":true},"thursday":{"closed":true},"friday":{"closed":true},"saturday":{"closed":true},"sunday":{"closed":true}}'>
                    Closed All Days
                  </option>
                </select>
              </label>
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

