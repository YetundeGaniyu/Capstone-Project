import { useNavigate } from "react-router-dom";
import { OnboardingChatbot } from "../components/OnboardingChatbot.jsx";

export function VendorOnboarding() {
  const navigate = useNavigate();

  const handleComplete = (prefilled) => {
    navigate("/vendor/profile", { state: { prefilled }, replace: true });
  };

  return (
    <section className="page page-vendor-onboarding">
      <div className="page-width onboarding-page-width">
        <header className="onboarding-header">
          <h1 className="onboarding-title">Set up your business profile</h1>
          <p className="onboarding-subtitle">
            Answer a few questions and we'll prefill your profile for you.
          </p>
        </header>
        <div className="onboarding-card">
          <OnboardingChatbot onComplete={handleComplete} />
        </div>
      </div>
    </section>
  );
}
