import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminAPI, providersAPI } from '../services/apiService'
import { useAuth } from '../context/AuthContext'

export function AdminDashboard() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [activities, setActivities] = useState([])
  const [vendors, setVendors] = useState([])
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
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const authToken = localStorage.getItem('authToken')

      // Real users from backend
      const usersResponse = await adminAPI.getAllUsers(authToken)
      setUsers(usersResponse.data || [])

      // Real pending providers from backend
      const pendingResponse = await adminAPI.getPendingProviders(authToken)
      setPendingApprovals(pendingResponse.data || [])

      // All providers for stats
      const vendorsResponse = await providersAPI.getAll()
      setVendors(vendorsResponse.data || [])

      // Real activities derived from actual data
      const recentActivities = [
        ...pendingResponse.data.slice(0, 3).map(p => ({
          id: p.id,
          type: 'PENDING_APPROVAL',
          description: `${p.businessName} is awaiting verification`,
          timestamp: p.createdAt
        })),
        ...vendorsResponse.data.slice(0, 3).map(v => ({
          id: v.id,
          type: 'VENDOR_ACTIVE',
          description: `${v.businessName} is active on platform`,
          timestamp: v.createdAt
        }))
      ]
      setActivities(recentActivities)

      setServerStatus('online')

    } catch (error) {
      console.error('Dashboard error:', error)
      setServerStatus('degraded')
    } finally {
      setLoading(false)
    }
  }

  if (isAdmin) {
    fetchDashboardData()
  }
}, [isAdmin])

  const handleApproveVendor = async (vendorId) => {
    try {
      const authToken = localStorage.getItem('authToken')
      await adminAPI.verifyProvider(vendorId, authToken)
      
      // Refresh pending list after approval
      const pendingResponse = await adminAPI.getPendingProviders(authToken)
      setPendingApprovals(pendingResponse.data || [])
      
      // Update vendors list
      setVendors(vendors.map(v => 
        v.id === vendorId ? { ...v, status: 'approved' } : v
      ))
      
      logActivity('VENDOR_APPROVAL', `Approved vendor: ${vendors.find(v => v.id === vendorId)?.businessName}`, vendorId)
      alert('Provider approved successfully!')
    } catch (error) {
      console.error('Error approving vendor:', error)
      alert('Failed to approve provider: ' + error.message)
    }
  }

  const handleRejectVendor = async (vendorId) => {
    try {
      const authToken = localStorage.getItem('authToken')
      await adminAPI.rejectProvider(vendorId, authToken)
      
      // Refresh pending list after rejection
      const pendingResponse = await adminAPI.getPendingProviders(authToken)
      setPendingApprovals(pendingResponse.data || [])
      
      // Update vendors list
      setVendors(vendors.map(v => 
        v.id === vendorId ? { ...v, status: 'rejected' } : v
      ))
      
      logActivity('VENDOR_REJECTION', `Rejected vendor: ${vendors.find(v => v.id === vendorId)?.businessName}`, vendorId)
      alert('Provider rejected.')
    } catch (error) {
      console.error('Error rejecting vendor:', error)
      alert('Failed to reject provider: ' + error.message)
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
            <h2 className="section-title">Platform Statistics</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">{users.length}</div>
                <div className="stat-label">Total Users</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{vendors.length}</div>
                <div className="stat-label">Total Vendors</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{pendingApprovals.length}</div>
                <div className="stat-label">Pending Verifications</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{vendors.filter(v => v.status === 'approved').length}</div>
                <div className="stat-label">Active Vendors</div>
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
