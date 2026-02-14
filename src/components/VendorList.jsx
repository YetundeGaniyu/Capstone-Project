import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../services/firebase'
import { FilterBar } from './FilterBar.jsx'
import { VendorCard } from './VendorCard.jsx'

// Weights for ranking: rating 50%, keyword match 30%, recency 20%
const RATING_WEIGHT = 0.5
const KEYWORD_MATCH_WEIGHT = 0.3
const RECENCY_WEIGHT = 0.2

/** Rating: use vendor.ratingAverage (0–1 or 0–5 scale) if present, else neutral 0.5 */
function getRatingScore(vendor) {
  const r = vendor.ratingAverage
  if (typeof r !== 'number' || r < 0) return 0.5
  if (r <= 1) return r
  if (r <= 5) return r / 5
  return 0.5
}

/** Keyword match: 0–1 from name/description/address (weighted). No keyword => 1. */
function getKeywordMatchScore(vendor, keyword) {
  const k = keyword.trim().toLowerCase()
  if (!k) return 1
  const name = (vendor.businessName || '').toLowerCase()
  const desc = (vendor.description || '').toLowerCase()
  const addr = (vendor.address || '').toLowerCase()
  let score = 0
  if (name.includes(k)) score += 0.5
  if (desc.includes(k)) score += 0.3
  if (addr.includes(k)) score += 0.2
  return Math.min(1, score)
}

/** Recency: 1 for recent, decay over 180 days from updatedAt */
function getRecencyScore(vendor) {
  const raw = vendor.updatedAt
  if (!raw) return 0.5
  const updated = new Date(raw).getTime()
  const now = Date.now()
  const maxAgeMs = 180 * 24 * 60 * 60 * 1000
  const age = now - updated
  if (age <= 0) return 1
  return Math.max(0, 1 - age / maxAgeMs)
}

/** Combined ranking score (0–1). Higher = better. */
function getRankingScore(vendor, keyword) {
  const ratingAverage = getRatingScore(vendor)
  const keywordMatchScore = getKeywordMatchScore(vendor, keyword)
  const recencyScore = getRecencyScore(vendor)
  return (
    RATING_WEIGHT * ratingAverage +
    KEYWORD_MATCH_WEIGHT * keywordMatchScore +
    RECENCY_WEIGHT * recencyScore
  )
}

/** Sort vendors by ranking score descending */
function rankVendors(vendors, keyword) {
  return [...vendors].sort((a, b) => {
    const scoreA = getRankingScore(a, keyword)
    const scoreB = getRankingScore(b, keyword)
    return scoreB - scoreA
  })
}

function filterVendors(vendors, category, keyword) {
  let list = [...vendors]
  if (category) {
    list = list.filter((v) => v.category === category)
  }
  if (keyword.trim()) {
    const k = keyword.trim().toLowerCase()
    list = list.filter((v) => {
      const name = (v.businessName || '').toLowerCase()
      const desc = (v.description || '').toLowerCase()
      const addr = (v.address || '').toLowerCase()
      return name.includes(k) || desc.includes(k) || addr.includes(k)
    })
  }
  return list
}

export function VendorList() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const snap = await getDocs(collection(db, 'vendors'))
        if (cancelled) return
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((v) => !v.blacklisted)
        setVendors(list)
      } catch (err) {
        if (!cancelled) console.error('Error loading vendors:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const filtered = filterVendors(vendors, category, keyword)
  const ranked = rankVendors(filtered, keyword)

  return (
    <section className="page page-vendor-list">
      <div className="page-width">
        <header className="page-header">
          <h1 className="page-title">Browse vendors</h1>
          <p className="page-subtitle">
            Find service providers by category or search by name, description, or location.
          </p>
        </header>

        <FilterBar
          category={category}
          onCategoryChange={setCategory}
          keyword={keyword}
          onKeywordChange={setKeyword}
        />

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner">Loading vendors…</div>
          </div>
        ) : ranked.length === 0 ? (
          <div className="vendor-list-empty">
            <p>No vendors match your filters.</p>
          </div>
        ) : (
          <div className="vendor-list-grid">
            {ranked.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
