import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { Home } from './pages/Home.jsx'
import { Login } from './pages/Login.jsx'
import { Dashboard } from './pages/Dashboard.jsx'
import { VendorProfile } from './pages/VendorProfile.jsx'
import { RoleSelection } from './pages/RoleSelection.jsx'
import { Layout } from './components/Layout.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import { VendorForm } from './components/VendorForm.jsx'
import './styles/global.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/role-selection" element={<RoleSelection />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
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
            <Route path="/vendors/:id" element={<VendorProfile />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
