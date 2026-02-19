import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { OnboardingChatbot } from "../components/OnboardingChatbot";

export function VendorSignUp() {
  const { signInWithGoogle, currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [vendorType, setVendorType] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingData, setOnboardingData] = useState({});
  const navigate = useNavigate();

  // Redirect if already logged in
  if (currentUser) {
    navigate("/dashboard");
    return null;
  }

  const handleGoogleSignUp = async () => {
    if (!vendorType) {
      setError("Please select whether you are a new or existing vendor");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await signInWithGoogle("vendor");

      // Show onboarding chatbot for new vendors
      if (vendorType === "new") {
        setShowOnboarding(true);
      } else {
        navigate("/vendor/profile");
      }
    } catch (err) {
      setError("Failed to sign up. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = (data) => {
    setOnboardingData(data);
    // Navigate to vendor form with pre-filled data
    navigate("/vendor/profile", { state: { prefillData: data } });
  };

  return (
    <section className="page page-vendor-signup">
      <div className="page-width">
        {showOnboarding ? (
          <div className="card auth-card">
            <OnboardingChatbot onComplete={handleOnboardingComplete} />
          </div>
        ) : (
          <div className="card auth-card">
            <h1 className="page-title">Sign up as Service Provider</h1>
            <p className="page-subtitle">
              Showcase your services and connect with SMEs
            </p>

            <div className="vendor-type-selection">
              <h3>Are you a new or existing service provider?</h3>
              <div className="vendor-options">
                <label className="vendor-option">
                  <input
                    type="radio"
                    name="vendorType"
                    value="new"
                    checked={vendorType === "new"}
                    onChange={(e) => setVendorType(e.target.value)}
                    className="vendor-radio"
                  />
                  <div className="vendor-card">
                    <h4 className="vendor-title">New Service Provider</h4>
                    <p className="vendor-description">
                      I'm new and want to create my business profile
                    </p>
                  </div>
                </label>

                <label className="vendor-option">
                  <input
                    type="radio"
                    name="vendorType"
                    value="existing"
                    checked={vendorType === "existing"}
                    onChange={(e) => setVendorType(e.target.value)}
                    className="vendor-radio"
                  />
                  <div className="vendor-card">
                    <h4 className="vendor-title">Existing Service Provider</h4>
                    <p className="vendor-description">
                      I already have a business profile and want to manage it
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={loading || !vendorType}
              className="btn btn-primary btn-block"
            >
              {loading ? "Signing up..." : "Sign up with Google"}
            </button>

            <div className="auth-footer">
              <p>Already have an account?</p>
              <a href="/login" className="link">
                Sign in
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
