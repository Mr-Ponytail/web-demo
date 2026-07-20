import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IMG } from '../assets';
import './SplashPage.css';

export function SplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = window.setTimeout(() => navigate('/onboarding', { replace: true }), 1800);
    return () => window.clearTimeout(t);
  }, [navigate]);

  return (
    <div className="splash">
      <img src={IMG.splashLogo} alt="iSensor" className="splash__logo" />
    </div>
  );
}
