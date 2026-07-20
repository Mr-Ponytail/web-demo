import { IMG } from '../../assets';
import {
  TIRE_DETAIL_GAUGE_SIZE,
  TIRE_DETAIL_METRIC_CARD_H,
  TIRE_DETAIL_METRIC_CARD_W,
  TIRE_DETAIL_METRIC_ICON_SIZE,
  getMetricLevel,
  type MetricLevel,
} from '../../tire/detailConstants';
import { TireDetailCircularGauge } from './TireDetailCircularGauge';
import './TireDetailMetricCard.css';

export type MetricIconType = 'align' | 'nut' | 'temperature' | 'weight';

type Props = {
  title: string;
  value: number;
  unit: string;
  progress: number;
  iconType: MetricIconType;
  animationKey?: string;
};

function iconFor(type: MetricIconType, level: MetricLevel): string {
  return IMG.metricIcon[type][level];
}

export function TireDetailMetricCard({
  title,
  value,
  unit,
  progress,
  iconType,
  animationKey,
}: Props) {
  const level = getMetricLevel(progress);
  return (
    <div
      className="td-metric-card"
      style={{
        width: TIRE_DETAIL_METRIC_CARD_W,
        height: TIRE_DETAIL_METRIC_CARD_H,
      }}
    >
      <div className="td-metric-card__title">{title}</div>
      <div
        className="td-metric-card__gauge"
        style={{ height: TIRE_DETAIL_GAUGE_SIZE }}
      >
        <TireDetailCircularGauge
          progress={progress}
          iconSrc={iconFor(iconType, level)}
          iconSize={TIRE_DETAIL_METRIC_ICON_SIZE}
          animationKey={animationKey}
        />
      </div>
      <div className="td-metric-card__value">
        {Math.round(value)}
        {unit}
      </div>
    </div>
  );
}
