import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function VendorLogin() {
  const { signInWithGoogle, currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState({
    businessName: "",
    password: "",
  });
  const navigate = useNavigate();

  // Redirect if already logged in
  if (currentUser) {
    navigate("/dashboard");
    return null;
  }

  const handleBusinessLogin = async (e) => {
    e.preventDefault();
    if (!credentials.businessName || !credentials.password) {
      setError("Please enter both business name and password");
      return;
    }

    setLoading(true);
    setError("");
    try {
      // For now, we'll use Google auth as fallback
      // In a real implementation, you'd have a separate auth system
      await signInWithGoogle("vendor");
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid credentials. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section className="page page-vendor-login">
      <div className="page-width">
        <div className="card auth-card">
          <h1 className="page-title">Business Login</h1>
          <p className="page-subtitle">
            Sign in to manage your business profile and connect with customers
          </p>

          {error && <div className="error-message">{error}</div>}

          <form className="form" onSubmit={handleBusinessLogin}>
            <div className="form-group">
              <label htmlFor="businessName" className="form-label">
                Business Name
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={credentials.businessName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your business name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-block"
            >
              {loading ? "Signing in..." : "Business Login"}
            </button>
          </form>

          <div className="auth-footer">
            <p>New Service provider?</p>
            <a href="/vendor/create" className="link">
              Create Account
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
