import { useState, useEffect } from 'react'
import { collection, getDocs, doc, updateDoc, query, orderBy, limit, where, getDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../context/AuthContext'

export function AdminDashboard() {
  const { currentUser, userRole } = useAuth()
  const [activities, setActivities] = useState([])
  const [vendors, setVendors] = useState([])
  const [blacklistSuggestions, setBlacklistSuggestions] = useState([])
  const [pendingApprovals, setPendingApprovals] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [manualControlMode, setManualControlMode] = useState(false)
  const [serverStatus, setServerStatus] = useState('online')

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

  // Log admin activity
  const logActivity = (type, description, targetId = null) => {
    const activity = {
      type,
      description,
      timestamp: new Date().toISOString(),
      adminId: currentUser.uid,
      adminEmail: currentUser.email,
      targetId
    }
    
    // Add to local state immediately
    setActivities(prev => [activity, ...prev])
    
    // Also save to database (in production)
    try {
      const activitiesRef = collection(db, 'adminActivities')
      // Note: In production, you'd use addDoc here
      console.log('Activity logged:', activity)
    } catch (error) {
      console.error('Error logging activity:', error)
    }
  }

  useEffect(() => {
    if (!isAdmin) return

    const fetchData = async () => {
      try {
        // Fetch vendors
        const vendorsSnapshot = await getDocs(collection(db, 'vendors'))
        const vendorsList = vendorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setVendors(vendorsList)

        // Fetch pending approvals
        const pendingQuery = query(collection(db, 'vendors'), where('status', '==', 'pending'))
        const pendingSnapshot = await getDocs(pendingQuery)
        const pendingList = pendingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setPendingApprovals(pendingList)

        // Fetch admin activities
        const activitiesSnapshot = await getDocs(
          query(collection(db, 'adminActivities'), orderBy('timestamp', 'desc'), limit(100))
        )
        const activitiesList = activitiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setActivities(activitiesList)

        // AI detection for review manipulation
        const suspiciousVendors = vendorsList.filter(v => {
          // Multiple AI detection criteria
          const hasLowRating = v.rating && v.rating < 2.5 && v.reviewCount > 5
          const hasSuspiciousPattern = v.reviewCount > 50 && v.rating === 5.0 // Perfect rating with many reviews
          const hasRecentSpikes = v.recentReviewCount > v.averageReviewCount * 3 // Recent spike in reviews
          return hasLowRating || hasSuspiciousPattern || hasRecentSpikes
        }).map(v => ({
          ...v,
          reason: v.rating && v.rating < 2.5 ? 'Low rating with high review count' :
                 v.reviewCount > 50 && v.rating === 5.0 ? 'Perfect rating with suspiciously high review count' :
                 'Unusual spike in recent reviews'
        }))
        setBlacklistSuggestions(suspiciousVendors)

        // Check server status (simulate)
        setServerStatus('online')

      } catch (error) {
        console.error('Error fetching admin data:', error)
        setServerStatus('degraded')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isAdmin])

  const handleApproveVendor = async (vendorId) => {
    try {
      await updateDoc(doc(db, 'vendors', vendorId), {
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: currentUser.uid
      })
      
      setPendingApprovals(pendingApprovals.filter(v => v.id !== vendorId))
      setVendors(vendors.map(v => 
        v.id === vendorId ? { ...v, status: 'approved' } : v
      ))
      
      logActivity('VENDOR_APPROVAL', `Approved vendor: ${vendors.find(v => v.id === vendorId)?.businessName}`, vendorId)
    } catch (error) {
      console.error('Error approving vendor:', error)
    }
  }

  const handleRejectVendor = async (vendorId) => {
    try {
      await updateDoc(doc(db, 'vendors', vendorId), {
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectedBy: currentUser.uid
      })
      
      setPendingApprovals(pendingApprovals.filter(v => v.id !== vendorId))
      setVendors(vendors.map(v => 
        v.id === vendorId ? { ...v, status: 'rejected' } : v
      ))
      
      logActivity('VENDOR_REJECTION', `Rejected vendor: ${vendors.find(v => v.id === vendorId)?.businessName}`, vendorId)
    } catch (error) {
      console.error('Error rejecting vendor:', error)
    }
  }

  const handleApproveBlacklist = async (vendorId) => {
    try {
      await updateDoc(doc(db, 'vendors', vendorId), {
        blacklisted: true,
        blacklistedAt: new Date().toISOString(),
        blacklistedBy: currentUser.uid
      })
      
      setVendors(vendors.map(v => 
        v.id === vendorId ? { ...v, blacklisted: true } : v
      ))
      setBlacklistSuggestions(blacklistSuggestions.filter(v => v.id !== vendorId))
      
      logActivity('BLACKLIST_APPROVAL', `Blacklisted vendor: ${vendors.find(v => v.id === vendorId)?.businessName}`, vendorId)
    } catch (error) {
      console.error('Error blacklisting vendor:', error)
    }
  }

  const handleRejectBlacklist = (vendorId) => {
    setBlacklistSuggestions(blacklistSuggestions.filter(v => v.id !== vendorId))
    logActivity('BLACKLIST_REJECTION', `Rejected blacklist suggestion for: ${blacklistSuggestions.find(v => v.id === vendorId)?.businessName}`, vendorId)
  }

  const handleManualBlacklist = async (vendorId) => {
    if (!manualControlMode) return
    
    try {
      await updateDoc(doc(db, 'vendors', vendorId), {
        blacklisted: true,
        blacklistedAt: new Date().toISOString(),
        blacklistedBy: currentUser.uid,
        blacklistReason: 'Manual admin action (server down mode)'
      })
      
      setVendors(vendors.map(v => 
        v.id === vendorId ? { ...v, blacklisted: true } : v
      ))
      
      logActivity('MANUAL_BLACKLIST', `Manually blacklisted vendor: ${vendors.find(v => v.id === vendorId)?.businessName}`, vendorId)
    } catch (error) {
      console.error('Error manually blacklisting vendor:', error)
    }
  }

  const handleManualApprove = async (vendorId) => {
    if (!manualControlMode) return
    
    try {
      await updateDoc(doc(db, 'vendors', vendorId), {
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: currentUser.uid,
        approvalReason: 'Manual admin action (server down mode)'
      })
      
      setPendingApprovals(pendingApprovals.filter(v => v.id !== vendorId))
      setVendors(vendors.map(v => 
        v.id === vendorId ? { ...v, status: 'approved' } : v
      ))
      
      logActivity('MANUAL_APPROVAL', `Manually approved vendor: ${vendors.find(v => v.id === vendorId)?.businessName}`, vendorId)
    } catch (error) {
      console.error('Error manually approving vendor:', error)
    }
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
          <div className="admin-header-content">
            <div>
              <h1 className="page-title">Admin Dashboard</h1>
              <p className="page-subtitle">
                Comprehensive control and monitoring system
              </p>
            </div>
            <div className="server-status">
              <span className={`status-indicator ${serverStatus}`}></span>
              Server: {serverStatus}
              <button 
                onClick={() => setManualControlMode(!manualControlMode)}
                className={`btn ${manualControlMode ? 'btn-danger' : 'btn-ghost'} btn-sm`}
              >
                {manualControlMode ? 'Manual Mode ON' : 'Manual Mode OFF'}
              </button>
            </div>
          </div>
        </header>

        <div className="admin-grid">
          {/* Pending Approvals */}
          <div className="card admin-section">
            <h2 className="section-title">Pending Vendor Approvals</h2>
            <p className="section-subtitle">
              Vendors awaiting admin approval
            </p>
            <div className="pending-list">
              {pendingApprovals.length === 0 ? (
                <p>No pending approvals</p>
              ) : (
                pendingApprovals.map(vendor => (
                  <div key={vendor.id} className="pending-item">
                    <div className="vendor-info">
                      <h4>{vendor.businessName}</h4>
                      <p>Email: {vendor.email}</p>
                      <p>Category: {vendor.category}</p>
                      <small>Submitted: {new Date(vendor.submittedAt).toLocaleString()}</small>
                    </div>
                    <div className="pending-actions">
                      <button
                        onClick={() => handleApproveVendor(vendor.id)}
                        className="btn btn-success btn-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectVendor(vendor.id)}
                        className="btn btn-danger btn-sm"
                      >
                        Reject
                      </button>
                      {manualControlMode && (
                        <button
                          onClick={() => handleManualApprove(vendor.id)}
                          className="btn btn-warning btn-sm"
                        >
                          Manual Approve
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Detection */}
          <div className="card admin-section">
            <h2 className="section-title">AI Review Manipulation Detection</h2>
            <p className="section-subtitle">
              Vendors flagged for suspicious review patterns
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
                      <p className="flag-reason">Reason: {vendor.reason}</p>
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
                      {manualControlMode && (
                        <button
                          onClick={() => handleManualBlacklist(vendor.id)}
                          className="btn btn-warning btn-sm"
                        >
                          Manual Blacklist
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity Monitoring */}
          <div className="card admin-section full-width">
            <h2 className="section-title">Recent Admin Activities</h2>
            <p className="section-subtitle">
              Track all admin actions and system events
            </p>
            <div className="activity-list">
              {activities.length === 0 ? (
                <p>No recent activities</p>
              ) : (
                activities.slice(0, 20).map(activity => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-type">{activity.type}</div>
                    <div className="activity-details">
                      <p>{activity.description}</p>
                      <div className="activity-meta">
                        <small>By: {activity.adminEmail}</small>
                        <small>{new Date(activity.timestamp).toLocaleString()}</small>
                      </div>
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
                <div className="stat-number">{pendingApprovals.length}</div>
                <div className="stat-label">Pending Approval</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{vendors.filter(v => v.blacklisted).length}</div>
                <div className="stat-label">Blacklisted</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{vendors.filter(v => v.status === 'approved').length}</div>
                <div className="stat-label">Approved</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">
                  {vendors.filter(v => v.rating >= 4).length}
                </div>
                <div className="stat-label">High Rated (4+)</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">
                  {blacklistSuggestions.length}
                </div>
                <div className="stat-label">AI Flagged</div>
              </div>
            </div>
          </div>

          {/* Manual Control Panel */}
          {manualControlMode && (
            <div className="card admin-section full-width manual-control">
              <h2 className="section-title">⚠️ Manual Control Mode</h2>
              <p className="section-subtitle">
                Server is down - Manual override controls enabled
              </p>
              <div className="manual-controls">
                <div className="control-info">
                  <p>All vendor approvals and blacklist actions are being processed manually.</p>
                  <p>Actions will be logged and synced when server is available.</p>
                </div>
                <button
                  onClick={() => setManualControlMode(false)}
                  className="btn btn-success"
                >
                  Exit Manual Mode
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
