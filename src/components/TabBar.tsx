import { NavLink, useLocation } from 'react-router-dom';
import { useSyncExternalStore } from 'react';
import { IMG } from '../assets';
import { insightsChipGridStore } from '../state/insightsChipGridStore';
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

function tabIconSrcSet(src: string): string {
  const dot = src.lastIndexOf('.');
  const base = src.slice(0, dot);
  const ext = src.slice(dot);
  return `${src} 1x, ${base}@2x${ext} 2x, ${base}@3x${ext} 3x`;
}

function tabIconImageSet(src: string, webkit = false): string {
  const dot = src.lastIndexOf('.');
  const base = src.slice(0, dot);
  const ext = src.slice(dot);
  const set = `url("${src}") 1x, url("${base}@2x${ext}") 2x, url("${base}@3x${ext}") 3x`;
  return webkit ? `-webkit-image-set(${set})` : `image-set(${set})`;
}

export function TabBar({ onAiPress }: { onAiPress?: () => void }) {
  const location = useLocation();
  const chipGridExpanded = useSyncExternalStore(
    insightsChipGridStore.subscribe,
    insightsChipGridStore.getExpanded,
  );
  const onInsightsTab = location.pathname.startsWith('/app/insights');
  const dimTabBar = onInsightsTab && chipGridExpanded;

  const closeChipGrid = () => {
    insightsChipGridStore.setExpanded(false);
  };

  return (
    <div className={dimTabBar ? 'tabbar-wrap tabbar-wrap--dimmed' : 'tabbar-wrap'}>
      <nav className="tabbar-pill" aria-label="Main">
        {TABS.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className="tabbar-item"
            onClick={closeChipGrid}
          >
            {({ isActive }) => (
              <>
                {isActive ? <span className="tabbar-indicator" /> : null}
                {isActive ? (
                  <img
                    src={tab.active}
                    srcSet={tabIconSrcSet(tab.active)}
                    alt=""
                    width={26}
                    height={26}
                    decoding="async"
                    className="tabbar-icon tabbar-icon--on"
                  />
                ) : (
                  <span
                    className="tabbar-icon tabbar-icon--off"
                    style={{
                      WebkitMaskImage: tabIconImageSet(tab.icon, true),
                      maskImage: tabIconImageSet(tab.icon),
                    }}
                    aria-hidden
                  />
                )}
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
