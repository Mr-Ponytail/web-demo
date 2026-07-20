import { Link } from 'react-router-dom';
import { IMG } from '../assets';
import './AppPages.css';

const PREFS = [
  { icon: IMG.btSetting, label: 'Bluetooth Sensor Connection' },
  { icon: IMG.notifSetting, label: 'Alert Preferences' },
  { icon: IMG.notifSetting, label: 'Test Caution Notification' },
  { icon: IMG.notifSetting, label: 'Test Danger Notification' },
];

const SUPPORT = [
  { icon: IMG.helpSetting, label: 'Help & Notices' },
  { icon: IMG.supportSetting, label: '1:1 Support' },
];

export function SettingsPage() {
  return (
    <div className="screen screen--pad-tabs">
      <div className="chrome settings-chrome">
        <h1 className="chrome__title">Settings</h1>
      </div>

      <div className="content-pane settings-pane">
        <p className="settings-section-title">Preferences</p>
        <div className="settings-card">
          {PREFS.map(item => (
            <button key={item.label} type="button" className="settings-row">
              <span className="settings-row__left">
                <img src={item.icon} alt="" width={24} height={24} />
                {item.label}
              </span>
              <img src={IMG.chevron} alt="" width={20} height={20} />
            </button>
          ))}
        </div>

        <p className="settings-section-title">Support</p>
        <div className="settings-card">
          {SUPPORT.map(item => (
            <button key={item.label} type="button" className="settings-row">
              <span className="settings-row__left">
                <img src={item.icon} alt="" width={24} height={24} />
                {item.label}
              </span>
              <img src={IMG.chevron} alt="" width={20} height={20} />
            </button>
          ))}
        </div>

        <p className="settings-section-title">Device</p>
        <div className="token-card">
          <p className="token-card__label">Device Token</p>
          <p className="token-card__value">demo-web-token-0000</p>
          <button type="button" className="token-card__btn">
            Share / Copy
          </button>
        </div>

        <Link className="btn-secondary-text" to="/onboarding" style={{ marginTop: 24 }}>
          Restart onboarding
        </Link>
      </div>
    </div>
  );
}
