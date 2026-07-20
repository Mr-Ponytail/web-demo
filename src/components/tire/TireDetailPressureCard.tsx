import { IMG } from '../../assets';
import {
  TIRE_DETAIL_PRESSURE_CARD_W,
  TIRE_DETAIL_PRESSURE_GAUGE_H,
  TIRE_DETAIL_PRESSURE_PIN_GAUGE_OVERLAP,
  TIRE_DETAIL_PRESSURE_PIN_OFFSET_Y,
  TIRE_DETAIL_PRESSURE_PIN_SIZE,
  TIRE_DETAIL_PRESSURE_TICK_POSITIONS,
  TIRE_DETAIL_PRESSURE_TICK_TOP,
  getPressureGaugeStatus,
} from '../../tire/detailConstants';
import './TireDetailPressureCard.css';

type Props = {
  value: number;
  gaugeMin: number;
  gaugeMax: number;
  unit: string;
};

export function TireDetailPressureCard({
  value,
  gaugeMin,
  gaugeMax,
  unit,
}: Props) {
  const range = gaugeMax - gaugeMin;
  const progress = Math.min(1, Math.max(0, (value - gaugeMin) / range));
  const pinStatus = getPressureGaugeStatus(progress);
  const pinSrc = IMG.pressurePin[pinStatus];
  const padTop =
    TIRE_DETAIL_PRESSURE_PIN_SIZE -
    TIRE_DETAIL_PRESSURE_PIN_GAUGE_OVERLAP +
    TIRE_DETAIL_PRESSURE_PIN_OFFSET_Y;

  return (
    <div
      className="td-pressure-card"
      style={{ width: TIRE_DETAIL_PRESSURE_CARD_W }}
    >
      <div className="td-pressure-card__header">
        <span className="td-pressure-card__label">Pressure</span>
        <span className="td-pressure-card__val">
          {Math.round(value)} {unit}
        </span>
      </div>
      <div className="td-pressure-card__gauge" style={{ paddingTop: padTop }}>
        <div
          className="td-pressure-card__track"
          style={{ height: TIRE_DETAIL_PRESSURE_GAUGE_H }}
        >
          <img
            className="td-pressure-card__img"
            src={IMG.pressureGauge}
            alt=""
            style={{ height: TIRE_DETAIL_PRESSURE_GAUGE_H }}
          />
          {TIRE_DETAIL_PRESSURE_TICK_POSITIONS.map(pos => (
            <span
              key={pos}
              className="td-pressure-card__tick"
              style={{
                left: `${pos * 100}%`,
                top: TIRE_DETAIL_PRESSURE_TICK_TOP,
              }}
            />
          ))}
          <span
            className="td-pressure-card__pin"
            style={{
              left: `${progress * 100}%`,
              bottom: TIRE_DETAIL_PRESSURE_PIN_OFFSET_Y,
              marginLeft: -TIRE_DETAIL_PRESSURE_PIN_SIZE / 2,
            }}
          >
            <img
              src={pinSrc}
              alt=""
              width={TIRE_DETAIL_PRESSURE_PIN_SIZE}
              height={TIRE_DETAIL_PRESSURE_PIN_SIZE}
            />
          </span>
        </div>
      </div>
    </div>
  );
}
