import { useState } from 'react';
import { SensorConnectionSheet } from '../components/ble/SensorConnectionSheet';
import { ScreenHeader } from '../components/ScreenHeader';
import { AxleView } from '../components/tire/AxleView';
import { DetailTabView } from '../components/tire/DetailTabView';
import { TireLaneBackground } from '../components/tire/TireLaneBackground';
import { DEMO_STORAGE_KEYS, DEMO_VEHICLE } from '../data/vehicleMock';
import { useSensorConnectionDemo } from '../hooks/useSensorConnectionDemo';
import './HomePage.css';

export function HomePage() {
  const [mode, setMode] = useState<'axle' | 'detail'>('axle');
  const sensorConnection = useSensorConnectionDemo();
  const vehicleName =
    sessionStorage.getItem(DEMO_STORAGE_KEYS.nickname) ||
    DEMO_VEHICLE.nickname;

  return (
    <div className="screen home-screen">
      <div className="home-fixed-top">
        <div className="home-header-pad">
          <ScreenHeader title={vehicleName} />
        </div>
        <div className="view-tabs">
          <button
            type="button"
            className={mode === 'axle' ? 'view-tab view-tab--on' : 'view-tab'}
            onClick={() => setMode('axle')}
          >
            Axle
            {mode === 'axle' ? <span className="view-tab__bar" /> : null}
          </button>
          <span className="view-tabs__divider" />
          <button
            type="button"
            className={mode === 'detail' ? 'view-tab view-tab--on' : 'view-tab'}
            onClick={() => setMode('detail')}
          >
            Detail
            {mode === 'detail' ? <span className="view-tab__bar" /> : null}
          </button>
        </div>
      </div>

      <div className="home-content">
        <div className="home-content__layer">
          <TireLaneBackground />
          {/* Matches TireScreen: screenPadding 16 + AxleView/DetailTabView pad 16 */}
          <div className="home-content__tire-pad">
            {mode === 'axle' ? (
              <AxleView
                connected={sensorConnection.connectedTires}
                onScanTire={sensorConnection.openSheet}
              />
            ) : (
              <DetailTabView connected={sensorConnection.connectedTires} />
            )}
          </div>
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
