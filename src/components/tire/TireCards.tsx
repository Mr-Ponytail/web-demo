import { IMG, TIRE_IMG } from '../../assets';
import type { TireKey, TireStatus } from '../../data/tireMocks';
import {
  TIRE_CARD_LABEL_GAP,
  TIRE_CARD_LABEL_HEIGHT,
  TIRE_CARD_PAD_TOP,
  TIRE_CHEVRON_SIZE,
  TIRE_CONNECTED_CARD_H,
  TIRE_CONNECTED_CARD_W,
  TIRE_H,
  TIRE_POSITION_LABELS,
  TIRE_UNCONNECTED_CARD_BORDER_RADIUS,
  TIRE_UNCONNECTED_ICON_GAP,
  TIRE_UNCONNECTED_ICON_SCAN_GAP,
  TIRE_UNCONNECTED_ICON_SIZE,
  TIRE_UNCONNECTED_SCAN_BTN_H,
  TIRE_W,
} from '../../tire/constants';
import { tireStatusColors } from '../../tire/statusColors';
import './TireCards.css';

type ConnectedProps = {
  tireKey: TireKey;
  status: TireStatus;
  offsetTop?: number;
  onPress?: (tireKey: TireKey) => void;
};

export function ConnectedTireCard({
  tireKey,
  status,
  offsetTop = 0,
  onPress,
}: ConnectedProps) {
  const label = TIRE_POSITION_LABELS[tireKey];
  return (
    <button
      type="button"
      className="tire-card tire-card--connected"
      onClick={() => onPress?.(tireKey)}
      style={{
        width: TIRE_CONNECTED_CARD_W,
        height: TIRE_CONNECTED_CARD_H,
        marginTop: offsetTop || undefined,
        backgroundColor: tireStatusColors.cardBg[status],
        borderColor: tireStatusColors.cardBorder[status],
        borderRadius: TIRE_UNCONNECTED_CARD_BORDER_RADIUS,
      }}
    >
      <div
        className="tire-card__label-row"
        style={{ top: TIRE_CARD_PAD_TOP, height: TIRE_CARD_LABEL_HEIGHT }}
      >
        <span
          className="tire-card__label"
          style={{ color: tireStatusColors.label[status], lineHeight: `${TIRE_CARD_LABEL_HEIGHT}px` }}
        >
          {label}
        </span>
        <span className="tire-card__chevron" style={{ height: TIRE_CARD_LABEL_HEIGHT }}>
          <img src={IMG.chevron} alt="" width={TIRE_CHEVRON_SIZE} height={TIRE_CHEVRON_SIZE} />
        </span>
      </div>
      <div
        className="tire-card__shape"
        style={{
          top: TIRE_CARD_PAD_TOP + TIRE_CARD_LABEL_HEIGHT + TIRE_CARD_LABEL_GAP,
          left: (TIRE_CONNECTED_CARD_W - TIRE_W) / 2,
          width: TIRE_W,
          height: TIRE_H,
        }}
      >
        <img
          src={TIRE_IMG[status === 'offline' ? 'normal' : status]}
          alt=""
          width={TIRE_W}
          height={TIRE_H}
          style={{ opacity: status === 'offline' ? 0.25 : 1 }}
        />
      </div>
    </button>
  );
}

type UnconnectedProps = {
  tireKey: TireKey;
  offsetTop?: number;
  onScan?: (tireKey: TireKey) => void;
};

export function UnconnectedTireCard({ tireKey, offsetTop = 0, onScan }: UnconnectedProps) {
  const label = TIRE_POSITION_LABELS[tireKey];
  return (
    <div
      className="tire-card tire-card--unconnected"
      style={{
        width: TIRE_CONNECTED_CARD_W,
        height: TIRE_CONNECTED_CARD_H,
        marginTop: offsetTop || undefined,
        backgroundColor: tireStatusColors.unconnectedCardBg,
        borderRadius: TIRE_UNCONNECTED_CARD_BORDER_RADIUS,
      }}
    >
      <svg
        className="tire-card__dash"
        width={TIRE_CONNECTED_CARD_W}
        height={TIRE_CONNECTED_CARD_H}
        aria-hidden
      >
        <rect
          x={0.5}
          y={0.5}
          width={TIRE_CONNECTED_CARD_W - 1}
          height={TIRE_CONNECTED_CARD_H - 1}
          rx={8}
          ry={8}
          fill="none"
          stroke="#69A5FF"
          strokeWidth={1}
          strokeDasharray="2.5 2"
        />
      </svg>
      <div
        className="tire-card__label-row tire-card__label-row--solo"
        style={{ top: TIRE_CARD_PAD_TOP, height: TIRE_CARD_LABEL_HEIGHT }}
      >
        <span
          className="tire-card__label"
          style={{ color: '#005EAD', lineHeight: `${TIRE_CARD_LABEL_HEIGHT}px` }}
        >
          {label}
        </span>
      </div>
      <div
        className="tire-card__bt"
        style={{
          top:
            TIRE_CARD_PAD_TOP +
            TIRE_CARD_LABEL_HEIGHT +
            TIRE_UNCONNECTED_ICON_GAP,
        }}
      >
        <img
          src="/assets/icons/bluetooth-button.svg"
          alt=""
          width={TIRE_UNCONNECTED_ICON_SIZE}
          height={TIRE_UNCONNECTED_ICON_SIZE}
        />
      </div>
      <div
        className="tire-card__scan-wrap"
        style={{
          top:
            TIRE_CARD_PAD_TOP +
            TIRE_CARD_LABEL_HEIGHT +
            TIRE_UNCONNECTED_ICON_GAP +
            TIRE_UNCONNECTED_ICON_SIZE +
            TIRE_UNCONNECTED_ICON_SCAN_GAP,
        }}
      >
        <button
          type="button"
          className="tire-card__scan"
          style={{ height: TIRE_UNCONNECTED_SCAN_BTN_H }}
          onClick={() => onScan?.(tireKey)}
        >
          Scan
        </button>
      </div>
    </div>
  );
}
