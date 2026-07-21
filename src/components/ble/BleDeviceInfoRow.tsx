import type { BleDevice } from '../../data/bleMocks';
import { SignalBadge } from './SignalBadge';
import './BleDeviceInfoRow.css';

type Props = {
  device: BleDevice;
  rssi: number | undefined;
};

export function BleDeviceInfoRow({ device, rssi }: Props) {
  return (
    <div className="ble-device-info-row">
      <div className="ble-device-info-row__info">
        <div className="ble-device-info-row__name-row">
          <span className="ble-device-info-row__name">
            {device.name || 'iSensor'}
          </span>
          <img src="/assets/icons/info.svg" alt="" width={24} height={24} />
        </div>
        <span className="ble-device-info-row__id">{device.id}</span>
      </div>
      <SignalBadge rssi={rssi} />
    </div>
  );
}
