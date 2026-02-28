import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AIChatBox } from './AIChatBox.jsx'

export function Layout({ children }) {
  const { currentUser, logout, userRole } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const isVendor = currentUser && userRole === 'vendor'

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <Link to="/" className="brand">
            <span className="brand-mark"></span>
            <span className="brand-text">Ask Yello</span>
          </Link>

          <nav className="nav">
            <NavLink to="/" className="nav-link">
              Home
            </NavLink>
            <NavLink to="/vendors" className="nav-link">
              Vendors
            </NavLink>
            {currentUser && userRole && (
              <NavLink to="/dashboard" className="nav-link">
                Dashboard
              </NavLink>
            )}
            {isVendor && (
              <>
                <NavLink to="/vendor/onboarding" className="nav-link">
                  Set up profile
                </NavLink>
                <NavLink to="/vendor/profile" className="nav-link">
                  Vendor profile
                </NavLink>
              </>
            )}
            {currentUser ? (
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                Logout
              </button>
            ) : (
              <>
                <NavLink to="/login" className="nav-link nav-cta">
                  Login
                </NavLink>
                <NavLink to="/admin/access" className="nav-link nav-admin">
                  Admin
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="app-main">{children}</main>

      <AIChatBox />

      <footer className="app-footer">
        <div className="footer-inner">
          <p className="footer-text">
            © {new Date().getFullYear()} Ask Yello... Connecting SMEs with customers
          </p>
        </div>
      </footer>
    </div>
  )
}

