import { useState, useEffect } from 'react'
import { collection, getDocs, doc, updateDoc, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../context/AuthContext'

export function AdminDashboard() {
  const { currentUser, userRole } = useAuth()
  const [activities, setActivities] = useState([])
  const [vendors, setVendors] = useState([])
  const [blacklistSuggestions, setBlacklistSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedActivity, setSelectedActivity] = useState(null)

  // Check admin session
  const checkAdminSession = () => {
    const session = localStorage.getItem('adminSession')
    if (session) {
      try {
        const sessionData = JSON.parse(session)
        const sessionAge = Date.now() - new Date(sessionData.timestamp).getTime()
        // Session expires after 24 hours
        return sessionAge < 24 * 60 * 60 * 1000 && sessionData.loggedIn
      } catch (error) {
        console.error('Error parsing admin session:', error)
        return false
      }
    }
    return false
  }

  // Check if user is admin
  const isAdmin = checkAdminSession() && currentUser && userRole === 'admin'

  useEffect(() => {
    if (!isAdmin) return

    const fetchData = async () => {
      try {
        // Fetch vendors
        const vendorsSnapshot = await getDocs(collection(db, 'vendors'))
        const vendorsList = vendorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setVendors(vendorsList)

        // Fetch activities (you'd need to create an activities collection)
        const activitiesSnapshot = await getDocs(
          query(collection(db, 'activities'), orderBy('timestamp', 'desc'), limit(50))
        )
        const activitiesList = activitiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setActivities(activitiesList)

        // Simulate blacklist suggestions from AI
        const suspiciousVendors = vendorsList.filter(v => 
          v.rating && v.rating < 2.5 && v.reviewCount > 5
        )
        setBlacklistSuggestions(suspiciousVendors)

      } catch (error) {
        console.error('Error fetching admin data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isAdmin])

  const handleApproveBlacklist = async (vendorId) => {
    try {
      await updateDoc(doc(db, 'vendors', vendorId), {
        blacklisted: true,
        blacklistedAt: new Date().toISOString(),
        blacklistedBy: currentUser.uid
      })
      
      // Update local state
      setVendors(vendors.map(v => 
        v.id === vendorId ? { ...v, blacklisted: true } : v
      ))
      setBlacklistSuggestions(blacklistSuggestions.filter(v => v.id !== vendorId))
    } catch (error) {
      console.error('Error blacklisting vendor:', error)
    }
  }

  const handleRejectBlacklist = (vendorId) => {
    setBlacklistSuggestions(blacklistSuggestions.filter(v => v.id !== vendorId))
  }

  if (!isAdmin) {
    return (
      <section className="page page-admin">
        <div className="page-width">
          <div className="card">
            <h1 className="page-title">Access Denied</h1>
            <p>You don't have permission to access the admin dashboard.</p>
          </div>
        </div>
      </section>
    )
  }

  if (loading) {
    return (
      <section className="page page-admin">
        <div className="page-width">
          <div className="loading-container">
            <div className="loading-spinner">Loading admin dashboard...</div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="page page-admin">
      <div className="page-width">
        <header className="page-header">
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">
            Monitor activities and manage vendor reviews
          </p>
        </header>

        <div className="admin-grid">
          {/* Activity Monitoring */}
          <div className="card admin-section">
            <h2 className="section-title">Recent Activities</h2>
            <div className="activity-list">
              {activities.length === 0 ? (
                <p>No recent activities</p>
              ) : (
                activities.slice(0, 10).map(activity => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-type">{activity.type}</div>
                    <div className="activity-details">
                      <p>{activity.description}</p>
                      <small>{new Date(activity.timestamp).toLocaleString()}</small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Blacklist Suggestions */}
          <div className="card admin-section">
            <h2 className="section-title">AI Review Manipulation Detection</h2>
            <p className="section-subtitle">
              Vendors flagged for potential review manipulation
            </p>
            <div className="blacklist-suggestions">
              {blacklistSuggestions.length === 0 ? (
                <p>No vendors flagged for review manipulation</p>
              ) : (
                blacklistSuggestions.map(vendor => (
                  <div key={vendor.id} className="suggestion-item">
                    <div className="vendor-info">
                      <h4>{vendor.businessName}</h4>
                      <p>Rating: {vendor.rating} ({vendor.reviewCount} reviews)</p>
                      <p>Reason: Low rating with high review count</p>
                    </div>
                    <div className="suggestion-actions">
                      <button
                        onClick={() => handleApproveBlacklist(vendor.id)}
                        className="btn btn-danger btn-sm"
                      >
                        Blacklist
                      </button>
                      <button
                        onClick={() => handleRejectBlacklist(vendor.id)}
                        className="btn btn-ghost btn-sm"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Vendor Statistics */}
          <div className="card admin-section">
            <h2 className="section-title">Vendor Statistics</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">{vendors.length}</div>
                <div className="stat-label">Total Vendors</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{vendors.filter(v => v.blacklisted).length}</div>
                <div className="stat-label">Blacklisted</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">
                  {vendors.filter(v => v.rating >= 4).length}
                </div>
                <div className="stat-label">High Rated (4+)</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">
                  {vendors.filter(v => v.rating && v.rating < 2).length}
                </div>
                <div className="stat-label">Low Rated</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
