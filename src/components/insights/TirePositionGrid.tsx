import { IMG } from '../../assets';
import {
  GRID_BOTTOM_ROW,
  GRID_TOP_ROW,
  TIRE_SLOT_GRID_LABELS,
  type TireSlotKey,
} from '../../data/tireSlotGrid';
import './TirePositionGrid.css';

const GRID_HEIGHT = 153;

type TirePositionGridProps = {
  selectedKey: TireSlotKey;
  onSelect: (key: TireSlotKey) => void;
  className?: string;
};

export function TirePositionGrid({
  selectedKey,
  onSelect,
  className,
}: TirePositionGridProps) {
  const renderCell = (key: TireSlotKey, front?: boolean) => {
    const selected = selectedKey === key;
    return (
      <button
        key={key}
        type="button"
        className={
          front
            ? selected
              ? 'tire-pos-grid__cell tire-pos-grid__cell--front tire-pos-grid__cell--selected'
              : 'tire-pos-grid__cell tire-pos-grid__cell--front'
            : selected
              ? 'tire-pos-grid__cell tire-pos-grid__cell--selected'
              : 'tire-pos-grid__cell'
        }
        onClick={() => onSelect(key)}
      >
        {TIRE_SLOT_GRID_LABELS[key]}
      </button>
    );
  };

  return (
    <div
      className={className ? `tire-pos-grid ${className}` : 'tire-pos-grid'}
      style={{ height: GRID_HEIGHT }}
    >
      <div className="tire-pos-grid__front-car" aria-hidden>
        <img src={IMG.frontCar} alt="" />
      </div>
      <div className="tire-pos-grid__rear-car" aria-hidden>
        <img src={IMG.rearCar} alt="" />
      </div>

      <i className="tire-pos-grid__col-div tire-pos-grid__col-div--front" />
      <i className="tire-pos-grid__col-div tire-pos-grid__col-div--rear" />
      <i className="tire-pos-grid__row-div tire-pos-grid__row-div--front" />
      <i className="tire-pos-grid__row-div tire-pos-grid__row-div--rear" />

      <div className="tire-pos-grid__row">
        {GRID_TOP_ROW.map((key, index) => renderCell(key, index === 0))}
      </div>
      <div className="tire-pos-grid__row">
        {GRID_BOTTOM_ROW.map((key, index) => renderCell(key, index === 0))}
      </div>
    </div>
  );
}
