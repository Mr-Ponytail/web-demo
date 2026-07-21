import { useEffect, useState } from 'react';
import { IMG } from '../../assets';
import type { BleDevice } from '../../data/bleMocks';
import { TIRE_SLOT_POSITION_LABELS } from '../../data/bleMocks';
import type { TireKey } from '../../data/tireMocks';
import { useBottomSheetDragDismiss } from '../../hooks/useBottomSheetDragDismiss';
import './SensorConnectionSheet.css';

type Props = {
  visible: boolean;
  tireKey: TireKey | null;
  isScanning: boolean;
  isRefreshing: boolean;
  connectingDeviceId: string | null;
  connectedDevice: BleDevice | null;
  connectedDeviceId: string | null;
  availableDevices: BleDevice[];
  onClose: () => void;
  onConnect: (deviceId: string) => void;
  onDisconnect: (deviceId: string) => void;
  onRefresh: () => void;
};

function rssiBadgeClass(rssi: number | undefined): string {
  if (rssi === undefined) return 'ble-sheet__signal--caution';
  if (rssi >= -65) return 'ble-sheet__signal--good';
  if (rssi >= -80) return 'ble-sheet__signal--caution';
  return 'ble-sheet__signal--danger';
}

function rssiWifiIcon(rssi: number | undefined): string {
  if (rssi === undefined) return '/assets/icons/wifi-caution.svg';
  if (rssi >= -65) return '/assets/icons/wifi-good.svg';
  if (rssi >= -80) return '/assets/icons/wifi-caution.svg';
  return '/assets/icons/wifi-danger.svg';
}

export function SensorConnectionSheet({
  visible,
  tireKey,
  isScanning,
  isRefreshing,
  connectingDeviceId,
  connectedDevice,
  connectedDeviceId,
  availableDevices,
  onClose,
  onConnect,
  onDisconnect,
  onRefresh,
}: Props) {
  const [entered, setEntered] = useState(false);
  const { panelStyle, dragBindings, stopScrollDragPropagation } =
    useBottomSheetDragDismiss({
      enabled: entered,
      onClose,
    });

  useEffect(() => {
    if (visible) {
      const frame = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(frame);
    }
    setEntered(false);
  }, [visible]);

  if (!visible || !tireKey) return null;

  return (
    <div
      className="ble-sheet-root"
      role="presentation"
      onClick={onClose}
    >
      <div
        className={`ble-sheet ${entered ? 'ble-sheet--open' : ''}`}
        style={panelStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ble-sheet-title"
        onClick={event => event.stopPropagation()}
        {...dragBindings}
      >
        <div className="ble-sheet__handle" aria-hidden />

        <h2 id="ble-sheet-title" className="ble-sheet__title">
          Sensor Connection
        </h2>
        <div className="ble-sheet__badge">
          {TIRE_SLOT_POSITION_LABELS[tireKey]}
        </div>

        {connectedDevice && connectedDeviceId ? (
          <section className="ble-sheet__section">
            <p className="ble-sheet__section-label">Connect</p>
            <div className="ble-sheet__connected-card">
              <div className="ble-sheet__connected-top">
                <div className="ble-sheet__connected-main">
                  <img src={IMG.checked} alt="" width={32} height={32} />
                  <div className="ble-sheet__device-info">
                    <div className="ble-sheet__device-name-row">
                      <span className="ble-sheet__device-name">
                        {connectedDevice.name || 'iSensor'}
                      </span>
                      <img src="/assets/icons/info.svg" alt="" width={24} height={24} />
                    </div>
                    <span className="ble-sheet__device-id">{connectedDevice.id}</span>
                  </div>
                </div>
                <div
                  className={`ble-sheet__signal ${rssiBadgeClass(connectedDevice.rssi)}`}
                >
                  <img
                    src={rssiWifiIcon(connectedDevice.rssi)}
                    alt=""
                    width={12}
                    height={12}
                  />
                  <span>
                    {connectedDevice.rssi !== undefined
                      ? `${connectedDevice.rssi} dBm`
                      : '--'}
                  </span>
                </div>
              </div>
              <div className="ble-sheet__connected-actions">
                <button type="button" className="ble-sheet__refresh-outline">
                  Refresh
                </button>
                <button
                  type="button"
                  className="ble-sheet__disconnect"
                  onClick={() => onDisconnect(connectedDeviceId)}
                >
                  Disconnect
                </button>
              </div>
            </div>
          </section>
        ) : null}

        <div className="ble-sheet__list-header">
          <div className="ble-sheet__list-header-left">
            <span className="ble-sheet__section-label">Available Sensors</span>
            {isRefreshing ? (
              <span className="ble-sheet__spinner" aria-label="Refreshing" />
            ) : null}
          </div>
          <button
            type="button"
            className="ble-sheet__refresh-icon"
            aria-label="Refresh scan"
            onClick={onRefresh}
          >
            <img src="/assets/icons/refresh.svg" alt="" width={32} height={32} />
          </button>
        </div>

        <div
          className="ble-sheet__list"
          onPointerDown={stopScrollDragPropagation}
        >
          {availableDevices.length === 0 ? (
            <p className="ble-sheet__empty">
              {isScanning
                ? 'Searching for nearby sensors...'
                : 'No sensors found. Tap refresh to scan again.'}
            </p>
          ) : (
            availableDevices.map((device, index) => (
              <div key={device.id}>
                {index > 0 ? <div className="ble-sheet__divider" /> : null}
                <div className="ble-sheet__list-item">
                  <img src={IMG.bluetooth} alt="" width={24} height={24} />
                  <div className="ble-sheet__device-info">
                    <div className="ble-sheet__device-name-row">
                      <span className="ble-sheet__device-name">
                        {device.name || 'iSensor'}
                      </span>
                      <img src="/assets/icons/info.svg" alt="" width={24} height={24} />
                    </div>
                    <span className="ble-sheet__device-id">{device.id}</span>
                  </div>
                  <button
                    type="button"
                    className="ble-sheet__connect-btn"
                    disabled={connectingDeviceId === device.id}
                    onClick={() => onConnect(device.id)}
                  >
                    {connectingDeviceId === device.id ? (
                      <span className="ble-sheet__spinner ble-sheet__spinner--btn" />
                    ) : (
                      'Connect'
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
