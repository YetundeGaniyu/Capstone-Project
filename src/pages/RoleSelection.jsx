import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function RoleSelection() {
  const { currentUser, setRole } = useAuth()
  const [selectedRole, setSelectedRole] = useState('')
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedRole) return

    setSaving(true)
    try {
      await setRole(selectedRole)
      navigate('/dashboard')
    } catch (error) {
      console.error('Error setting role:', error)
      alert('Failed to save role. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page page-role-selection">
      <div className="page-width">
        <div className="card auth-card">
          <h1 className="page-title">Choose your role</h1>
          <p className="page-subtitle">
            Select how you&apos;d like to use ArtisanConnect.
          </p>

          <form className="form" onSubmit={handleSubmit}>
            <div className="role-options">
              <label className="role-option">
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={selectedRole === 'user'}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="role-radio"
                />
                <div className="role-card">
                  <h3 className="role-title">SME Owner / User</h3>
                  <p className="role-description">
                    Find and connect with artisans for your business needs
                  </p>
                </div>
              </label>

              <label className="role-option">
                <input
                  type="radio"
                  name="role"
                  value="vendor"
                  checked={selectedRole === 'vendor'}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="role-radio"
                />
                <div className="role-card">
                  <h3 className="role-title">Vendor / Artisan</h3>
                  <p className="role-description">
                    Showcase your services and connect with SMEs
                  </p>
                </div>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={!selectedRole || saving}
            >
              {saving ? 'Saving...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
