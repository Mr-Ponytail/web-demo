import type { TireStatus } from '../../data/tireMocks';
import {
  TIRE_DETAIL_GAUGE_H,
  TIRE_DETAIL_GAUGE_OFFSET_Y,
  TIRE_DETAIL_GAUGE_TRACK_BOTTOM,
  TIRE_DETAIL_GAUGE_WRAP_H,
  TIRE_DETAIL_INDICATOR_OFFSET_Y,
  TIRE_DETAIL_INDICATOR_SIZE,
} from '../../tire/constants';
import './DetailGaugeBar.css';

const GAUGE = {
  normal: '/assets/images/normal-gauge.png',
  caution: '/assets/images/caution-gauge.png',
  danger: '/assets/images/danger-gauge.png',
} as const;

const INDICATOR = {
  normal: '/assets/images/normal-indicator.png',
  caution: '/assets/images/caution-indicator.png',
  danger: '/assets/images/danger-indicator.png',
} as const;

type Props = {
  status: TireStatus;
  progress: number;
  offline: boolean;
  gaugeWidth: number;
};

export function DetailGaugeBar({
  status,
  progress,
  offline,
  gaugeWidth,
}: Props) {
  const visual = status === 'offline' ? 'normal' : status;
  const indicatorLeft =
    progress * (gaugeWidth - TIRE_DETAIL_INDICATOR_SIZE);

  return (
    <div
      className="detail-gauge"
      style={{
        width: gaugeWidth,
        height: TIRE_DETAIL_GAUGE_WRAP_H,
        marginTop: TIRE_DETAIL_GAUGE_OFFSET_Y,
      }}
    >
      <img
        className={offline ? 'detail-gauge__track is-offline' : 'detail-gauge__track'}
        src={GAUGE[visual]}
        alt=""
        style={{
          width: gaugeWidth,
          height: TIRE_DETAIL_GAUGE_H,
          bottom: TIRE_DETAIL_GAUGE_TRACK_BOTTOM,
        }}
      />
      <img
        className={
          offline ? 'detail-gauge__indicator is-offline' : 'detail-gauge__indicator'
        }
        src={INDICATOR[visual]}
        alt=""
        style={{
          left: indicatorLeft,
          top: TIRE_DETAIL_INDICATOR_OFFSET_Y,
          width: TIRE_DETAIL_INDICATOR_SIZE,
          height: TIRE_DETAIL_INDICATOR_SIZE,
        }}
      />
    </div>
  );
}
