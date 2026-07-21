import { useEffect, useMemo, useRef, useState, type TouchEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SensorConnectionSheet } from '../components/ble/SensorConnectionSheet';
import { IMG } from '../assets';
import {
  buildDetailStatusMap,
  getDetailEntryForTire,
} from '../data/tireDetailMocks';
import type { TireKey, TireStatus } from '../data/tireMocks';
import { TireDetailBluetoothPrompt } from '../components/tire/TireDetailBluetoothPrompt';
import { TireDetailMetricCard } from '../components/tire/TireDetailMetricCard';
import { TireDetailPressureCard } from '../components/tire/TireDetailPressureCard';
import { TireDetailSelector } from '../components/tire/TireDetailSelector';
import { TireDetailStatusChip } from '../components/tire/TireDetailStatusChip';
import { TireDetailVehicleScene } from '../components/tire/TireDetailVehicleScene';
import { useSensorConnectionDemo } from '../hooks/useSensorConnectionDemo';
import { usePhoneWidth } from '../tire/usePhoneWidth';
import {
  buildDetailLayout,
  isLeftTire,
  TIRE_DETAIL_ALL_KEYS,
  TIRE_DETAIL_METRIC_GAP,
  TIRE_DETAIL_POSITION_LABELS,
  TIRE_DETAIL_PRESSURE_CARD_W,
} from '../tire/detailConstants';
import './TireDetailPage.css';

const STATUS_GRADIENT: Record<TireStatus, string> = {
  normal: 'rgba(30, 212, 90, 0.18)',
  caution: 'rgba(255, 159, 10, 0.18)',
  danger: 'rgba(255, 99, 99, 0.18)',
  offline: 'rgba(152, 155, 162, 0.12)',
};

function isTireKey(v: string | undefined): v is TireKey {
  return !!v && (TIRE_DETAIL_ALL_KEYS as string[]).includes(v);
}

