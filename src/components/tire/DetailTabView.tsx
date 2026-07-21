import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_BY_TIRE, type TireKey } from '../../data/tireMocks';
import { useLiveSensorReading } from '../../hooks/useLiveSensorReading';
import {
  TIRE_DETAIL_BODY_MIN_HEIGHT,
  TIRE_DETAIL_CARD_CONFIGS,
  TIRE_DETAIL_CARD_INSET,
  TIRE_DETAIL_OUTER_CARD_OFFSET,
  TIRE_DETAIL_REAR_CAR_UP_OFFSET,
  TIRE_DETAIL_REAR_CHIP_GAP,
  TIRE_FRONT_LABEL_GAP,
  detailCardWidth,
  detailGaugeWidth,
  getDetailRowTop,
} from '../../tire/constants';
import { usePhoneWidth } from '../../tire/usePhoneWidth';
import { AxleSectionChip } from './AxleSectionChip';
import { CarBodyStack } from './CarBodyStack';
import { DetailMetricCard } from './DetailMetricCard';
import './DetailTabView.css';

type Props = {
  connected: ReadonlySet<TireKey>;
};

function positionStyle(
  row: 'front' | 'rearMid' | 'rearOuter',
  side: 'left' | 'right',
): CSSProperties {
  const top = getDetailRowTop(row);
  if (row === 'rearOuter') {
    return side === 'left'
      ? { left: TIRE_DETAIL_OUTER_CARD_OFFSET, top }
      : { right: TIRE_DETAIL_OUTER_CARD_OFFSET, top };
  }
  return side === 'left'
    ? { left: TIRE_DETAIL_CARD_INSET, top }
    : { right: TIRE_DETAIL_CARD_INSET, top };
}

const TEMP_PHASE: Partial<Record<TireKey, number>> = {
  LO: 1.2,
  RO: 2.7,
};

export function DetailTabView({ connected }: Props) {
  const navigate = useNavigate();
  const screenW = usePhoneWidth();
  const cardW = detailCardWidth(screenW);
  const gaugeW = detailGaugeWidth(screenW);

  const liveLoTemp = useLiveSensorReading(
    MOCK_BY_TIRE.LO.temp,
    connected.has('LO'),
    { phase: TEMP_PHASE.LO, amplitude: 1.1 },
  );
  const liveRoTemp = useLiveSensorReading(
    MOCK_BY_TIRE.RO.temp,
    connected.has('RO'),
    { phase: TEMP_PHASE.RO, amplitude: 1.1 },
  );

  const liveTempByKey: Partial<Record<TireKey, number>> = {
    LO: liveLoTemp,
    RO: liveRoTemp,
  };

  return (
    <div className="detail-tab">
      <div
        className="detail-tab__chip-wrap"
        style={{ marginBottom: TIRE_FRONT_LABEL_GAP }}
      >
        <AxleSectionChip label="FRONT" />
      </div>

      <div
        className="detail-tab__body"
        style={{ minHeight: TIRE_DETAIL_BODY_MIN_HEIGHT }}
      >
        <div className="detail-tab__cars" aria-hidden>
          <CarBodyStack
            showDivider
            rearCarUpOffset={TIRE_DETAIL_REAR_CAR_UP_OFFSET}
          />
        </div>

        {TIRE_DETAIL_CARD_CONFIGS.map(({ key, metric, row, side }) => {
          const tire = MOCK_BY_TIRE[key as TireKey];
          const isConnected = connected.has(key as TireKey);
          const value =
            metric === 'temp'
              ? (liveTempByKey[key as TireKey] ?? tire.temp)
              : tire.pressure;
          return (
            <DetailMetricCard
              key={`${key}-${metric}`}
              tireKey={key}
              metric={metric}
              status={isConnected ? tire.status : 'offline'}
              connected={isConnected}
              value={value}
              cardWidth={cardW}
              gaugeWidth={gaugeW}
              style={positionStyle(row, side)}
              onPress={() => navigate(`/app/tire/${key}`)}
            />
          );
        })}
      </div>

      <div
        className="detail-tab__chip-wrap"
        style={{ marginTop: TIRE_DETAIL_REAR_CHIP_GAP }}
      >
        <AxleSectionChip label="REAR" />
      </div>
    </div>
  );
}
