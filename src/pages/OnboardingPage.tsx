import { Link } from 'react-router-dom';
import { IMG } from '../assets';
import './OnboardingPages.css';

export function OnboardingPage() {
  return (
    <div className="screen screen--white onboarding">
      <div className="onboarding__wash" aria-hidden />
      <div className="onboarding__body">
        <div className="onboarding__hero">
          <img src={IMG.mainLogo} alt="iSensor" className="onboarding__logo" />
          <p className="onboarding__tagline">
            Every Tire, Every Road, In Real-Time
          </p>
        </div>
        <div className="onboarding__spacer" />
        <img src={IMG.mainTire} alt="" className="onboarding__tire" />
      </div>
      <div className="onboarding__footer">
        <Link className="btn-primary" to="/onboarding/nickname">
          Start with VIN
        </Link>
        <Link className="btn-secondary-text" to="/app/home">
          Set Vehicle Manually
        </Link>
      </div>
    </div>
  );
}