export function TireDetailPage() {
  const navigate = useNavigate();
  const { tireKey: paramKey } = useParams();
  const sw = usePhoneWidth();
  const layout = useMemo(() => buildDetailLayout(sw), [sw]);
  const sensorConnection = useSensorConnectionDemo();

  const initKey: TireKey = isTireKey(paramKey) ? paramKey : 'FL';
  const [focusedKey, setFocusedKey] = useState<TireKey>(initKey);
  const [selectedKey, setSelectedKey] = useState<TireKey>(initKey);
  const [showLabels, setShowLabels] = useState(true);
  const [showCards, setShowCards] = useState(true);
  const fadeTimer = useRef<number | null>(null);
  const cardTimer = useRef<number | null>(null);

  const clearTransitionTimers = () => {
    if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
    if (cardTimer.current) window.clearTimeout(cardTimer.current);
    fadeTimer.current = null;
    cardTimer.current = null;
  };

  const tireStatusByKey = useMemo(
    () => buildDetailStatusMap(sensorConnection.connectedTires),
    [sensorConnection.connectedTires],
  );

  const tireData = getDetailEntryForTire(
    selectedKey,
    sensorConnection.connectedTires,
  );
  const showBluetoothBlur = !sensorConnection.connectedTires.has(selectedKey);
  const pan = layout.viewportPan[focusedKey];
  const pos = TIRE_DETAIL_POSITION_LABELS[selectedKey];
  const left = isLeftTire(selectedKey);

  useEffect(() => {
    if (isTireKey(paramKey) && paramKey !== focusedKey) {
      // URL deep-link sync on first mount only handled via init; ignore later
    }
  }, [paramKey, focusedKey]);

  const handleSelectTire = (key: TireKey) => {
    if (key === focusedKey) return;
    setFocusedKey(key);
    clearTransitionTimers();
    setShowLabels(false);
    setShowCards(false);

    const sideChanged = isLeftTire(key) !== isLeftTire(selectedKey);

    fadeTimer.current = window.setTimeout(() => {
      setSelectedKey(key);
      setShowLabels(true);
      navigate(`/app/tire/${key}`, { replace: true });

      cardTimer.current = window.setTimeout(() => {
        setShowCards(true);
      }, sideChanged ? layout.cardRevealDelayMs : 0);
    }, layout.fadeOutMs);
  };

  useEffect(() => () => clearTransitionTimers(), []);

  // Swipe between tires
  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.changedTouches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: TouchEvent) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start == null) return;
    const dx = (e.changedTouches[0]?.clientX ?? start) - start;
    const idx = TIRE_DETAIL_ALL_KEYS.indexOf(focusedKey);
    if (dx <= -48) {
      handleSelectTire(TIRE_DETAIL_ALL_KEYS[(idx + 1) % TIRE_DETAIL_ALL_KEYS.length]!);
    } else if (dx >= 48) {
      handleSelectTire(
        TIRE_DETAIL_ALL_KEYS[
          (idx - 1 + TIRE_DETAIL_ALL_KEYS.length) % TIRE_DETAIL_ALL_KEYS.length
        ]!,
      );
    }
  };

  const { pressure, heat, load, align, nut } = tireData;
  const metricRows = [
    [
      { title: 'Heat', m: heat, iconType: 'temperature' as const },
      { title: 'Load', m: load, iconType: 'weight' as const },
    ],
    [
      { title: 'Toe', m: align, iconType: 'align' as const },
      { title: 'Nut', m: nut, iconType: 'nut' as const },
    ],
  ];

  return (
    <div
      className="td-page"
      style={{
        background: `linear-gradient(180deg, rgba(255,255,255,0.5) 4%, rgba(255,255,255,0.5) 50%, ${STATUS_GRADIENT[tireData.status]} 100%)`,
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <TireDetailVehicleScene
        layout={layout}
        selectedKey={focusedKey}
        pan={pan}
        tireStatusByKey={tireStatusByKey}
      />

      {showBluetoothBlur ? (
        <>
          <div className="td-bt-blur" aria-hidden />
          <div className="td-bt-prompt-layer">
            <TireDetailBluetoothPrompt
              onConnectPress={() => sensorConnection.openSheet(selectedKey)}
            />
          </div>
        </>
      ) : null}

      <div className="td-foreground">
        <header className="td-header">
          <button
            type="button"
            className="td-header__btn"
            aria-label="Back"
            onClick={() => navigate('/app/home')}
          >
            <img src="/assets/icons/back.svg" alt="" width={42} height={42} />
          </button>
          <div className="td-header__right">
            <span className="td-header__btn">
              <img src={IMG.bluetooth} alt="" width={30} height={30} />
            </span>
            <span className="td-header__btn">
              <img src={IMG.notification} alt="" width={30} height={30} />
            </span>
          </div>
        </header>

        <div
          className={left ? 'td-content td-content--left' : 'td-content td-content--right'}
        >
          {showLabels ? (
            <>
              <p className="td-axle">{pos.axle}</p>
              <h1 className="td-side">{pos.side}</h1>

              {!showBluetoothBlur ? (
                <TireDetailStatusChip status={tireData.status} />
              ) : null}
            </>
          ) : null}

          {showCards && !showBluetoothBlur ? (
            <div
              className="td-cards"
              style={{ width: TIRE_DETAIL_PRESSURE_CARD_W }}
            >
              <TireDetailPressureCard
                value={pressure.value}
                gaugeMin={pressure.min}
                gaugeMax={pressure.max}
                unit={pressure.unit}
              />
              <div
                className="td-metric-grid"
                style={{ gap: TIRE_DETAIL_METRIC_GAP }}
              >
                {metricRows.map(row => (
                  <div
                    key={row.map(r => r.title).join('-')}
                    className="td-metric-row"
                    style={{ gap: TIRE_DETAIL_METRIC_GAP }}
                  >
                    {row.map(({ title, m, iconType }) => (
                      <TireDetailMetricCard
                        key={title}
                        title={title}
                        value={m.value}
                        unit={m.unit}
                        progress={m.value / m.max}
                        iconType={iconType}
                        animationKey={selectedKey}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="td-bottom">
        <div className="td-dots">
          {TIRE_DETAIL_ALL_KEYS.map((key, i) => (
            <span
              key={key}
              className={
                i === TIRE_DETAIL_ALL_KEYS.indexOf(focusedKey)
                  ? 'td-dots__item is-on'
                  : 'td-dots__item'
              }
            />
          ))}
        </div>
        <div className="td-bottom__sheet">
          <TireDetailSelector
            selected={focusedKey}
            onSelect={handleSelectTire}
            tireStatusByKey={tireStatusByKey}
          />
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
