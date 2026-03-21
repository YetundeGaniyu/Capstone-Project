import { useState, useEffect } from 'react'
import { providersAPI } from '../services/apiService'
import { VendorCard } from './VendorCard'

export function TopVendors() {
  const [topProviders, setTopProviders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTopProviders = async () => {
      try {
        const response = await providersAPI.getAll()
        
        // Filter and sort for top rated:
        // - Must have at least 1 review OR have rating >= 4
        // - Sort by highest rating first
        // - Show only top 6 on homepage
        const allVendors = response.data || []
        const validProviders = allVendors.filter(provider => provider && (provider.id || provider._id))
        
        // Try to find top rated providers first
        const topRated = validProviders
          .filter(provider => (provider.totalReviews > 0 || Number(provider.averageRating || 0) >= 4))
          .sort((a, b) => Number(b.averageRating || 0) - Number(a.averageRating || 0))
          .slice(0, 6)
        
        // If no providers meet the top criteria, just show first 6 valid ones sorted by rating
        const fallbackProviders = validProviders
          .sort((a, b) => Number(b.averageRating || 0) - Number(a.averageRating || 0))
          .slice(0, 6)
        
        setTopProviders(topRated.length > 0 ? topRated : fallbackProviders)
        
      } catch (error) {
        console.error('Failed to load top providers:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTopProviders()
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

  if (topProviders.length === 0) {
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
      <div className="top-vendors-grid">
        {topProviders
          .filter(provider => provider && (provider.id || provider._id))
          .map((provider) => (
          <VendorCard key={provider.id || provider._id} provider={provider} />
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
