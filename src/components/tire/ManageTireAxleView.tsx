import type { TireSlotKey } from '../../data/tireSlotGrid';
import { TIRE_SLOT_GRID_LABELS } from '../../data/tireSlotGrid';
import {
  TIRE_AXLE_BODY_MIN_HEIGHT,
  TIRE_AXLE_FRONT_TIRE_GAP,
  TIRE_AXLE_REAR_INNER_OFFSET,
  TIRE_AXLE_REAR_SIDE_MARGIN,
  TIRE_FRONT_TIRE_UP_OFFSET,
  TIRE_REAR_CAR_TOP,
  TIRE_REAR_INNER_TIRE_UP_OFFSET,
  TIRE_REAR_OUTER_TIRE_OFFSET,
} from '../../tire/constants';
import { AxleSectionChip } from './AxleSectionChip';
import { CarBodyStack } from './CarBodyStack';
import { ManageTireCard } from './ManageTireCard';
import './AxleView.css';
import './ManageTireAxleView.css';

/** Manage screen uses slightly different spacing than Home axle. */
const MANAGE_FRONT_LABEL_GAP = 72;
const MANAGE_REAR_TIRE_DOWN_OFFSET = 42;

type Props = {
  onAdd?: (key: TireSlotKey) => void;
  tireCodes?: Partial<Record<TireSlotKey, string>>;
};

export function ManageTireAxleView({ onAdd, tireCodes }: Props) {
  return (
    <div className="manage-axle">
      <div
        className="axle-view__chip-wrap"
        style={{ marginBottom: MANAGE_FRONT_LABEL_GAP }}
      >
        <AxleSectionChip label="FRONT" />
      </div>

      <div
        className="axle-view__body"
        style={{ minHeight: TIRE_AXLE_BODY_MIN_HEIGHT }}
      >
        <div className="axle-view__cars" aria-hidden>
          <CarBodyStack showDivider={false} />
        </div>

        <div
          className="axle-view__front"
          style={{ top: TIRE_FRONT_TIRE_UP_OFFSET }}
        >
          <div
            className="axle-view__front-row"
            style={{ gap: TIRE_AXLE_FRONT_TIRE_GAP }}
          >
            <ManageTireCard
              label={TIRE_SLOT_GRID_LABELS.FL}
              tireCode={tireCodes?.FL}
              onAdd={() => onAdd?.('FL')}
            />
            <ManageTireCard
              label={TIRE_SLOT_GRID_LABELS.FR}
              tireCode={tireCodes?.FR}
              onAdd={() => onAdd?.('FR')}
            />
          </div>
        </div>

        <div
          className="axle-view__rear"
          style={{ top: TIRE_REAR_CAR_TOP + MANAGE_REAR_TIRE_DOWN_OFFSET }}
        >
          <div
            className="axle-view__rear-slot"
            style={{ left: TIRE_AXLE_REAR_SIDE_MARGIN }}
          >
            <ManageTireCard
              label={TIRE_SLOT_GRID_LABELS.LO}
              tireCode={tireCodes?.LO}
              offsetTop={TIRE_REAR_OUTER_TIRE_OFFSET}
              onAdd={() => onAdd?.('LO')}
            />
          </div>
          <div
            className="axle-view__rear-slot"
            style={{ left: TIRE_AXLE_REAR_INNER_OFFSET }}
          >
            <ManageTireCard
              label={TIRE_SLOT_GRID_LABELS.LI}
              tireCode={tireCodes?.LI}
              offsetTop={TIRE_REAR_INNER_TIRE_UP_OFFSET}
              onAdd={() => onAdd?.('LI')}
            />
          </div>
          <div
            className="axle-view__rear-slot"
            style={{ right: TIRE_AXLE_REAR_INNER_OFFSET }}
          >
            <ManageTireCard
              label={TIRE_SLOT_GRID_LABELS.RI}
              tireCode={tireCodes?.RI}
              offsetTop={TIRE_REAR_INNER_TIRE_UP_OFFSET}
              onAdd={() => onAdd?.('RI')}
            />
          </div>
          <div
            className="axle-view__rear-slot"
            style={{ right: TIRE_AXLE_REAR_SIDE_MARGIN }}
          >
            <ManageTireCard
              label={TIRE_SLOT_GRID_LABELS.RO}
              tireCode={tireCodes?.RO}
              offsetTop={TIRE_REAR_OUTER_TIRE_OFFSET}
              onAdd={() => onAdd?.('RO')}
            />
          </div>
        </div>
      </div>

      <div className="manage-axle__rear-chip">
        <AxleSectionChip label="REAR" />
      </div>
    </div>
  );
}
