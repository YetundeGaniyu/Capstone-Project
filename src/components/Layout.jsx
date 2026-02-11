import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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
            <span className="brand-text">SMEsConnect</span>
          </Link>

          <nav className="nav">
            <NavLink to="/" className="nav-link">
              Home
            </NavLink>
            {currentUser && userRole && (
              <NavLink to="/dashboard" className="nav-link">
                Dashboard
              </NavLink>
            )}
            {isVendor && (
              <NavLink to="/vendor/profile" className="nav-link">
                Vendor profile
              </NavLink>
            )}
            {currentUser ? (
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                Logout
              </button>
            ) : (
              <NavLink to="/login" className="nav-link nav-cta">
                Login
              </NavLink>
            )}
          </nav>
        </div>
      </header>

      <main className="app-main">{children}</main>

      <footer className="app-footer">
        <div className="footer-inner">
          <p className="footer-text">
            © {new Date().getFullYear()} SMEsConnect. Connecting SMEs with customers.
          </p>
        </div>
      </footer>
    </div>
  )
}

