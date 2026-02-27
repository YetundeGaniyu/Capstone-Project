import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { VendorMap } from '../components/VendorMap.jsx'
import { useAuth } from '../context/AuthContext'

export function VendorProfile() {
  const { id } = useParams()
  const { currentUser, userRole } = useAuth()
  const [vendor, setVendor] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    let cancelled = false
    async function load() {
      try {
        const snap = await getDoc(doc(db, 'vendors', id))
        if (cancelled) return
        setVendor(snap.exists() ? { id: snap.id, ...snap.data() } : null)
      } catch (err) {
        if (!cancelled) console.error('Error loading vendor:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [id])

  if (loading) {
    return (
      <section className="page page-vendor-profile">
        <div className="page-width">
          <div className="loading-container">
            <div className="loading-spinner">Loading profile…</div>
          </div>
        </div>
      </section>
    )
  }

  if (!vendor) {
    return (
      <section className="page page-vendor-profile">
        <div className="page-width">
          <div className="vendor-profile-empty">
            <p>Vendor not found.</p>
            <Link to="/vendors" className="btn btn-primary">Browse vendors</Link>
          </div>
        </div>
      </section>
    )
  }

  const name = vendor.businessName || 'Unnamed business'
  const initials = name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  const hasMap = typeof vendor.latitude === 'number' && typeof vendor.longitude === 'number'
  const isVendorOwner = currentUser && userRole === 'vendor' && vendor.userId === currentUser.uid

  const handleCallClick = (phoneNumber) => {
    window.location.href = `tel:${phoneNumber}`
  }

  const handleWhatsAppClick = (whatsappNumber) => {
    const cleanNumber = whatsappNumber.replace(/[^\d]/g, '')
    window.open(`https://wa.me/${cleanNumber}`, '_blank')
  }

  const handleEditProfile = () => {
    navigate('/vendor/profile', { state: { editMode: true, vendorData: vendor } })
  }

  return (
    <section className="page page-vendor-profile">
      <div className="page-width">
        <header className="page-header">
          <Link to="/vendors" className="back-link">← Vendors</Link>
          <div className="page-header-actions">
            <h1 className="page-title">{name}</h1>
            {isVendorOwner && (
              <button onClick={handleEditProfile} className="btn btn-outline btn-sm">
                Edit Profile
              </button>
            )}
          </div>
          <p className="page-subtitle">
            {[vendor.category, vendor.address].filter(Boolean).join(' • ') || 'Vendor details'}
          </p>
        </header>

        <div className="card vendor-card">
          <div className="vendor-header">
            <div className="vendor-avatar">{initials}</div>
            <div>
              <h2 className="vendor-name">{name}</h2>
              <p className="vendor-meta">
                {[vendor.category, vendor.address].filter(Boolean).join(' • ')}
              </p>
            </div>
          </div>

          <div className="vendor-body">
            {vendor.description && (
              <>
                <h3 className="section-subtitle">Overview</h3>
                <p>{vendor.description}</p>
              </>
            )}

            {(vendor.phone || vendor.whatsapp) && (
              <>
                <h3 className="section-subtitle">Contact</h3>
                <div className="contact-actions">
                  {vendor.phone && (
                    <button 
                      onClick={() => handleCallClick(vendor.phone)}
                      className="btn btn-primary contact-btn"
                    >
                      📞 Call {vendor.phone}
                    </button>
                  )}
                  {vendor.whatsapp && (
                    <button 
                      onClick={() => handleWhatsAppClick(vendor.whatsapp)}
                      className="btn btn-success contact-btn"
                    >
                      💬 WhatsApp
                    </button>
                  )}
                </div>
                <ul className="simple-list">
                  {vendor.phone && <li>Phone: {vendor.phone}</li>}
                  {vendor.whatsapp && <li>WhatsApp: {vendor.whatsapp}</li>}
                </ul>
              </>
            )}

            {hasMap && (
              <>
                <h3 className="section-subtitle">Location</h3>
                <VendorMap
                  latitude={vendor.latitude}
                  longitude={vendor.longitude}
                  title={name}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
