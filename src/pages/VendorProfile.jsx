export function VendorProfile() {
  return (
    <section className="page page-vendor-profile">
      <div className="page-width">
        <header className="page-header">
          <h1 className="page-title">Vendor profile (sample)</h1>
          <p className="page-subtitle">
            This screen will eventually show a specific artisan&apos;s details. For now, it uses static
            placeholder content.
          </p>
        </header>

        <div className="card vendor-card">
          <div className="vendor-header">
            <div className="vendor-avatar">AK</div>
            <div>
              <h2 className="vendor-name">Adeola Kitchens</h2>
              <p className="vendor-meta">Catering & events • Lagos, Nigeria</p>
            </div>
          </div>

          <div className="vendor-body">
            <h3 className="section-subtitle">Overview</h3>
            <p>
              Adeola Kitchens provides small-batch catering and event support for SMEs, from team lunches to
              product launches.
            </p>

            <h3 className="section-subtitle">Core services</h3>
            <ul className="simple-list">
              <li>Office catering for 20–80 people</li>
              <li>Light refreshments for product demos</li>
              <li>Customized menus for dietary needs</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

