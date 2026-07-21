import { IMG } from '../../assets';
import './TireDetailBluetoothPrompt.css';

type Props = {
  onConnectPress: () => void;
};

export function TireDetailBluetoothPrompt({ onConnectPress }: Props) {
  return (
    <div className="td-bt-prompt">
      <img
        className="td-bt-prompt__icon"
        src={IMG.bluetoothNot}
        alt=""
        width={120}
        height={120}
      />
      <h2 className="td-bt-prompt__title">Bluetooth Not Connected</h2>
      <p className="td-bt-prompt__subtitle">
        Connect your tire sensor to view
        <br />
        real-time tire status
      </p>
      <button
        type="button"
        className="td-bt-prompt__btn"
        onClick={onConnectPress}
      >
        Connect Sensor
      </button>
    </div>
  );
}
