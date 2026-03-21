import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { providersAPI } from '../services/apiService'
import { useAuth } from '../context/AuthContext'

export function AdminDashboard() {
  const { currentUser, userRole } = useAuth()
  const navigate = useNavigate()
  const [activities, setActivities] = useState([])
  const [vendors, setVendors] = useState([])
  const [blacklistSuggestions, setBlacklistSuggestions] = useState([])
  const [pendingApprovals, setPendingApprovals] = useState([])
  const [loading, setLoading] = useState(true)
  const [manualControlMode, setManualControlMode] = useState(false)
  const [serverStatus, setServerStatus] = useState('online')

  // Check admin session
  const checkAdminSession = () => {
    const token = localStorage.getItem('authToken')
    const isAdmin = localStorage.getItem('isAdmin') === 'true'
    return token && isAdmin
  }

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('isAdmin')
    navigate('/admin')
  }

  // Check if user is admin
  const isAdmin = checkAdminSession()

  // Log admin activity
  const logActivity = (type, description, targetId = null) => {
    const activity = {
      type,
      description,
      timestamp: new Date().toISOString(),
      adminId: currentUser?.uid || 'admin',
      adminEmail: currentUser?.email || 'admin@example.com',
      targetId
    }
    
    // Add to local state immediately
    setActivities(prev => [activity, ...prev])
    
    // In production, this would call an API endpoint
    console.log('Activity logged:', activity)
  }

  useEffect(() => {
    if (!isAdmin) return

    const fetchData = async () => {
      try {
        // Fetch vendors using API
        const vendorsResponse = await providersAPI.getAll()
        const vendorsList = vendorsResponse.data || []
        setVendors(vendorsList)

        // For demo purposes, filter pending approvals
        const pendingList = vendorsList.filter(v => v.status === 'pending')
        setPendingApprovals(pendingList)

        // Mock activities for demo
        const mockActivities = [
          {
            id: '1',
            type: 'VENDOR_APPROVAL',
            description: 'Approved vendor: Demo Business',
            timestamp: new Date().toISOString(),
            adminId: 'admin',
            adminEmail: 'admin@example.com'
          }
        ]
        setActivities(mockActivities)

        // AI detection for review manipulation
        const suspiciousVendors = vendorsList.filter(v => {
          const hasLowRating = v.rating && v.rating < 2.5 && v.reviewCount > 5
          const hasSuspiciousPattern = v.reviewCount > 50 && v.rating === 5.0
          return hasLowRating || hasSuspiciousPattern
        }).map(v => ({
          ...v,
          reason: v.rating && v.rating < 2.5 ? 'Low rating with high review count' :
                 v.reviewCount > 50 && v.rating === 5.0 ? 'Perfect rating with suspiciously high review count' :
                 'Unusual spike in recent reviews'
        }))
        setBlacklistSuggestions(suspiciousVendors)

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
      // In production, this would call adminAPI.verifyProvider()
      console.log('Approving vendor:', vendorId)
      
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
      // In production, this would call adminAPI.rejectProvider()
      console.log('Rejecting vendor:', vendorId)
      
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
      // In production, this would call an API endpoint
      console.log('Blacklisting vendor:', vendorId)
      
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
      // In production, this would call an API endpoint
      console.log('Manually blacklisting vendor:', vendorId)
      
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
      // In production, this would call an API endpoint
      console.log('Manually approving vendor:', vendorId)
      
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
              <button 
                onClick={handleLogout}
                className="btn btn-outline btn-sm"
              >
                Logout
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
