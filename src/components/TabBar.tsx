import { NavLink } from 'react-router-dom';
import { IMG } from '../assets';
import './TabBar.css';

const TABS = [
  {
    to: '/app/home',
    label: 'Home',
    icon: IMG.tab.home,
    active: IMG.tab.homeActive,
  },
  {
    to: '/app/tire-log',
    label: 'Tire Log',
    icon: IMG.tab.drive,
    active: IMG.tab.driveActive,
  },
  {
    to: '/app/insights',
    label: 'Insights',
    icon: IMG.tab.insights,
    active: IMG.tab.insightsActive,
  },
  {
    to: '/app/settings',
    label: 'Settings',
    icon: IMG.tab.setting,
    active: IMG.tab.settingActive,
  },
] as const;

export function TabBar({ onAiPress }: { onAiPress?: () => void }) {
  return (
    <div className="tabbar-wrap">
      <nav className="tabbar-pill" aria-label="Main">
        {TABS.map(tab => (
          <NavLink key={tab.to} to={tab.to} className="tabbar-item">
            {({ isActive }) => (
              <>
                {isActive ? <span className="tabbar-indicator" /> : null}
                <img
                  src={isActive ? tab.active : tab.icon}
                  alt=""
                  className={isActive ? 'tabbar-icon tabbar-icon--on' : 'tabbar-icon'}
                />
                <span className={isActive ? 'tabbar-label tabbar-label--on' : 'tabbar-label'}>
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <button
        type="button"
        className="tabbar-ai"
        aria-label="AI"
        onClick={onAiPress}
      >
        <img src={IMG.ai} alt="" />
      </button>
    </div>
  );
}
