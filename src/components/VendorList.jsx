import { useState, useEffect } from 'react'
import { providersAPI, searchAPI } from '../services/apiService'
import { FilterBar } from './FilterBar.jsx'
import { VendorCard } from './VendorCard.jsx'

export function VendorList() {
  const [allProviders, setAllProviders] = useState([])
  const [filteredProviders, setFilteredProviders] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All categories')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [hasSearched, setHasSearched] = useState(false)

  // Load all providers once
  useEffect(() => {
    const loadAll = async () => {
      try {
        const response = await providersAPI.getAll()
        const data = response.data.filter(p => p && (p.id || p._id))
        setAllProviders(data)
        setFilteredProviders(data)  // show all by default
        console.log('📥 Loaded all providers:', data.length)
      } catch (error) {
        console.error('Failed to load providers:', error)
      } finally {
        setLoading(false)
      }
    }
    loadAll()
  }, [])

  // Load categories for dropdown
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await searchAPI.getCategories()
        setCategories(response.data || [])
        console.log('📂 Loaded categories:', response.data)
      } catch (error) {
        console.error('Failed to load categories:', error)
        // Fallback categories
        setCategories([
          { id: 1, name: 'Cleaning' },
          { id: 2, name: 'Catering' },
          { id: 3, name: 'Plumbing' },
          { id: 4, name: 'Electrical' },
          { id: 5, name: 'Beauty' },
          { id: 6, name: 'Transport' },
          { id: 7, name: 'Security' },
          { id: 8, name: 'Photography' },
          { id: 9, name: 'Events' },
          { id: 10, name: 'Other' }
        ])
      }
    }
    loadCategories()
  }, [])

  // Filter locally whenever search term or category changes
  useEffect(() => {
    let results = [...allProviders]

    // Filter by search term (2+ characters)
    if (searchTerm.length >= 2) {
      const term = searchTerm.toLowerCase()
      results = results.filter(p =>
        p.businessName?.toLowerCase().includes(term) ||
        p.name?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        p.address?.toLowerCase().includes(term)
      )
      console.log(`🔍 Filtered by "${searchTerm}": ${results.length} results`)
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== 'All categories') {
      results = results.filter(p =>
        p.category?.toLowerCase() === selectedCategory.toLowerCase()
      )
      console.log(`🏷️ Filtered by category "${selectedCategory}": ${results.length} results`)
    }

    setFilteredProviders(results)
  }, [searchTerm, selectedCategory, allProviders])

  // Handle keyword change
  const handleKeywordChange = (newKeyword) => {
    setSearchTerm(newKeyword)
    if (newKeyword.length >= 2) setHasSearched(true)
    if (newKeyword.length === 0) setHasSearched(false)
  }

  // Handle category change
  const handleCategoryChange = (newCategory) => {
    setSelectedCategory(newCategory)
    if (newCategory !== 'All categories') setHasSearched(true)
    else if (searchTerm.length < 2) setHasSearched(false)
  }

  return (
    <section className="page page-vendor-list">
      <div className="page-width">
        <header className="page-header">
          <h1 className="page-title">Search for vendors</h1>
          <p className="page-subtitle">
            Find service providers by category or search by name, description, or location.
          </p>
        </header>

        <FilterBar
          category={selectedCategory}
          onCategoryChange={handleCategoryChange}
          keyword={searchTerm}
          onKeywordChange={handleKeywordChange}
        />

        {!hasSearched ? (
          <p style={{ textAlign: 'center', color: '#888', marginTop: '40px' }}>
            🔍 Start typing to search for vendors by name, 
            service type, or location
          </p>
        ) : loading ? (
          <div className="loading-container">
            <div className="loading-spinner">Searching...</div>
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="vendor-list-empty">
            <p>No vendors found{searchTerm ? ` for "${searchTerm}"` : ''}. Try a different search.</p>
          </div>
        ) : (
          <div className="vendor-list-grid" style={{ width: '100%', margin: '0 auto' }}>
            {filteredProviders.map(provider => (
              <VendorCard
                key={provider.id || provider._id}
                provider={provider}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
