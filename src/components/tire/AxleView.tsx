import { useNavigate } from 'react-router-dom';
import type { TireKey, TireStatus } from '../../data/tireMocks';
import { MOCK_BY_TIRE } from '../../data/tireMocks';
import {
  TIRE_AXLE_BODY_MIN_HEIGHT,
  TIRE_AXLE_FRONT_TIRE_GAP,
  TIRE_AXLE_REAR_INNER_OFFSET,
  TIRE_AXLE_REAR_SIDE_MARGIN,
  TIRE_FRONT_LABEL_GAP,
  TIRE_FRONT_TIRE_UP_OFFSET,
  TIRE_REAR_CAR_TOP,
  TIRE_REAR_CHIP_GAP,
  TIRE_REAR_INNER_TIRE_UP_OFFSET,
  TIRE_REAR_OUTER_TIRE_OFFSET,
  TIRE_REAR_TIRE_DOWN_OFFSET,
} from '../../tire/constants';
import { AxleSectionChip } from './AxleSectionChip';
import { CarBodyStack } from './CarBodyStack';
import { ConnectedTireCard, UnconnectedTireCard } from './TireCards';
import './AxleView.css';

type Props = {
  connected?: ReadonlySet<TireKey>;
};

function AxleTire({
  tireKey,
  offsetTop = 0,
  connected,
  onPress,
}: {
  tireKey: TireKey;
  offsetTop?: number;
  connected: boolean;
  onPress: (key: TireKey) => void;
}) {
  const status: TireStatus = MOCK_BY_TIRE[tireKey].status;
  if (!connected) {
    return <UnconnectedTireCard tireKey={tireKey} offsetTop={offsetTop} />;
  }
  return (
    <ConnectedTireCard
      tireKey={tireKey}
      status={status}
      offsetTop={offsetTop}
      onPress={onPress}
    />
  );
}

export function AxleView({ connected }: Props) {
  const navigate = useNavigate();
  const connectedSet =
    connected ?? new Set<TireKey>(['FL', 'FR', 'LI', 'RI', 'LO', 'RO']);
  const openDetail = (key: TireKey) => navigate(`/app/tire/${key}`);

  return (
    <div className="axle-view">
      <div
        className="axle-view__chip-wrap"
        style={{ marginBottom: TIRE_FRONT_LABEL_GAP }}
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
            <AxleTire
              tireKey="FL"
              connected={connectedSet.has('FL')}
              onPress={openDetail}
            />
            <AxleTire
              tireKey="FR"
              connected={connectedSet.has('FR')}
              onPress={openDetail}
            />
          </div>
        </div>

        <div
          className="axle-view__rear"
          style={{ top: TIRE_REAR_CAR_TOP + TIRE_REAR_TIRE_DOWN_OFFSET }}
        >
          <div
            className="axle-view__rear-slot"
            style={{ left: TIRE_AXLE_REAR_SIDE_MARGIN }}
          >
            <AxleTire
              tireKey="LO"
              offsetTop={TIRE_REAR_OUTER_TIRE_OFFSET}
              connected={connectedSet.has('LO')}
              onPress={openDetail}
            />
          </div>
          <div
            className="axle-view__rear-slot"
            style={{ left: TIRE_AXLE_REAR_INNER_OFFSET }}
          >
            <AxleTire
              tireKey="LI"
              offsetTop={TIRE_REAR_INNER_TIRE_UP_OFFSET}
              connected={connectedSet.has('LI')}
              onPress={openDetail}
            />
          </div>
          <div
            className="axle-view__rear-slot"
            style={{ right: TIRE_AXLE_REAR_INNER_OFFSET }}
          >
            <AxleTire
              tireKey="RI"
              offsetTop={TIRE_REAR_INNER_TIRE_UP_OFFSET}
              connected={connectedSet.has('RI')}
              onPress={openDetail}
            />
          </div>
          <div
            className="axle-view__rear-slot"
            style={{ right: TIRE_AXLE_REAR_SIDE_MARGIN }}
          >
            <AxleTire
              tireKey="RO"
              offsetTop={TIRE_REAR_OUTER_TIRE_OFFSET}
              connected={connectedSet.has('RO')}
              onPress={openDetail}
            />
          </div>
        </div>
      </div>

      <div
        className="axle-view__chip-wrap"
        style={{ marginTop: TIRE_REAR_CHIP_GAP }}
      >
        <AxleSectionChip label="REAR" />
      </div>
    </div>
  );
}
