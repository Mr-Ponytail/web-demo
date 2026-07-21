import type { BleDevice } from '../../data/bleMocks';
import type { TireSlotKey } from '../../data/tireSlotGrid';
import { BleDeviceInfoRow } from './BleDeviceInfoRow';
import { TirePositionBadge } from './TirePositionBadge';
import './SensorListCard.css';

type Props = {
  tireKey: TireSlotKey;
  device: BleDevice | null;
  rssi: number | undefined;
  onConnect: () => void;
};

export function SensorListCard({ tireKey, device, rssi, onConnect }: Props) {
  if (!device) {
    return (
      <div className="sensor-list-card sensor-list-card--dashed">
        <div className="sensor-list-card__unconnected-row">
          <TirePositionBadge tireKey={tireKey} variant="unconnected" />
          <button
            type="button"
            className="sensor-list-card__connect-link"
            onClick={onConnect}
          >
            Select to connect sensor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sensor-list-card sensor-list-card--connected">
      <TirePositionBadge tireKey={tireKey} variant="list" />
      <BleDeviceInfoRow device={device} rssi={rssi} />
    </div>
  );
}
