import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SensorConnectionSheet } from '../components/ble/SensorConnectionSheet';
import { SensorListCard } from '../components/ble/SensorListCard';
import { SensorManagementCard } from '../components/ble/SensorManagementCard';
import { TirePositionGrid } from '../components/insights/TirePositionGrid';
import { SettingsSubNavBar } from '../components/settings/SettingsSubNavBar';
import {
  getDeviceForSlot,
  MAX_CONNECTED_DEVICES,
} from '../data/bleMocks';
import { LIST_ORDER, type TireSlotKey } from '../data/tireSlotGrid';
import { useSensorConnectionDemo } from '../hooks/useSensorConnectionDemo';
import './ConnectSensorsPage.css';

export function ConnectSensorsPage() {
  const navigate = useNavigate();
  const [selectedKey, setSelectedKey] = useState<TireSlotKey | null>(null);
  const sensorConnection = useSensorConnectionDemo();
  const {
    tireDeviceMap,
    scannedDevices,
    connectedDeviceIds,
    handleRefresh: refreshScan,
    disconnectTire,
    openSheet,
  } = sensorConnection;

  const handleRefresh = useCallback(() => {
    if (connectedDeviceIds.length >= MAX_CONNECTED_DEVICES) {
      return;
    }
    refreshScan();
  }, [connectedDeviceIds.length, refreshScan]);

  const listKeys = selectedKey
    ? LIST_ORDER.filter(key => key !== selectedKey)
    : LIST_ORDER;

  const selectedConnection = selectedKey
    ? getDeviceForSlot(
        selectedKey,
        tireDeviceMap,
        connectedDeviceIds,
        scannedDevices,
      )
    : null;

  return (
    <div className="connect-sensors">
      <SettingsSubNavBar
        title="Connect Sensors"
        onBack={() => navigate(-1)}
        backgroundColor="var(--blue0)"
        showDivider={false}
      />

      <div className="connect-sensors__scroll">
        <TirePositionGrid
          className="connect-sensors__grid"
          selectedKey={selectedKey}
          onSelect={setSelectedKey}
        />

        {selectedKey ? (
          <SensorManagementCard
            tireKey={selectedKey}
            device={selectedConnection?.device ?? null}
            rssi={selectedConnection?.rssi}
            onRefresh={handleRefresh}
            onDisconnect={() => disconnectTire(selectedKey)}
            onConnect={() => openSheet(selectedKey)}
          />
        ) : null}

        <p className="connect-sensors__list-label">List</p>
        <div className="connect-sensors__list">
          {listKeys.map(tireKey => {
            const connection = getDeviceForSlot(
              tireKey,
              tireDeviceMap,
              connectedDeviceIds,
              scannedDevices,
            );
            return (
              <SensorListCard
                key={tireKey}
                tireKey={tireKey}
                device={connection?.device ?? null}
                rssi={connection?.rssi}
                onConnect={() => openSheet(tireKey)}
              />
            );
          })}
        </div>
      </div>

      <SensorConnectionSheet
        visible={sensorConnection.sheetTireKey !== null}
        tireKey={sensorConnection.sheetTireKey}
        isScanning={sensorConnection.isScanning}
        isRefreshing={sensorConnection.isRefreshing}
        connectingDeviceId={sensorConnection.connectingDeviceId}
        connectedDevice={sensorConnection.sheetConnectedDevice}
        connectedDeviceId={sensorConnection.sheetConnectedDeviceId}
        availableDevices={sensorConnection.availableDevices}
        onClose={sensorConnection.closeSheet}
        onConnect={deviceId => void sensorConnection.connectDevice(deviceId)}
        onDisconnect={sensorConnection.disconnectDevice}
        onRefresh={sensorConnection.handleRefresh}
      />
    </div>
  );
}
