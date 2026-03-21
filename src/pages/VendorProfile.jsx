import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { providersAPI } from '../services/apiService'
import { VendorMap } from '../components/VendorMap.jsx'
import { useAuth } from '../context/AuthContext'

export function VendorProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser, userRole } = useAuth()
  const [vendor, setVendor] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🔍 Loading vendor profile for ID:', id)
        
        // Strategy 1: Try direct API call first
        try {
          const vendorResponse = await providersAPI.getById(id)
          console.log('Vendor data (direct):', vendorResponse)
          
          if (vendorResponse.success && vendorResponse.data) {
            setVendor(vendorResponse.data)
          } else {
            throw new Error('Vendor not found in direct call')
          }
        } catch {
          // Strategy 2: Fallback — get all providers and find by id
          console.log('Direct fetch failed, searching from list...')
          const allResponse = await providersAPI.getAll()
          console.log('All providers loaded:', allResponse.data?.length, 'providers')
          
          const found = allResponse.data.find(p => 
            (p.id === id || p._id === id)
          )
          
          if (found) {
            console.log('Found vendor in list:', found)
            setVendor(found)
          } else {
            console.log('Vendor not found in list either')
            setError('Vendor not found')
          }
        }

        // Try to load reviews (optional — don't crash if fails)
        try {
          const reviewsResponse = await providersAPI.getReviews(id)
          if (reviewsResponse.success) {
            setReviews(reviewsResponse.data)
            console.log('Reviews loaded:', reviewsResponse.data?.length)
          }
        } catch {
          console.log('Reviews not available yet')
          setReviews([])
        }

      } catch (error) {
        console.error('Failed to load vendor:', error)
        setError('Failed to load vendor profile')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchVendorData()
    } else {
      setError('No vendor ID provided')
      setLoading(false)
    }
  }, [id])

  if (loading) {
    return (
      <div style={{textAlign:'center', padding:'60px'}}>
        <p>Loading vendor profile...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{textAlign:'center', padding:'60px'}}>
        <p>{error}</p>
        <button onClick={() => navigate('/vendors')} className="btn btn-primary">
          Back to Vendors
        </button>
      </div>
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

  // Handle all data fields safely since they may differ from mock
  const vendorId = vendor?.id || vendor?._id
  const vendorName = vendor?.businessName || vendor?.name || 'Unnamed business'
  const vendorCategory = vendor?.category
  const vendorRating = Number(vendor?.averageRating || 0).toFixed(1)
  const vendorReviews = vendor?.totalReviews || 0
  const vendorDescription = vendor?.description
  const vendorAddress = vendor?.address
  const vendorPhone = vendor?.phoneNumber || vendor?.phone
  const vendorWhatsapp = vendor?.whatsappNumber || vendor?.whatsapp
  const vendorHours = vendor?.workingHours
  const vendorImages = vendor?.images || []
  
  // Map coordinates
  const lat = parseFloat(vendor?.latitude || 0)
  const lng = parseFloat(vendor?.longitude || 0)

  const initials = vendorName.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
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
            <h1 className="page-title">{vendorName}</h1>
            {isVendorOwner && (
              <button onClick={handleEditProfile} className="btn btn-outline btn-sm">
                Edit Profile
              </button>
            )}
          </div>
          <p className="page-subtitle">
            {[vendorCategory, vendorAddress].filter(Boolean).join(' • ') || 'Vendor details'}
          </p>
        </header>

        <div className="card vendor-card">
          <div className="vendor-header">
            <div className="vendor-avatar">{initials}</div>
            <div>
              <h2 className="vendor-name">{vendorName}</h2>
              <p className="vendor-meta">
                {[vendorCategory, vendorAddress].filter(Boolean).join(' • ')}
              </p>
              {vendorRating > 0 && (
                <div className="vendor-rating">
                  <span className="rating-stars">
                    {'★'.repeat(Math.floor(vendorRating))}
                    {'☆'.repeat(5 - Math.floor(vendorRating))}
                  </span>
                  <span className="rating-number">{vendorRating}</span>
                  {vendorReviews > 0 && (
                    <span className="rating-count">({vendorReviews} reviews)</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="vendor-body">
            {vendorDescription && (
              <>
                <h3 className="section-subtitle">Overview</h3>
                <p>{vendorDescription}</p>
              </>
            )}

            {(vendorPhone || vendorWhatsapp) && (
              <>
                <h3 className="section-subtitle">Contact</h3>
                <div className="contact-actions">
                  {vendorPhone && (
                    <button 
                      onClick={() => handleCallClick(vendorPhone)}
                      className="btn btn-primary contact-btn"
                    >
                      📞 Call {vendorPhone}
                    </button>
                  )}
                  {vendorWhatsapp && (
                    <button 
                      onClick={() => handleWhatsAppClick(vendorWhatsapp)}
                      className="btn btn-success contact-btn"
                    >
                      💬 WhatsApp
                    </button>
                  )}
                </div>
                <ul className="simple-list">
                  {vendorPhone && <li>Phone: {vendorPhone}</li>}
                  {vendorWhatsapp && <li>WhatsApp: {vendorWhatsapp}</li>}
                </ul>
              </>
            )}

            {vendorAddress && (
              <>
                <h3 className="section-subtitle">Location</h3>
                <p>{vendorAddress}</p>
                
                {/* Google Maps or OpenStreetMap Location */}
                <div style={{ 
                  width: '100%', 
                  height: '250px', 
                  borderRadius: '12px', 
                  overflow: 'hidden',
                  marginTop: '12px'
                }}>
                  {lat && lng ? (
                    // OpenStreetMap with coordinates (no API key needed)
                    <iframe
                      width="100%"
                      height="250"
                      style={{ border: 0, borderRadius: '12px', marginTop: '12px' }}
                      loading="lazy"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${(lng - 0.01).toFixed(6)},${(lat - 0.01).toFixed(6)},${(lng + 0.01).toFixed(6)},${(lat + 0.01).toFixed(6)}&layer=mapnik&marker=${lat.toFixed(6)},${lng.toFixed(6)}`}
                    />
                  ) : vendorAddress ? (
                    <iframe
                      width="100%"
                      height="250"
                      style={{ border: 0, borderRadius: '12px', marginTop: '12px' }}
                      loading="lazy"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=3.0,6.0,4.0,7.0&layer=mapnik&marker=${encodeURIComponent(vendorAddress)}`}
                    />
                  ) : null}
                </div>
                
                {/* Open in Google Maps button */}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vendorAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    marginTop: '8px',
                    color: '#f59e0b',
                    textDecoration: 'none',
                    fontWeight: '500'
                  }}
                >
                  📍 Open in Google Maps →
                </a>
              </>
            )}

            {reviews.length > 0 && (
              <>
                <h3 className="section-subtitle">Reviews ({reviews.length})</h3>
                <div className="reviews-list">
                  {reviews.map(review => (
                    <div key={review.id} className="review-card">
                      <div className="review-header">
                        <span className="review-author">{review.author}</span>
                        <span className="review-rating">
                          {'★'.repeat(review.rating)}
                          {'☆'.repeat(5 - review.rating)}
                        </span>
                      </div>
                      <p className="review-text">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
