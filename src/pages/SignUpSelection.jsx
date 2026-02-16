import { useNavigate } from 'react-router-dom'

export function SignUpSelection() {
  const navigate = useNavigate()

  return (
    <section className="page page-signup-selection">
      <div className="page-width">
        <div className="card auth-card">
          <h1 className="page-title">Join SMEsConnect</h1>
          <p className="page-subtitle">
            Choose how you want to join our community
          </p>

          <div className="signup-options">
            <button
              onClick={() => navigate('/signup/user')}
              className="btn btn-outline btn-block signup-option-btn"
            >
              <div className="option-content">
                <h3 className="option-title">SME Owner / User</h3>
                <p className="option-description">
                  Find and connect with artisans for your business needs
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate('/signup/vendor')}
              className="btn btn-outline btn-block signup-option-btn"
            >
              <div className="option-content">
                <h3 className="option-title">Vendor / Artisan</h3>
                <p className="option-description">
                  Showcase your services and connect with SMEs
                </p>
              </div>
            </button>
          </div>

          <div className="auth-footer">
            <p>Already have an account?</p>
            <a href="/login" className="link">Sign in</a>
          </div>
        </div>
      </div>
    </section>
  )
}
