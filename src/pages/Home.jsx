import { AIChatBox } from '../components/AIChatBox'
import { TopVendors } from '../components/TopVendors'

export function Home() {
  return (
    <section className="page page-home">
      <div className="page-width">
        <div className="hero">
          <div className="hero-text">
            <h1 className="hero-title">Find Trusted Service Providers</h1>
            <p className="hero-subtitle">
            Here, we help small and medium-sized businesses gain visibility and access to customers who require their services.
            Whether you're a plumber, electrician, or any other service provider, Ask Yellow can help you find the right customers for your business.
            </p>
            <div className="hero-actions">
              <a href="/vendors" className="btn btn-primary">
                Take a Tour
              </a>
              <a href="/login/vendor" className="btn btn-ghost">
                Login as Vendor
              </a>
            </div>
          </div>
        </div>

        <section className="section">
          <h2 className="section-title">Why Ask Yello!</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3 className="feature-title">Verified Vendors</h3>
              <p className="feature-body">
                Access verified vendor profiles with clear service details,
                location information, and sample work so you can choose with confidence
              </p>
            </div>
            <div className="feature-card">
              <h3 className="feature-title">Simple Vendor Overview</h3>
              <p className="feature-body">
                A simple dashboard that highlights key vendors at a glance, 
                without complex or overwhelming navigation.
              </p>
            </div>
            <div className="feature-card">
              <h3 className="feature-title">Built for SMEs</h3>
              <p className="feature-body">
              Designed for  small and medium business owners seeking greater visibility,
              expand their reach and have meaningful connections with more customers </p>
            </div>
          </div>
        </section>
        
        <TopVendors />
      </div>
      
      <AIChatBox />
    </section>
  )
}

