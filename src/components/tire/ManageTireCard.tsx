import { IMG } from '../../assets';
import {
  TIRE_CARD_LABEL_HEIGHT,
  TIRE_CARD_PAD_TOP,
  TIRE_CONNECTED_CARD_H,
  TIRE_CONNECTED_CARD_W,
  TIRE_UNCONNECTED_CARD_BORDER_RADIUS,
  TIRE_UNCONNECTED_ICON_GAP,
  TIRE_UNCONNECTED_ICON_SCAN_GAP,
  TIRE_UNCONNECTED_ICON_SIZE,
  TIRE_UNCONNECTED_SCAN_BTN_H,
} from '../../tire/constants';
import './ManageTireCard.css';

type Props = {
  label: string;
  offsetTop?: number;
  tireCode?: string | null;
  onAdd?: () => void;
};

export function ManageTireCard({
  label,
  offsetTop = 0,
  tireCode,
  onAdd,
}: Props) {
  const isRegistered = Boolean(tireCode);
  const contentTop =
    TIRE_CARD_PAD_TOP + TIRE_CARD_LABEL_HEIGHT + TIRE_UNCONNECTED_ICON_GAP;

  return (
    <div
      className={
        isRegistered
          ? 'manage-tire-card manage-tire-card--registered'
          : 'manage-tire-card'
      }
      style={{
        width: TIRE_CONNECTED_CARD_W,
        height: TIRE_CONNECTED_CARD_H,
        marginTop: offsetTop || undefined,
        borderRadius: TIRE_UNCONNECTED_CARD_BORDER_RADIUS,
      }}
    >
      <div
        className="manage-tire-card__label"
        style={{ top: TIRE_CARD_PAD_TOP, height: TIRE_CARD_LABEL_HEIGHT }}
      >
        {label}
      </div>

      <div
        className={
          isRegistered
            ? 'manage-tire-card__content manage-tire-card__content--center'
            : 'manage-tire-card__content'
        }
        style={isRegistered ? undefined : { top: contentTop }}
      >
        {isRegistered ? (
          <span className="manage-tire-card__code">{tireCode}</span>
        ) : (
          <img
            src={IMG.tireButton}
            alt=""
            width={TIRE_UNCONNECTED_ICON_SIZE}
            height={TIRE_UNCONNECTED_ICON_SIZE}
          />
        )}
      </div>

      <div
        className="manage-tire-card__cta-wrap"
        style={{
          top:
            contentTop +
            TIRE_UNCONNECTED_ICON_SIZE +
            TIRE_UNCONNECTED_ICON_SCAN_GAP,
        }}
      >
        <button
          type="button"
          className="manage-tire-card__cta"
          style={{ height: TIRE_UNCONNECTED_SCAN_BTN_H }}
          onClick={onAdd}
        >
          {isRegistered ? 'Edit' : 'Add'}
        </button>
      </div>
    </div>
  );
}
