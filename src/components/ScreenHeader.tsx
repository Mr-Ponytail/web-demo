import { IMG } from '../assets';
import './ScreenHeader.css';

type Props = {
  title: string;
  onBluetooth?: () => void;
  onNotification?: () => void;
};

export function ScreenHeader({ title, onBluetooth, onNotification }: Props) {
  return (
    <div className="chrome__title-row">
      <h1 className="chrome__title">{title}</h1>
      <div className="chrome__actions">
        <button type="button" className="icon-btn" onClick={onBluetooth} aria-label="Bluetooth">
          <img src={IMG.bluetooth} alt="" />
        </button>
        <button type="button" className="icon-btn" onClick={onNotification} aria-label="Notifications">
          <img src={IMG.notification} alt="" />
        </button>
      </div>
    </div>
  );
}
