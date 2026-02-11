export function Home() {
  return (
    <section className="page page-home">
      <div className="page-width">
        <div className="hero">
          <div className="hero-text">
            <h1 className="hero-title">Find Trusted Service Providers</h1>
            <p className="hero-subtitle">
              SMEsConnect helps small and medium-sized businesses gain visibility and access to customers who require their services.
              Whether you're a plumber, electrician, or any other service provider, SMEsConnect can help you find the right customers for your business.
            </p>
            <div className="hero-actions">
              <a href="/dashboard" className="btn btn-primary">
                Explore dashboard
              </a>
              <a href="/login" className="btn btn-ghost">
                Login as Vendor
              </a>
            </div>
          </div>
        </div>

        <section className="section">
          <h2 className="section-title">Why SMEs Connect?</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3 className="feature-title">Verified Vendors</h3>
              <p className="feature-body">
                View profiles with services, location, and sample work so you can make confident decisions.
              </p>
            </div>
            <div className="feature-card">
              <h3 className="feature-title">Simple vendor overview</h3>
              <p className="feature-body">
                A minimal dashboard to see key vendors at a glance without overwhelming data.
              </p>
            </div>
            <div className="feature-card">
              <h3 className="feature-title">Built for SMEs</h3>
              <p className="feature-body">
                Designed for business owners who need visibility, boost their business growth and reach more customers.
              </p>
            </div>
          </div>
        </section>
      </div>
    </section>
  )
}

