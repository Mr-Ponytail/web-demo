import type { CSSProperties } from 'react';
import { IMG } from '../../assets';
import type { TireKey, TireStatus } from '../../data/tireMocks';
import {
  TIRE_CHEVRON_SIZE,
  TIRE_DETAIL_CARD_H,
  TIRE_DETAIL_CARD_PAD_H,
  TIRE_DETAIL_INACTIVE_OPACITY,
  TIRE_DETAIL_VALUE_ABOVE_GAUGE,
  TIRE_DETAIL_VALUE_OFFSET_Y,
  TIRE_POSITION_LABELS,
  TIRE_TEMP_DISPLAY_TARGET,
  getGaugeProgress,
} from '../../tire/constants';
import {
  STATUS_DOT_COLOR,
  STATUS_VALUE_COLOR,
  tireStatusColors,
} from '../../tire/statusColors';
import { DetailGaugeBar } from './DetailGaugeBar';
import './DetailMetricCard.css';

type Props = {
  tireKey: TireKey;
  metric: 'pressure' | 'temp';
  status: TireStatus;
  connected: boolean;
  value: number;
  cardWidth: number;
  gaugeWidth: number;
  style: CSSProperties;
  onPress?: () => void;
};

export function DetailMetricCard({
  tireKey,
  metric,
  status,
  connected,
  value,
  cardWidth,
  gaugeWidth,
  style,
  onPress,
}: Props) {
  const inactive = !connected;
  const unit = metric === 'pressure' ? 'PSI' : '°C';
  const label = metric === 'pressure' ? 'Pressure' : 'Temp';
  const progress = connected ? getGaugeProgress(metric, value) : 0;
  const displayValue = connected ? value.toFixed(1) : '--';
  const showStatusDot = status === 'danger' || status === 'caution';
  const tempDelta =
    unit === '°C' && connected && value > TIRE_TEMP_DISPLAY_TARGET
      ? Math.round(value - TIRE_TEMP_DISPLAY_TARGET)
      : undefined;
  const showAlertBadge = status === 'danger' || status === 'caution';
  const alertBadgeText =
    tempDelta !== undefined && tempDelta > 0 ? `+${tempDelta}` : '+2';
  const alertColor = status === 'caution' ? '#F48200' : '#E52222';

  return (
    <div className="detail-metric-pos" style={style}>
      <button
        type="button"
        className="detail-metric-card"
        onClick={onPress}
        style={{
          width: cardWidth,
          height: TIRE_DETAIL_CARD_H,
          paddingLeft: TIRE_DETAIL_CARD_PAD_H,
          paddingRight: TIRE_DETAIL_CARD_PAD_H,
          borderColor: tireStatusColors.detailCardBorder[status],
          backgroundColor: tireStatusColors.detailCardBg[status],
          opacity: inactive ? TIRE_DETAIL_INACTIVE_OPACITY : 1,
        }}
      >
        <div className="detail-metric-card__header">
          <span className="detail-metric-card__key">
            {TIRE_POSITION_LABELS[tireKey]}
          </span>
          <span className="detail-metric-card__header-right">
            {showAlertBadge ? (
              <span
                className="detail-metric-card__badge"
                style={{
                  color: alertColor,
                  backgroundColor: `${alertColor}1F`,
                }}
              >
                {alertBadgeText}
              </span>
            ) : null}
            <img
              src={IMG.chevron}
              alt=""
              width={TIRE_CHEVRON_SIZE}
              height={TIRE_CHEVRON_SIZE}
            />
          </span>
        </div>

        <div className="detail-metric-card__label-row">
          {showStatusDot && STATUS_DOT_COLOR[status] ? (
            <span
              className="detail-metric-card__dot"
              style={{ background: STATUS_DOT_COLOR[status] }}
            />
          ) : null}
          <span className="detail-metric-card__label">{label}</span>
        </div>

        <div
          className="detail-metric-card__value-row"
          style={{
            marginTop: TIRE_DETAIL_VALUE_OFFSET_Y,
            marginBottom: TIRE_DETAIL_VALUE_ABOVE_GAUGE,
          }}
        >
          <span
            className="detail-metric-card__value"
            style={{ color: STATUS_VALUE_COLOR[status] }}
          >
            {displayValue}
          </span>
          {connected ? (
            <span className="detail-metric-card__unit">{unit}</span>
          ) : null}
        </div>

        <DetailGaugeBar
          status={status}
          progress={progress}
          offline={inactive}
          gaugeWidth={gaugeWidth}
        />
      </button>
    </div>
  );
}
