import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { Home } from './pages/Home.jsx'
import { Login } from './pages/Login.jsx'
import { AdminDashboard } from './pages/AdminDashboard.jsx'
import { AdminLogin } from './pages/AdminLogin.jsx'
import { AdminAccess } from './pages/AdminAccess.jsx'
import { VendorCreate } from './pages/VendorCreate.jsx'
import { UserAuth } from './pages/UserAuth.jsx'
import { UserSignUp } from './pages/UserSignUp.jsx'
import { VendorSignUp } from './pages/VendorSignUp.jsx'
import { VendorLogin } from './pages/VendorLogin.jsx'
import { SignUpSelection } from './pages/SignUpSelection.jsx'
import { RoleSelection } from './pages/RoleSelection.jsx'
import { Dashboard } from './pages/Dashboard.jsx'
import { VendorProfile } from './pages/VendorProfile.jsx'
import { Layout } from './components/Layout.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import { VendorForm } from './components/VendorForm.jsx'
import { VendorList } from './components/VendorList.jsx'
import { VendorOnboarding } from './pages/VendorOnboarding.jsx'
import './styles/global.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/login/admin" element={<AdminLogin />} />
            <Route path="/admin/access" element={<AdminAccess />} />
            <Route path="/login/vendor" element={<VendorLogin />} />
            <Route path="/signup" element={<SignUpSelection />} />
            <Route path="/signup/user" element={<UserSignUp />} />
            <Route path="/signup/vendor" element={<VendorSignUp />} />
            <Route path="/vendor/create" element={<VendorCreate />} />
            <Route path="/role-selection" element={<RoleSelection />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requireRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/onboarding"
              element={
                <ProtectedRoute requireRole="vendor">
                  <VendorOnboarding />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/profile"
              element={
                <ProtectedRoute requireRole="vendor">
                  <VendorForm />
                </ProtectedRoute>
              }
            />
            <Route path="/vendors" element={<VendorList />} />
            <Route path="/vendors/:id" element={<VendorProfile />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
