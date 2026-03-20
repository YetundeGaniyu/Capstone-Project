import { useState, useEffect } from 'react'
import { providersAPI } from '../services/apiService'

export function TopVendors() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTopVendors = async () => {
      try {
        const response = await providersAPI.getAll()
        const allVendors = response.data || []
        const topVendors = allVendors
          .filter(vendor => vendor.rating && vendor.rating > 0)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 6)
        
        setVendors(topVendors)
      } catch (error) {
        console.error('Error fetching top vendors:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTopVendors()
  }, [])

  if (loading) {
    return (
      <section className="section">
        <h2 className="section-title">Top Rated Vendors</h2>
        <div className="vendor-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="vendor-card skeleton">
              <div className="skeleton-line"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line"></div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (vendors.length === 0) {
    return (
      <section className="section">
        <h2 className="section-title">Top Rated Vendors</h2>
        <p className="text-center">No vendors available yet.</p>
      </section>
    )
  }

  return (
    <section className="section">
      <h2 className="section-title">Top Rated Vendors</h2>
      <div className="vendor-grid">
        {vendors.map((vendor) => (
          <a 
            key={vendor.id} 
            href={`/vendors/${vendor.id}`}
            className="vendor-card-link"
          >
            <div className="vendor-card">
              <div className="vendor-card-header">
                <h3 className="vendor-name">{vendor.businessName}</h3>
                <div className="vendor-rating">
                  <span className="rating-stars">
                    {'★'.repeat(Math.floor(vendor.rating))}
                    {'☆'.repeat(5 - Math.floor(vendor.rating))}
                  </span>
                  <span className="rating-number">{vendor.rating.toFixed(1)}</span>
                </div>
              </div>
              <div className="vendor-location">
                📍 {vendor.address || 'Location not specified'}
              </div>
              <div className="vendor-category">
                {vendor.category || 'General Services'}
              </div>
              {vendor.description && (
                <div className="vendor-description">
                  {vendor.description.substring(0, 100)}...
                </div>
              )}
            </div>
          </a>
        ))}
      </div>
      <div className="section-footer">
        <a href="/vendors" className="btn btn-outline">
          View All Vendors
        </a>
      </div>
    </section>
  )
}
