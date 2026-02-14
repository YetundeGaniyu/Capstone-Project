import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = [
  'Fashion & tailoring',
  'Catering & events',
  'Repairs & maintenance',
  'Branding & design',
  'Photography & media',
  'Other',
]

export function VendorForm() {
  const { currentUser } = useAuth()
  const location = useLocation()
  const prefilled = location.state?.prefilled

  const [formValues, setFormValues] = useState({
    businessName: '',
    category: '',
    description: '',
    phone: '',
    whatsapp: '',
    address: '',
    latitude: '',
    longitude: '',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')

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

  if (!currentUser) {
    // Safety guard; route should already be protected
    return null
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
    setSavedMessage('')
  }

  const validate = () => {
    const newErrors = {}
    if (!formValues.businessName.trim()) newErrors.businessName = 'Business name is required'
    if (!formValues.category) newErrors.category = 'Category is required'
    if (!formValues.description.trim()) newErrors.description = 'Description is required'
    if (!formValues.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formValues.address.trim()) newErrors.address = 'Address is required'
    return newErrors
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
      const vendorRef = doc(db, 'vendors', currentUser.uid)
      const lat = Number(formValues.latitude)
        const lng = Number(formValues.longitude)
        const payload = {
          userId: currentUser.uid,
          businessName: formValues.businessName.trim(),
          category: formValues.category,
          description: formValues.description.trim(),
          phone: formValues.phone.trim(),
          whatsapp: formValues.whatsapp.trim(),
          address: formValues.address.trim(),
          updatedAt: new Date().toISOString(),
        }
        if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
          payload.latitude = lat
          payload.longitude = lng
        }
        await setDoc(vendorRef, payload, { merge: true })

      setSavedMessage('Your vendor profile has been saved.')
    } catch (error) {
      console.error('Error saving vendor profile:', error)
      setSavedMessage('Something went wrong while saving. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page page-vendor-form">
      <div className="page-width">
        <div className="card auth-card">
          <h1 className="page-title">Vendor profile</h1>
          <p className="page-subtitle">
            Share basic details about your business so customers can discover and contact you.
          </p>

          <form className="form" onSubmit={handleSubmit} noValidate>
            <label className="field">
              <span className="field-label">Business name</span>
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
              <span className="field-label">Category</span>
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
              <span className="field-label">Phone number</span>
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
              <span className="field-label">WhatsApp link (optional)</span>
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
                placeholder="Lagos, Nigeria"
              />
              {errors.address && <span className="field-error">{errors.address}</span>}
            </label>

            <div className="field-row">
              <label className="field">
                <span className="field-label">Latitude (optional)</span>
                <input
                  className="field-input"
                  name="latitude"
                  type="number"
                  step="any"
                  value={formValues.latitude}
                  onChange={handleChange}
                  placeholder="6.5244"
                />
              </label>
              <label className="field">
                <span className="field-label">Longitude (optional)</span>
                <input
                  className="field-input"
                  name="longitude"
                  type="number"
                  step="any"
                  value={formValues.longitude}
                  onChange={handleChange}
                  placeholder="3.3792"
                />
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
              {saving ? 'Saving profile...' : 'Save profile'}
            </button>

            {savedMessage && <p className="field-help">{savedMessage}</p>}
          </form>
        </div>
      </div>
    </section>
  )
}

