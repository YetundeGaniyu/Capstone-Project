const CATEGORIES = [
  '',
  'Fashion & tailoring',
  'Catering & events',
  'Repairs & maintenance',
  'Branding & design',
  'Photography & media',
  'Other',
]

export function FilterBar({ category, onCategoryChange, keyword, onKeywordChange }) {
  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label className="filter-label" htmlFor="filter-category">
          Category
        </label>
        <select
          id="filter-category"
          className="field-input filter-select"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="">All categories</option>
          {CATEGORIES.filter(Boolean).map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <label className="filter-label" htmlFor="filter-keyword">
          Search
        </label>
        <input
          id="filter-keyword"
          type="search"
          className="field-input filter-input"
          placeholder="Business name, description..."
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
        />
      </div>
    </div>
  )
}
