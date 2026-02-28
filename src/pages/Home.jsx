import { AIChatBox } from "../components/AIChatBox";
import { TopVendors } from "../components/TopVendors";

export function Home() {
  return (
    <section className="page page-home">
      <div className="page-width">
        <div className="hero">
          <div className="hero-text">
            <h1 className="hero-title">Find Trusted Service Providers</h1>
            <p className="hero-subtitle">
              Ask Yello is a trusted platform designed to help small and
              medium-sized businesses expand their reach and connect with
              qualified customers.
              From plumbers and electricians to specialized service providers,
              we deliver measurable visibility and meaningful business
              opportunities.
            </p>
            <div className="hero-actions">
              <a href="/vendors" className="btn btn-primary">
                Take a Tour
              </a>
              <a href="/login/vendor" className="btn btn-ghost">
                Vendor Login
              </a>
            </div>
          </div>
        </div>

        <section className="section">
          <h2 className="section-title">Why Ask Yello?</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3 className="feature-title">Verified Service Providers</h3>
              <p className="feature-body">
                Access to verified service provider with clear service details,
                location, and sample work so you
                can make confident decisions.
              </p>
            </div>
            <div className="feature-card">
              <h3 className="feature-title">
                Vendor Overview
              </h3>
              <p className="feature-body">
                A simple dashboard that highlights key service provider information at a
                glance without complex or overwhelming navigation.
              </p>
            </div>
            <div className="feature-card">
              <h3 className="feature-title">Built for SMEs</h3>
              <p className="feature-body">
                Designed for small and medium business owners who need visibility, boost their
                business growth and reach more customers
              </p>
            </div>
          </div>
        </section>

        <TopVendors />
      </div>

      <AIChatBox />
    </section>
  );
}
