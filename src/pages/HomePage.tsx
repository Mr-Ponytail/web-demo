import { useState } from 'react';
import { ScreenHeader } from '../components/ScreenHeader';
import { AxleView } from '../components/tire/AxleView';
import { DetailTabView } from '../components/tire/DetailTabView';
import { TireLaneBackground } from '../components/tire/TireLaneBackground';
import { DEMO_STORAGE_KEYS, DEMO_VEHICLE } from '../data/vehicleMock';
import { TIRE_REAR_CHIP_BOTTOM_MIN_GAP } from '../tire/constants';
import './HomePage.css';

export function HomePage() {
  const [mode, setMode] = useState<'axle' | 'detail'>('axle');
  const vehicleName =
    sessionStorage.getItem(DEMO_STORAGE_KEYS.nickname) ||
    DEMO_VEHICLE.nickname;

  return (
    <div className="screen home-screen screen--pad-tabs">
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

      <div
        className="home-content"
        style={{ paddingBottom: TIRE_REAR_CHIP_BOTTOM_MIN_GAP }}
      >
        <div className="home-content__layer">
          <TireLaneBackground />
          {/* Matches TireScreen: screenPadding 16 + AxleView/DetailTabView pad 16 */}
          <div className="home-content__tire-pad">
            {mode === 'axle' ? <AxleView /> : <DetailTabView />}
          </div>
        </div>
      </div>
    </div>
  );
}
