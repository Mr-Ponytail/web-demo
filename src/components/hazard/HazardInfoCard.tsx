import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { IMG } from '../../assets';
import {
  HAZARD_INFO_CARD_DETAIL_FADE_DURATION_MS,
  HAZARD_INFO_CARD_EXPAND_DURATION_MS,
} from '../../hazard/constants';
import './HazardInfoCard.css';

const AI_INSIGHT_DETAIL =
  'Repeated impacts across multiple wheels indicate a structural road hazard ' +
  'here. Reporting this to the DOT can help secure the route and prevent ' +
  'future tire damage.';

const INNER_PADDING_X = 28;
const INNER_PADDING_Y = 24;

type CardSize = {
  width: number;
  height: number;
};

function getExpandedWidth(card: HTMLElement) {
  const parent = card.offsetParent as HTMLElement | null;
  if (parent) {
    return Math.max(0, parent.clientWidth - 32);
  }
  return Math.max(0, window.innerWidth - 32);
}

export function HazardInfoCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const expandedMeasureRef = useRef<HTMLDivElement>(null);
  const pendingStartRef = useRef<CardSize | null>(null);
  const sizesRef = useRef<{ collapsed: CardSize; expanded: CardSize }>({
    collapsed: { width: 0, height: 0 },
    expanded: { width: 0, height: 0 },
  });

  const [expanded, setExpanded] = useState(false);
  const [cardSize, setCardSize] = useState<CardSize | null>(null);

  const syncSizes = useCallback(() => {
    const card = cardRef.current;
    const header = headerRef.current;
    const expandedMeasure = expandedMeasureRef.current;
    if (!card || !header || !expandedMeasure) {
      return;
    }

    const expandedWidth = getExpandedWidth(card);
    expandedMeasure.style.width = `${expandedWidth}px`;

    sizesRef.current = {
      collapsed: {
        width: Math.ceil(header.offsetWidth + INNER_PADDING_X),
        height: Math.ceil(header.offsetHeight + INNER_PADDING_Y),
      },
      expanded: {
        width: expandedWidth,
        height: Math.ceil(expandedMeasure.offsetHeight),
      },
    };
  }, []);

  useLayoutEffect(() => {
    syncSizes();
    window.addEventListener('resize', syncSizes);
    return () => window.removeEventListener('resize', syncSizes);
  }, [syncSizes]);

  useLayoutEffect(() => {
    syncSizes();

    const target = expanded
      ? sizesRef.current.expanded
      : sizesRef.current.collapsed;
    const start = pendingStartRef.current;
    pendingStartRef.current = null;

    if (start) {
      setCardSize(start);
      requestAnimationFrame(() => {
        setCardSize(target);
      });
      return;
    }

    setCardSize(target);
  }, [expanded, syncSizes]);

  const handleToggle = () => {
    const card = cardRef.current;
    if (card) {
      pendingStartRef.current = {
        width: card.offsetWidth,
        height: card.offsetHeight,
      };
    }
    setExpanded(value => !value);
  };

  const cardStyle = {
    ...(cardSize
      ? {
          width: `${cardSize.width}px`,
          height: `${cardSize.height}px`,
        }
      : {}),
    '--hazard-info-expand-duration': `${HAZARD_INFO_CARD_EXPAND_DURATION_MS}ms`,
    '--hazard-info-fade-duration': `${HAZARD_INFO_CARD_DETAIL_FADE_DURATION_MS}ms`,
  } as CSSProperties;

  return (
    <div
      ref={cardRef}
      className={
        expanded ? 'hazard-info-card hazard-info-card--expanded' : 'hazard-info-card'
      }
      style={cardStyle}
    >
      <div
        ref={expandedMeasureRef}
        className="hazard-info-card__expanded-measure"
        aria-hidden
      >
        <div className="hazard-info-card__inner">
          <div className="hazard-info-card__header hazard-info-card__header--measure">
            <img src={IMG.aiInsight} alt="" width={24} height={24} />
            <span className="hazard-info-card__title">AI Insight</span>
            <span className="hazard-info-card__chevron-spacer" />
          </div>
          <p className="hazard-info-card__detail">{AI_INSIGHT_DETAIL}</p>
        </div>
      </div>

      <div className="hazard-info-card__inner">
        <div ref={headerRef} className="hazard-info-card__header">
          <img src={IMG.aiInsight} alt="" width={24} height={24} />
          <span className="hazard-info-card__title">AI Insight</span>
          <button
            type="button"
            className={
              expanded
                ? 'hazard-info-card__chevron hazard-info-card__chevron--expanded'
                : 'hazard-info-card__chevron'
            }
            aria-label={expanded ? 'Collapse insight' : 'Expand insight'}
            aria-expanded={expanded}
            onClick={handleToggle}
          >
            <img src={IMG.chevron} alt="" width={20} height={20} />
          </button>
        </div>

        <p className="hazard-info-card__detail">{AI_INSIGHT_DETAIL}</p>
      </div>
    </div>
  );
}
