import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_BY_TIRE, type TireKey } from '../../data/tireMocks';
import {
  TIRE_DETAIL_BODY_MIN_HEIGHT,
  TIRE_DETAIL_CARD_CONFIGS,
  TIRE_DETAIL_CARD_INSET,
  TIRE_DETAIL_OUTER_CARD_OFFSET,
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

export function DetailTabView() {
  const navigate = useNavigate();
  const screenW = usePhoneWidth();
  const cardW = detailCardWidth(screenW);
  const gaugeW = detailGaugeWidth(screenW);

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
          <CarBodyStack showDivider />
        </div>

        {TIRE_DETAIL_CARD_CONFIGS.map(({ key, metric, row, side }) => {
          const tire = MOCK_BY_TIRE[key as TireKey];
          const value = metric === 'pressure' ? tire.pressure : tire.temp;
          return (
            <DetailMetricCard
              key={`${key}-${metric}`}
              tireKey={key}
              metric={metric}
              status={tire.status}
              connected
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
