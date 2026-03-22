import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { providersAPI } from '../services/apiService'

const VendorProfilePage = () => {
  const [vendor, setVendor] = useState(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({})
  const [successMsg, setSuccessMsg] = useState('')
  const navigate = useNavigate()
  const authToken = localStorage.getItem('authToken')

  useEffect(() => {
    const vendorData = JSON.parse(
      localStorage.getItem('vendorData') || '{}'
    )
    if (vendorData && (vendorData.id || vendorData._id)) {
      setVendor(vendorData)
      setFormData(vendorData)
      setLoading(false)
    } else {
      navigate('/vendor/login')
    }
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const vendorId = vendor.id || vendor._id
      const response = await providersAPI.update(
        vendorId, formData, authToken
      )
      if (response.success) {
        setVendor(response.data)
        localStorage.setItem('vendorData', JSON.stringify(response.data))
        setEditing(false)
        setSuccessMsg('Profile updated successfully!')
        setTimeout(() => setSuccessMsg(''), 3000)
      }
    } catch (error) {
      alert('Failed to update: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px' }}>
      Loading profile...
    </div>
  )

  const fields = [
    { label: 'Business Name', field: 'businessName' },
    { label: 'Category', field: 'category' },
    { label: 'Description', field: 'description' },
    { label: 'Phone Number', field: 'phoneNumber' },
    { label: 'WhatsApp', field: 'whatsappNumber' },
    { label: 'Address', field: 'address' },
  ]

  return (
    <div style={{ 
      maxWidth: '800px', margin: '40px auto', padding: '0 16px' 
    }}>
      <div style={{
        background: 'white', borderRadius: '16px',
        padding: '32px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
      }}>
        
        {/* Header */}
        <div style={{ 
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '24px'
        }}>
          <h2 style={{ margin: 0 }}>My Business Profile</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {editing && (
              <button onClick={() => setEditing(false)} style={{
                padding: '10px 20px', background: '#f3f4f6',
                border: 'none', borderRadius: '8px', cursor: 'pointer'
              }}>
                Cancel
              </button>
            )}
            <button
              onClick={() => editing ? handleSave() : setEditing(true)}
              disabled={saving}
              style={{
                padding: '10px 20px', background: '#f59e0b',
                color: 'white', border: 'none',
                borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
              }}
            >
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Success message */}
        {successMsg && (
          <div style={{
            background: '#d1fae5', color: '#065f46',
            padding: '12px', borderRadius: '8px', marginBottom: '16px'
          }}>
            ✅ {successMsg}
          </div>
        )}

        {/* Profile Fields */}
        {fields.map(({ label, field }) => (
          <div key={field} style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', fontWeight: '600', 
              marginBottom: '6px', color: '#374151'
            }}>
              {label}
            </label>
            {editing ? (
              <input
                type="text"
                value={formData[field] || ''}
                onChange={(e) => setFormData({
                  ...formData, [field]: e.target.value
                })}
                style={{
                  width: '100%', padding: '10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px', fontSize: '14px'
                }}
              />
            ) : (
              <p style={{ 
                color: '#6b7280', padding: '10px 0', margin: 0,
                borderBottom: '1px solid #f3f4f6'
              }}>
                {vendor[field] || 'Not provided'}
              </p>
            )}
          </div>
        ))}

        {/* Logout */}
        <button
          onClick={() => {
            localStorage.removeItem('authToken')
            localStorage.removeItem('vendorData')
            localStorage.removeItem('otpVerified')
            navigate('/vendor/login')
          }}
          style={{
            padding: '10px 20px', background: '#fee2e2',
            color: '#dc2626', border: 'none',
            borderRadius: '8px', cursor: 'pointer', marginTop: '16px'
          }}
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default VendorProfilePage
