import { TIRE_SLOT_GRID_LABELS, type TireSlotKey } from '../../data/tireSlotGrid';
import './TirePositionBadge.css';

type BadgeVariant = 'list' | 'management' | 'unconnected';

type Props = {
  tireKey: TireSlotKey;
  variant: BadgeVariant;
};

export function TirePositionBadge({ tireKey, variant }: Props) {
  return (
    <span className={`tire-pos-badge tire-pos-badge--${variant}`}>
      {TIRE_SLOT_GRID_LABELS[tireKey]}
    </span>
  );
}
