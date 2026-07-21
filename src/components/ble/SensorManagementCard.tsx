import type { BleDevice } from '../../data/bleMocks';
import type { TireSlotKey } from '../../data/tireSlotGrid';
import { BleDeviceInfoRow } from './BleDeviceInfoRow';
import { TirePositionBadge } from './TirePositionBadge';
import './SensorManagementCard.css';

type Props = {
  tireKey: TireSlotKey;
  device: BleDevice | null;
  rssi: number | undefined;
  onRefresh: () => void;
  onDisconnect: () => void;
  onConnect: () => void;
};

export function SensorManagementCard({
  tireKey,
  device,
  rssi,
  onRefresh,
  onDisconnect,
  onConnect,
}: Props) {
  if (!device) {
    return (
      <div className="sensor-mgmt sensor-mgmt--dashed">
        <div className="sensor-mgmt__unconnected-row">
          <TirePositionBadge tireKey={tireKey} variant="unconnected" />
          <button
            type="button"
            className="sensor-mgmt__connect-link"
            onClick={onConnect}
          >
            Select to connect sensor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sensor-mgmt sensor-mgmt--connected">
      <div className="sensor-mgmt__top">
        <TirePositionBadge tireKey={tireKey} variant="management" />
        <BleDeviceInfoRow device={device} rssi={rssi} />
      </div>
      <div className="sensor-mgmt__actions">
        <button
          type="button"
          className="sensor-mgmt__refresh"
          onClick={onRefresh}
        >
          Refresh
        </button>
        <button
          type="button"
          className="sensor-mgmt__disconnect"
          onClick={onDisconnect}
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}
