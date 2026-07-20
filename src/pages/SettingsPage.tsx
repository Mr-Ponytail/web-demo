import { useState } from 'react';
import { AlertPreferenceCard } from '../components/settings/AlertPreferenceCard';
import { SettingsSubNavBar } from '../components/settings/SettingsSubNavBar';
import { IMG } from '../assets';
import {
  ALERT_PREFERENCE_OPTIONS,
  type AlertPreferenceLevel,
} from '../data/settingsMocks';
import { playTestAlert } from '../notifications/playTestAlert';
import './SettingsPage.css';

type SettingsView = 'main' | 'help' | 'alert-preferences';

type MenuItem = {
  icon: string;
  label: string;
  onPress?: () => void;
};

function showDemoMessage(title: string, body: string) {
  window.alert(`${title}\n\n${body}`);
}

function SettingsSection({
  title,
  items,
}: {
  title: string;
  items: MenuItem[];
}) {
  return (
    <section className="settings-section">
      <h2 className="settings-section__title">{title}</h2>
      <div className="settings-card">
        {items.map((item, index) => {
          const row = (
            <>
              <img
                src={item.icon}
                alt=""
                width={24}
                height={24}
                className="settings-row__icon"
              />
              <span className="settings-row__label">{item.label}</span>
              <img src={IMG.chevron} alt="" width={20} height={20} />
            </>
          );

          return (
            <div key={item.label}>
              {index > 0 ? <hr className="settings-card__divider" /> : null}
              {item.onPress ? (
                <button type="button" className="settings-row" onClick={item.onPress}>
                  {row}
                </button>
              ) : (
                <div className="settings-row settings-row--static">{row}</div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function HelpNoticesSubScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="screen settings-sub">
      <SettingsSubNavBar title="Help & Notices" onBack={onBack} />
      <div className="settings-sub__body" />
    </div>
  );
}

function AlertPreferencesSubScreen({ onBack }: { onBack: () => void }) {
  const [selectedLevel, setSelectedLevel] =
    useState<AlertPreferenceLevel>('standard');

  return (
    <div className="screen settings-sub settings-sub--alert">
      <SettingsSubNavBar
        title="Alert Preferences"
        onBack={onBack}
        backgroundColor="var(--blue0)"
        showDivider={false}
      />
      <div className="settings-alert-scroll">
        <div className="settings-alert-list">
          {ALERT_PREFERENCE_OPTIONS.map(option => (
            <AlertPreferenceCard
              key={option.id}
              option={option}
              selected={selectedLevel === option.id}
              onSelect={() => setSelectedLevel(option.id)}
            />
          ))}
        </div>
        <p className="settings-alert-disclaimer">
          Critical safety alerts are always delivered, regardless of your alert
          level
        </p>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const [view, setView] = useState<SettingsView>('main');

  const preferenceItems: MenuItem[] = [
    {
      icon: IMG.btSetting,
      label: 'Bluetooth Sensor Connection',
      onPress: () => {
        showDemoMessage(
          'Bluetooth Sensor Connection',
          'Connect sensors from the mobile app.',
        );
      },
    },
    {
      icon: IMG.notifSetting,
      label: 'Alert Preferences',
      onPress: () => setView('alert-preferences'),
    },
    {
      icon: IMG.notifSetting,
      label: 'Test Caution Notification',
      onPress: () => {
        playTestAlert(
          'caution',
          'FR Pressure Low',
          'Dropping to 99 psi. Still driveable, add air soon.',
        );
      },
    },
    {
      icon: IMG.notifSetting,
      label: 'Test Danger Notification',
      onPress: () => {
        playTestAlert(
          'danger',
          'FR Nut Loose',
          "High detachment risk. Stop now, don't keep driving.",
        );
      },
    },
  ];

  const supportItems: MenuItem[] = [
    {
      icon: IMG.helpSetting,
      label: 'Help & Notices',
      onPress: () => setView('help'),
    },
    { icon: IMG.supportSetting, label: '1:1 Support' },
  ];

  if (view === 'help') {
    return <HelpNoticesSubScreen onBack={() => setView('main')} />;
  }

  if (view === 'alert-preferences') {
    return (
      <AlertPreferencesSubScreen onBack={() => setView('main')} />
    );
  }

  return (
    <div className="screen settings">
      <h1 className="settings__title">Settings</h1>

      <div className="settings__scroll">
        <SettingsSection title="Preferences" items={preferenceItems} />
        <SettingsSection title="Support" items={supportItems} />
      </div>
    </div>
  );
}
