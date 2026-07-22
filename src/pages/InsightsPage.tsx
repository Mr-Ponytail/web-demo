import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { ExportRangeSheet } from '../components/insights/ExportRangeSheet';
import { InsightsWeekCalendarModal } from '../components/insights/InsightsWeekCalendarModal';
import { TirePositionGrid } from '../components/insights/TirePositionGrid';
import { IMG } from '../assets';
import {
  INSIGHTS_CHIP_TO_SLOT,
  INSIGHTS_SLOT_TO_CHIP,
  type TireSlotKey,
} from '../data/tireSlotGrid';
import {
  INSIGHTS_CHIP_KEYS,
  INSIGHTS_CHIP_LABELS,
  type InsightsChipKey,
  type InsightsTireView,
  type TireLifeThresholds,
  type WatchWeekCardData,
} from '../data/insightsMocks';
import {
  formatWeekMonthLabel,
  formatWeekRangeLabel,
  getDemoInitialWeek,
  shiftWeekRange,
  type InsightsWeekRange,
} from '../data/insightsWeek';
import {
  getInsightsTireViewForWeek,
  getWatchWeekCardsForWeek,
} from '../data/insightsWeekMocks';
import { insightsChipGridStore } from '../state/insightsChipGridStore';
import {
  DEMO_RECOMMENDED_REPLACE_DATE,
  formatRecommendedReplaceDate,
  registeredTireStore,
} from '../state/registeredTireStore';
import {
  INSIGHTS_CHIP_GRID_EXPAND_HEIGHT,
  INSIGHTS_SCROLL_BOTTOM_SPACER,
  INSIGHTS_SCROLL_PADDING_BOTTOM,
} from './insightsScrollConstants';
import { useInsightsStickyScroll } from './useInsightsStickyScroll';
import './InsightsPage.css';

const DAMAGE_CARD_H = 152;
const DAMAGE_TIRE_W = Math.round(DAMAGE_CARD_H * 0.75);
const CHART_W = 135;
const CHART_H = 69;
const EMPTY_GAUGE_FILL_PERCENT = 3;
const TIRE_LIFE_EMPTY_GAUGE_FILL_COLORS = [
  'rgba(70, 71, 76, 0)',
  '#46474C',
] as const;

