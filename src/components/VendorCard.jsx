import { Link } from 'react-router-dom'

const MAX_DESC = 120

export function VendorCard({ provider }) {
  if (!provider) return null

  // Defensive field extraction with defaults
  const id = provider.id || provider._id || ''
  const name = provider.businessName || provider.name || 'Unknown'
  const category = provider.category || 'General'
  const description = provider.description || ''
  const address = provider.address || 'Location not specified'
  const rating = Number(provider.averageRating || 0)
  const totalReviews = Number(provider.totalReviews || 0)
  const truncated =
    description.length > MAX_DESC ? description.slice(0, MAX_DESC).trim() + '…' : description

  return (
    <Link to={`/vendors/${id}`} className="vendor-list-card">
      <div className="vendor-list-card-header">
        <div className="vendor-list-card-avatar">
          {name
            .split(/\s+/)
            .map((w) => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()}
        </div>
        <div className="vendor-list-card-title-wrap">
          <h3 className="vendor-list-card-title">{name}</h3>
          {category && <span className="vendor-list-card-category">{category}</span>}
          {rating > 0 && (
            <div className="vendor-list-card-rating">
              <span className="rating-stars">
                {'★'.repeat(Math.floor(rating))}
                {'☆'.repeat(5 - Math.floor(rating))}
              </span>
              <span className="rating-number">{rating.toFixed(1)}</span>
              <span className="rating-count">({totalReviews})</span>
            </div>
          )}
        </div>
      </div>
      {truncated && <p className="vendor-list-card-desc">{truncated}</p>}
      {address && <p className="vendor-list-card-meta">{address}</p>}
    </Link>
  )
}
