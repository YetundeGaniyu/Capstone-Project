import { Link } from 'react-router-dom'

const MAX_DESC = 120

export function VendorCard({ vendor }) {
  const id = vendor.id
  const name = vendor.businessName || 'Unnamed business'
  const category = vendor.category || ''
  const description = vendor.description || ''
  const address = vendor.address || ''
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
        </div>
      </div>
      {truncated && <p className="vendor-list-card-desc">{truncated}</p>}
      {address && <p className="vendor-list-card-meta">{address}</p>}
    </Link>
  )
}
