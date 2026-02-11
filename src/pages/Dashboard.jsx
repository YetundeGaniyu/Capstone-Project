export function Dashboard() {
  return (
    <section className="page page-dashboard">
      <div className="page-width">
        <header className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Lightweight overview of your key vendors and categories.</p>
        </header>

        <div className="dashboard-grid">
          <div className="card dashboard-card">
            <h2 className="card-title">Quick stats</h2>
            <ul className="stat-list">
              <li className="stat-item">
                <span className="stat-label">Active vendors</span>
                <span className="stat-value">8</span>
              </li>
              <li className="stat-item">
                <span className="stat-label">Pending requests</span>
                <span className="stat-value">3</span>
              </li>
              <li className="stat-item">
                <span className="stat-label">Cities covered</span>
                <span className="stat-value">4</span>
              </li>
            </ul>
          </div>

          <div className="card dashboard-card">
            <h2 className="card-title">Sample vendor categories</h2>
            <ul className="pill-list">
              <li className="pill">Fashion & tailoring</li>
              <li className="pill">Catering & events</li>
              <li className="pill">Repairs & maintenance</li>
              <li className="pill">Branding & design</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

