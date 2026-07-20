import { IMG } from '../../assets';
import './SettingsSubNavBar.css';

type SettingsSubNavBarProps = {
  title: string;
  onBack: () => void;
  backgroundColor?: string;
  showDivider?: boolean;
};

export function SettingsSubNavBar({
  title,
  onBack,
  backgroundColor,
  showDivider = true,
}: SettingsSubNavBarProps) {
  return (
    <header
      className={
        showDivider ? 'settings-subnav' : 'settings-subnav settings-subnav--plain'
      }
      style={backgroundColor ? { backgroundColor } : undefined}
    >
      <button
        type="button"
        className="settings-subnav__back"
        aria-label="Back"
        onClick={onBack}
      >
        <img src={IMG.back} alt="" width={42} height={42} />
      </button>
      <h1 className="settings-subnav__title">{title}</h1>
      <span className="settings-subnav__spacer" aria-hidden />
    </header>
  );
}