function formatDamageDeltaPct(deltaPct: number) {
  const abs = Math.abs(deltaPct);
  const rounded = Math.round(abs * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function getDamageStatusIcon(level: number) {
  if (level <= 30) return IMG.statusLog.good;
  if (level <= 75) return IMG.statusLog.caution;
  return IMG.statusLog.danger;
}

function getDamageStatusHeadline(level: number) {
  if (level <= 30) return 'Your tire is in great shape';
  if (level <= 75) return 'Your tire has some wear';
  return 'Tire Needs Replacement';
}

function getDamageLevelTheme(level: number) {
  if (level <= 30) {
    return {
      tireImage: IMG.insightsGood,
      gaugeColors: ['rgba(186, 230, 120, 0.8)', 'rgba(118, 203, 0, 1)'],
    };
  }
  if (level <= 75) {
    return {
      tireImage: IMG.insightsCaution,
      gaugeColors: ['rgba(255, 208, 181, 0.8)', '#F48200'],
    };
  }
  return {
    tireImage: IMG.insightsDanger,
    gaugeColors: ['rgba(255, 186, 181, 0.8)', 'rgba(255, 101, 93, 1)'],
  };
}

function getTireLifeTheme(km: number, thresholds: TireLifeThresholds) {
  if (km < thresholds.runningLowKm) {
    return {
      color: '#00BF40',
      badgeTextColor: '#00BF40',
      badgeLabel: 'Lightly Driven',
      fillColors: ['#ACFCC7', '#00BF40'],
      badgeBg: '#F2FFF6',
      truckIcon: IMG.truckInsights.good,
    };
  }
  if (km < thresholds.nearLimitKm) {
    return {
      color: '#FF8C00',
      badgeTextColor: '#F48200',
      badgeLabel: 'Well Traveled',
      fillColors: ['#FFD49C', '#FF8C00'],
      badgeBg: '#FEF4E6',
      truckIcon: IMG.truckInsights.caution,
    };
  }
  return {
    color: '#FF4242',
    badgeTextColor: '#FF4242',
    badgeLabel: 'Replace Soon',
    fillColors: ['#FFB5B5', '#FF4242'],
    badgeBg: '#FEECEC',
    truckIcon: IMG.truckInsights.danger,
  };
}

function WatchWeekSparkline({
  series,
  baseline,
  dimmed = false,
}: {
  series: number[];
  baseline: number[];
  dimmed?: boolean;
}) {
  const padX = 10;
  const padTop = 14;
  const padBottom = 22;
  const allValues = [...series, ...baseline].filter(v => Number.isFinite(v));
  const min = allValues.length ? Math.min(...allValues) : 0;
  const max = allValues.length ? Math.max(...allValues) : 1;
  // Pad flat weeks so a constant 7-day line still sits visibly mid-chart.
  const pad = max === min ? Math.max(Math.abs(min) * 0.02, 1) : 0;
  const range = Math.max(max - min + pad * 2, 0.0001);
  const plotMin = min - pad;
  const plotW = CHART_W - padX * 2;
  const plotH = CHART_H - padTop - padBottom;
  const lastIndex = Math.max(series.length - 1, 1);

  const toPoint = (values: number[], index: number) => {
    const raw = values[index];
    const value = Number.isFinite(raw) ? raw! : plotMin + range / 2;
    const x = padX + (index / lastIndex) * plotW;
    const y = padTop + (1 - (value - plotMin) / range) * plotH;
    return { x, y };
  };

  const toPointsAttr = (values: number[]) =>
    values
      .map((_, index) => {
        const { x, y } = toPoint(values, index);
        return `${x},${y}`;
      })
      .join(' ');

  const seriesEnd = toPoint(series, series.length - 1);
  const baselineEnd = toPoint(baseline, baseline.length - 1);

  return (
    <div className={dimmed ? 'iw-chart iw-chart--dimmed' : 'iw-chart'}>
      <svg width={CHART_W} height={CHART_H} aria-hidden>
        <polyline
          points={toPointsAttr(baseline)}
          fill="none"
          stroke="#C2C4C8"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points={toPointsAttr(series)}
          fill="none"
          stroke="#005EAD"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx={baselineEnd.x}
          cy={baselineEnd.y}
          r={3}
          fill="#fff"
          stroke="#C2C4C8"
          strokeWidth={1.5}
        />
        <circle cx={seriesEnd.x} cy={seriesEnd.y} r={3.5} fill="#005EAD" />
      </svg>
      <span className="iw-chart__label">Last 7 days</span>
    </div>
  );
}

function WatchWeekMetricCard({ card }: { card: WatchWeekCardData }) {
  const isUp = card.trendDirection === 'up';
  const trendColor = isUp ? '#006E25' : '#E52222';
  const [primary, secondary] = (card.trendLabel ?? '').split(' | ');
  const statusIcon = card.noData
    ? IMG.insightsNo
    : card.alert === 'danger'
      ? IMG.statusLog.danger
      : card.alert === 'caution'
        ? IMG.statusLog.caution
        : null;

  return (
    <article className="iw-card">
      <div className="iw-card__header">
        <div className="iw-card__title-row">
          <img
            src={IMG.insightsMetric[card.iconKey]}
            alt=""
            width={16}
            height={16}
          />
          <span>{card.title}</span>
        </div>
        {statusIcon ? (
          <img src={statusIcon} alt="" width={32} height={22} />
        ) : null}
      </div>

      <div className="iw-card__body">
        <div className="iw-card__value-block">
          <div className="iw-card__value-row">
            <strong>{card.valueLabel}</strong>
            <span>{card.unit}</span>
          </div>
          {!card.noData && card.trendLabel != null ? (
            <div className="iw-card__trend">
              <span style={{ color: trendColor }}>
                {isUp ? '▲' : '▼'} {primary}
              </span>
              {secondary != null && secondary !== '' ? (
                <>
                  <i className="iw-card__trend-div" />
                  <span style={{ color: trendColor }}>{secondary}</span>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
        <WatchWeekSparkline
          series={card.series}
          baseline={card.baseline}
          dimmed={Boolean(card.noData)}
        />
      </div>

      {!card.noData ? (
        <>
          <hr className="iw-card__divider" />
          <div className="iw-card__insight">
            <h4>{card.insightTitle}</h4>
            <p>{card.insightBody}</p>
          </div>
        </>
      ) : null}
    </article>
  );
}


function InsightsGapWash({
  height,
  gaugeWidthPct,
  opacity,
  className,
}: {
  height: number | string;
  gaugeWidthPct: number;
  opacity: number;
  className?: string;
}) {
  if (height === 0) return null;
  return (
    <div
      className={className ? `insights__gap-wash ${className}` : 'insights__gap-wash'}
      style={{ height }}
      aria-hidden
    >
      <div
        className="insights__gauge-fill"
        style={{ width: `${gaugeWidthPct}%`, opacity }}
      />
    </div>
  );
}

type InsightsTireSlideProps = {
  chip: InsightsChipKey;
  tire: InsightsTireView;
  watchWeekCards: WatchWeekCardData[];
  tireCodes: Partial<Record<TireSlotKey, string>>;
  titleRowHeight: number;
  gaugeFillOpacity: number;
  scrollLocked: boolean;
  onScroll: () => void;
  scrollRef: (el: HTMLDivElement | null) => void;
  onAddTire: () => void;
};

function InsightsTireSlide({
  chip,
  tire,
  watchWeekCards,
  tireCodes,
  titleRowHeight,
  gaugeFillOpacity,
  scrollLocked,
  onScroll,
  scrollRef,
  onAddTire,
}: InsightsTireSlideProps) {
  const insightsEmpty = !tire.hasData;
  const selectedSlot = INSIGHTS_CHIP_TO_SLOT[chip];
  const isNextReplaceUnlocked = Boolean(tireCodes[selectedSlot]);
  const nextReplaceLabel = insightsEmpty
    ? '-'
    : isNextReplaceUnlocked
      ? formatRecommendedReplaceDate(
          tire.recommendedReplaceDate ?? DEMO_RECOMMENDED_REPLACE_DATE,
        )
      : '-';
  const damageLevel = Math.round(tire.damageLevel);
  const gaugeWidthPct = insightsEmpty ? 0 : damageLevel;
  const damageTheme = getDamageLevelTheme(insightsEmpty ? 0 : damageLevel);
  const lifeTheme = getTireLifeTheme(tire.cumulativeKm, tire);
  const fillRatio = insightsEmpty
    ? 0
    : Math.min(1, Math.max(0, tire.cumulativeKm / tire.expectedTireLifeKm));
  const lifeFillPercent = insightsEmpty
    ? EMPTY_GAUGE_FILL_PERCENT
    : fillRatio * 100;
  const lifeFillColors = insightsEmpty
    ? TIRE_LIFE_EMPTY_GAUGE_FILL_COLORS
    : lifeTheme.fillColors;
  const lifeFillGradient = insightsEmpty
    ? `linear-gradient(90deg, ${lifeFillColors[0]}, ${lifeFillColors[1]})`
    : `linear-gradient(90deg, ${lifeFillColors[0]} 20%, ${lifeFillColors[1]})`;
  const distanceValue = insightsEmpty
    ? '-'
    : Math.round(tire.cumulativeKm).toLocaleString('en-US');
  const distanceColor = insightsEmpty ? '#0f0f10' : lifeTheme.color;
  const badgeLeft = `${fillRatio * 100}%`;
  const alignDistanceEnd = !insightsEmpty && fillRatio < 0.52;
  const midScaleKm = Math.round(tire.expectedTireLifeKm / 2);
  const isUp = tire.damageLevelDeltaPct > 0;
  const statusIcon = insightsEmpty
    ? IMG.insightsNo
    : getDamageStatusIcon(damageLevel);
  const statusHeadline = insightsEmpty
    ? 'No tire data yet'
    : getDamageStatusHeadline(damageLevel);
  const alertLabel = insightsEmpty ? '-' : String(tire.alertCount);

  return (
    <div
      ref={scrollRef}
      className={
        scrollLocked
          ? 'insights__page insights__page--locked'
          : 'insights__page'
      }
      onScroll={onScroll}
      style={{ paddingBottom: INSIGHTS_SCROLL_PADDING_BOTTOM }}
      data-chip-page={chip}
    >
      <InsightsGapWash
        height={titleRowHeight}
        gaugeWidthPct={gaugeWidthPct}
        opacity={gaugeFillOpacity}
      />

      <div className="insights__scroll-gauge">
        <div
          className="insights__gauge-fill"
          style={{
            width: `${gaugeWidthPct}%`,
            opacity: gaugeFillOpacity,
          }}
          aria-hidden
        />
        <div className="insights__status">
          <div className="insights__status-wash" />
          <div className="insights__status-content">
            <span className="insights__badge">
              {INSIGHTS_CHIP_LABELS[chip]}
            </span>
            <div className="insights__headline">
              <h2>{statusHeadline}</h2>
              <img src={statusIcon} alt="" width={32} height={22} />
            </div>
          </div>
        </div>
      </div>

      <section className="insights__damage" style={{ height: DAMAGE_CARD_H }}>
        <div className="insights__damage-wash" />
        <img
          className="insights__damage-tire"
          src={damageTheme.tireImage}
          alt=""
          style={{ width: DAMAGE_TIRE_W, height: DAMAGE_CARD_H }}
        />
        {!insightsEmpty ? (
          <div
            className="insights__damage-gauge"
            style={{
              width: `${damageLevel}%`,
              background: `linear-gradient(90deg, ${damageTheme.gaugeColors[0]}, ${damageTheme.gaugeColors[1]})`,
            }}
          />
        ) : null}
        <div className="insights__damage-content">
          <div className="insights__damage-label">
            <span>Damage Level</span>
            <img src={IMG.insightsInfo} alt="" width={16} height={16} />
          </div>
          <div className="insights__damage-value-row">
            <strong>{insightsEmpty ? '-' : damageLevel}%</strong>
            <div className="insights__damage-compare">
              <div className="insights__damage-compare-top">
                {!insightsEmpty ? <span>{isUp ? '▲' : '▼'}</span> : null}
                <span
                  className={
                    insightsEmpty
                      ? 'insights__damage-compare-value insights__damage-compare-value--empty'
                      : 'insights__damage-compare-value'
                  }
                >
                  {insightsEmpty
                    ? '-'
                    : formatDamageDeltaPct(tire.damageLevelDeltaPct)}{' '}
                  %
                </span>
              </div>
              <small>vs Last week</small>
            </div>
          </div>
        </div>
      </section>

      <section className="insights__life">
        {!insightsEmpty ? (
          <div className="insights__life-wash insights__life-wash--soft" aria-hidden />
        ) : null}
        <div
          className="insights__life-wash"
          style={{ width: `${insightsEmpty ? 0 : damageLevel}%` }}
          aria-hidden
        />
        <div className="insights__life-header">
          <h3>Tire Life Summary</h3>
          <img src={IMG.insightsInfo} alt="" width={16} height={16} />
        </div>

        <div className="insights__life-card">
          <div
            className={
              alignDistanceEnd
                ? 'insights__life-top insights__life-top--end'
                : 'insights__life-top'
            }
          >
            <div>
              <p className="insights__life-est">(Est.)</p>
              <p className="insights__life-km" style={{ color: distanceColor }}>
                {distanceValue}
                <span className="insights__life-km-unit"> KM</span>
              </p>
            </div>
          </div>

          <div className="insights__life-progress">
            {!insightsEmpty ? (
              <div
                className="insights__life-badge-wrap"
                style={{ left: badgeLeft }}
              >
                <span
                  className="insights__life-badge"
                  style={{ background: lifeTheme.badgeBg }}
                >
                  <span style={{ color: lifeTheme.badgeTextColor }}>
                    {lifeTheme.badgeLabel}
                  </span>
                </span>
                <i
                  className="insights__life-badge-tail"
                  style={{ borderTopColor: lifeTheme.badgeBg }}
                />
                <img
                  className="insights__life-truck"
                  src={lifeTheme.truckIcon}
                  alt=""
                  width={32}
                  height={32}
                />
              </div>
            ) : null}
            <div className="insights__life-track">
              <span
                className="insights__life-fill"
                style={{
                  width: `${lifeFillPercent}%`,
                  background: lifeFillGradient,
                }}
              />
              <i className="insights__life-mid" />
            </div>
          </div>

          <div className="insights__life-scale">
            <span>0KM</span>
            <span className="insights__life-scale-center">
              {midScaleKm.toLocaleString('en-US')}KM
            </span>
            <span className="insights__life-scale-right">
              {tire.expectedTireLifeKm.toLocaleString('en-US')}KM +
            </span>
          </div>
        </div>

        <div className="insights__life-sub">
          <div className="insights__life-sub-card">
            <p>Alerts This Week</p>
            <strong>{alertLabel}</strong>
          </div>
          <div
            className={
              isNextReplaceUnlocked
                ? 'insights__life-sub-card'
                : 'insights__life-sub-card insights__life-sub-card--locked'
            }
          >
            <p>Next Replacement (Est.)</p>
            <strong>{nextReplaceLabel}</strong>
            {!isNextReplaceUnlocked ? (
              <div className="insights__life-lock-overlay" aria-hidden>
                <div className="insights__life-lock-content">
                  <p>Next Replacement (Est.)</p>
                  <img src={IMG.lock} alt="" width={32} height={32} />
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {!isNextReplaceUnlocked ? (
          <button
            type="button"
            className="insights__unlock"
            onClick={onAddTire}
          >
            <img src={IMG.star} alt="" width={24} height={24} />
            <div className="insights__unlock-text">
              <p>Unlock replacement date</p>
              <p>by adding tire info</p>
            </div>
            <img src={IMG.chevron} alt="" width={20} height={20} />
          </button>
        ) : null}
      </section>

      <section className="insights__watch">
        <div className="insights__watch-header">
          <h3>Watch This Week</h3>
          <img src={IMG.insightsInfo} alt="" width={16} height={16} />
        </div>
        <div className="insights__watch-list">
          {watchWeekCards.map(card => (
            <WatchWeekMetricCard key={card.title} card={card} />
          ))}
        </div>
      </section>

      <div
        className="insights__scroll-spacer"
        style={{ height: INSIGHTS_SCROLL_BOTTOM_SPACER }}
        aria-hidden
      />
    </div>
  );
}

export function InsightsPage() {
  const navigate = useNavigate();
  const [selectedChip, setSelectedChip] = useState<InsightsChipKey>('FL');
  const [exportRangeVisible, setExportRangeVisible] = useState(false);
  const [weekCalendarVisible, setWeekCalendarVisible] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<InsightsWeekRange>(() =>
    getDemoInitialWeek(),
  );
  const chipGridExpanded = useSyncExternalStore(
    insightsChipGridStore.subscribe,
    insightsChipGridStore.getExpanded,
  );
  const tireCodes = useSyncExternalStore(
    registeredTireStore.subscribe,
    registeredTireStore.getCodes,
  );
  const sticky = useInsightsStickyScroll();
  const {
    scrollRef: stickyScrollRef,
    onScroll: stickyOnScroll,
    titleRowRef,
    stickyBodyRef,
    titleRowHeight,
    stickyMeasured,
    stickyBodyHeight,
    stickyClipHeight,
    stickyShiftY,
    titleOpacity,
    gaugeFillOpacity,
    bodyPaddingTop,
  } = sticky;
  const chipScrollRef = useRef<HTMLDivElement>(null);
  const pagerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Partial<Record<InsightsChipKey, HTMLDivElement | null>>>(
    {},
  );
  const selectedChipRef = useRef<InsightsChipKey>(selectedChip);
  const ignorePagerScrollRef = useRef(false);

  selectedChipRef.current = selectedChip;

  const setChipGridOpen = useCallback((next: boolean) => {
    insightsChipGridStore.setExpanded(next);
  }, []);

  const toggleChipGrid = useCallback(() => {
    setChipGridOpen(!insightsChipGridStore.getExpanded());
  }, [setChipGridOpen]);

  const openManageTire = useCallback(() => {
    navigate('/app/manage-tire');
  }, [navigate]);

  const shiftSelectedWeek = useCallback((weekDelta: number) => {
    setSelectedWeek(prev => shiftWeekRange(prev, weekDelta));
  }, []);

  const bindActiveScrollRef = useCallback(
    (chip: InsightsChipKey) => {
      stickyScrollRef.current = pageRefs.current[chip] ?? null;
      stickyOnScroll();
    },
    [stickyOnScroll, stickyScrollRef],
  );

  const scrollPagerToChip = useCallback(
    (key: InsightsChipKey, behavior: ScrollBehavior) => {
      const pager = pagerRef.current;
      if (!pager) return;
      const index = INSIGHTS_CHIP_KEYS.indexOf(key);
      if (index < 0) return;
      ignorePagerScrollRef.current = true;
      pager.scrollTo({
        left: index * pager.clientWidth,
        behavior,
      });
      window.setTimeout(
        () => {
          ignorePagerScrollRef.current = false;
        },
        behavior === 'smooth' ? 400 : 0,
      );
    },
    [],
  );

  const selectChip = useCallback(
    (key: InsightsChipKey) => {
      if (key === selectedChipRef.current) return;
      setSelectedChip(key);
      bindActiveScrollRef(key);
      scrollPagerToChip(key, 'smooth');
    },
    [bindActiveScrollRef, scrollPagerToChip],
  );

  const onPagerScroll = useCallback(() => {
    const pager = pagerRef.current;
    if (!pager || ignorePagerScrollRef.current) return;
    const width = pager.clientWidth || 1;
    const index = Math.min(
      INSIGHTS_CHIP_KEYS.length - 1,
      Math.max(0, Math.round(pager.scrollLeft / width)),
    );
    const key = INSIGHTS_CHIP_KEYS[index]!;
    if (key === selectedChipRef.current) return;
    setSelectedChip(key);
    bindActiveScrollRef(key);
  }, [bindActiveScrollRef]);

  const setPageRef = useCallback(
    (key: InsightsChipKey) => (el: HTMLDivElement | null) => {
      pageRefs.current[key] = el;
      if (key === selectedChipRef.current) {
        stickyScrollRef.current = el;
      }
    },
    [stickyScrollRef],
  );

  const onPageScroll = useCallback(
    (key: InsightsChipKey) => () => {
      if (key !== selectedChipRef.current) return;
      stickyOnScroll();
    },
    [stickyOnScroll],
  );

  useEffect(() => {
    return () => {
      insightsChipGridStore.setExpanded(false);
    };
  }, []);

  useEffect(() => {
    const chipButton = chipScrollRef.current?.querySelector<HTMLElement>(
      `[data-chip="${selectedChip}"]`,
    );
    chipButton?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [selectedChip]);

  useEffect(() => {
    const pager = pagerRef.current;
    if (!pager) return;

    const snapToSelected = () => {
      const index = INSIGHTS_CHIP_KEYS.indexOf(selectedChipRef.current);
      if (index < 0) return;
      ignorePagerScrollRef.current = true;
      pager.scrollLeft = index * pager.clientWidth;
      ignorePagerScrollRef.current = false;
      bindActiveScrollRef(selectedChipRef.current);
    };

    snapToSelected();
    const observer = new ResizeObserver(snapToSelected);
    observer.observe(pager);
    return () => observer.disconnect();
  }, [bindActiveScrollRef]);

  const chipGridTop = stickyMeasured
    ? `calc(var(--safe-t) + ${stickyClipHeight}px)`
    : 'var(--safe-t)';

  const tireViews = useMemo(() => {
    const map = {} as Record<InsightsChipKey, InsightsTireView>;
    for (const key of INSIGHTS_CHIP_KEYS) {
      map[key] = getInsightsTireViewForWeek(selectedWeek, key);
    }
    return map;
  }, [selectedWeek]);

  const watchCardsByChip = useMemo(() => {
    const map = {} as Record<InsightsChipKey, WatchWeekCardData[]>;
    for (const key of INSIGHTS_CHIP_KEYS) {
      map[key] = getWatchWeekCardsForWeek(selectedWeek, key);
    }
    return map;
  }, [selectedWeek]);

  const activeTire = tireViews[selectedChip];
  const insightsEmpty = !activeTire.hasData;
  const topGaugeWidthPct = insightsEmpty ? 0 : Math.round(activeTire.damageLevel);
  const monthLabel = formatWeekMonthLabel(selectedWeek);
  const weekRangeLabel = formatWeekRangeLabel(
    selectedWeek.start,
    selectedWeek.end,
  );

  return (
    <div className="screen insights">
      <div
        className="insights__sticky"
        style={{
          height: stickyMeasured
            ? `calc(var(--safe-t) + ${stickyClipHeight}px)`
            : undefined,
        }}
      >
        <div
          className="insights__gauge-fill"
          style={{ width: `${topGaugeWidthPct}%`, opacity: gaugeFillOpacity }}
          aria-hidden
        />

        <div
          className="insights__sticky-clip"
          style={
            stickyMeasured
              ? { height: stickyClipHeight }
              : undefined
          }
        >
          <div
            ref={stickyBodyRef}
            className="insights__sticky-body"
            style={{ transform: `translateY(${stickyShiftY}px)` }}
          >
            <div className="insights__header">
              <div
                ref={titleRowRef}
                className="insights__title-row"
                style={{ opacity: titleOpacity }}
              >
                <h1>Insights</h1>
                <div className="insights__actions">
                  <button
                    type="button"
                    className="insights__icon-btn"
                    aria-label="Add tire"
                    onClick={openManageTire}
                  >
                    <img src={IMG.addTire} alt="" width={42} height={42} />
                  </button>
                  <button
                    type="button"
                    className="insights__icon-btn"
                    aria-label="CSV"
                    onClick={() => setExportRangeVisible(true)}
                  >
                    <img src={IMG.csv} alt="" width={42} height={42} />
                  </button>
                </div>
              </div>

              <div className="insights__date-nav">
                <button
                  type="button"
                  className="insights__chevron"
                  aria-label="Previous week"
                  onClick={() => shiftSelectedWeek(-1)}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="insights__date-center"
                  onClick={() => setWeekCalendarVisible(true)}
                >
                  <span className="insights__date-text">
                    <strong>{monthLabel}</strong>
                    <small>{weekRangeLabel}</small>
                  </span>
                  <i className="insights__caret" />
                </button>
                <button
                  type="button"
                  className="insights__chevron"
                  aria-label="Next week"
                  onClick={() => shiftSelectedWeek(1)}
                >
                  ›
                </button>
              </div>
            </div>

            <div className="insights__chips">
              <div className="insights__chip-scroll" ref={chipScrollRef}>
                {INSIGHTS_CHIP_KEYS.map(key => (
                  <button
                    key={key}
                    type="button"
                    data-chip={key}
                    className={
                      key === selectedChip
                        ? 'insights__chip insights__chip--on'
                        : 'insights__chip'
                    }
                    onClick={() => selectChip(key)}
                  >
                    {key}
                  </button>
                ))}
              </div>
              <span className="insights__chip-divider" />
              <button
                type="button"
                className={
                  chipGridExpanded
                    ? 'insights__chip-arrow insights__chip-arrow--open'
                    : 'insights__chip-arrow'
                }
                aria-label={chipGridExpanded ? 'Collapse tire grid' : 'Expand tire grid'}
                aria-expanded={chipGridExpanded}
                onClick={toggleChipGrid}
              >
                <img src={IMG.arrowDown} alt="" width={24} height={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="insights__body"
        style={{ paddingTop: bodyPaddingTop }}
      >
        <InsightsGapWash
          height={
            stickyMeasured
              ? `calc(var(--safe-t) + ${stickyBodyHeight}px)`
              : 0
          }
          gaugeWidthPct={topGaugeWidthPct}
          opacity={gaugeFillOpacity}
          className="insights__gap-wash--under-header"
        />

        <div
          ref={pagerRef}
          className={
            chipGridExpanded
              ? 'insights__pager insights__pager--locked'
              : 'insights__pager'
          }
          onScroll={onPagerScroll}
        >
          {INSIGHTS_CHIP_KEYS.map(key => (
            <InsightsTireSlide
              key={key}
              chip={key}
              tire={tireViews[key]}
              watchWeekCards={watchCardsByChip[key]}
              tireCodes={tireCodes}
              titleRowHeight={titleRowHeight}
              gaugeFillOpacity={gaugeFillOpacity}
              scrollLocked={chipGridExpanded}
              onScroll={onPageScroll(key)}
              scrollRef={setPageRef(key)}
              onAddTire={openManageTire}
            />
          ))}
        </div>
      </div>

      {stickyMeasured ? (
        <>
          <button
            type="button"
            className={
              chipGridExpanded
                ? 'insights__chip-grid-backdrop insights__chip-grid-backdrop--open'
                : 'insights__chip-grid-backdrop'
            }
            style={{ top: chipGridTop }}
            aria-label="Close tire grid"
            onClick={() => setChipGridOpen(false)}
          />

          <div
            className={
              chipGridExpanded
                ? 'insights__chip-grid-panel insights__chip-grid-panel--open'
                : 'insights__chip-grid-panel'
            }
            style={{ top: chipGridTop, height: INSIGHTS_CHIP_GRID_EXPAND_HEIGHT }}
            aria-hidden={!chipGridExpanded}
          >
            <div className="insights__chip-grid-panel-inner">
              <TirePositionGrid
                className="insights__chip-tire-grid"
                selectedKey={INSIGHTS_CHIP_TO_SLOT[selectedChip]}
                onSelect={key => selectChip(INSIGHTS_SLOT_TO_CHIP[key])}
              />
            </div>
          </div>
        </>
      ) : null}

      <ExportRangeSheet
        visible={exportRangeVisible}
        onClose={() => setExportRangeVisible(false)}
        wheelPosition={selectedChip}
      />

      <InsightsWeekCalendarModal
        visible={weekCalendarVisible}
        onClose={() => setWeekCalendarVisible(false)}
        selectedWeek={selectedWeek}
        onSelectWeek={setSelectedWeek}
      />
    </div>
  );
}
