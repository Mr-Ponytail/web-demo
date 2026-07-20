import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { TirePositionGrid } from '../components/insights/TirePositionGrid';
import { IMG } from '../assets';
import {
  INSIGHTS_CHIP_TO_SLOT,
  INSIGHTS_SLOT_TO_CHIP,
} from '../data/tireSlotGrid';
import {
  DEFAULT_INSIGHTS_TIRE_VIEW,
  INSIGHTS_CHIP_KEYS,
  INSIGHTS_CHIP_LABELS,
  WATCH_WEEK_CARDS,
  type InsightsChipKey,
  type TireLifeThresholds,
  type WatchWeekCardData,
} from '../data/insightsMocks';
import { insightsChipGridStore } from '../state/insightsChipGridStore';
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
}: {
  series: number[];
  baseline: number[];
}) {
  const padX = 10;
  const padTop = 14;
  const padBottom = 22;
  const allValues = [...series, ...baseline];
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const range = Math.max(max - min, 0.0001);
  const plotW = CHART_W - padX * 2;
  const plotH = CHART_H - padTop - padBottom;
  const lastIndex = Math.max(series.length - 1, 1);

  const toPoint = (values: number[], index: number) => {
    const x = padX + (index / lastIndex) * plotW;
    const y = padTop + (1 - (values[index]! - min) / range) * plotH;
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
    <div className="iw-chart">
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
  const [primary, secondary] = card.trendLabel.split(' | ');
  const alertIcon =
    card.alert === 'danger'
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
        {alertIcon ? (
          <img src={alertIcon} alt="" width={32} height={22} />
        ) : null}
      </div>

      <div className="iw-card__body">
        <div className="iw-card__value-block">
          <div className="iw-card__value-row">
            <strong>{card.valueLabel}</strong>
            <span>{card.unit}</span>
          </div>
          <div className="iw-card__trend">
            <span style={{ color: trendColor }}>
              {isUp ? '▲' : '▼'} {primary}
            </span>
            {secondary != null ? (
              <>
                <i className="iw-card__trend-div" />
                <span style={{ color: trendColor }}>{secondary}</span>
              </>
            ) : null}
          </div>
        </div>
        <WatchWeekSparkline series={card.series} baseline={card.baseline} />
      </div>

      <hr className="iw-card__divider" />

      <div className="iw-card__insight">
        <h4>{card.insightTitle}</h4>
        <p>{card.insightBody}</p>
      </div>
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

export function InsightsPage() {
  const [selectedChip, setSelectedChip] = useState<InsightsChipKey>('FL');
  const chipGridExpanded = useSyncExternalStore(
    insightsChipGridStore.subscribe,
    insightsChipGridStore.getExpanded,
  );
  const sticky = useInsightsStickyScroll();

  const setChipGridOpen = useCallback((next: boolean) => {
    insightsChipGridStore.setExpanded(next);
  }, []);

  const toggleChipGrid = useCallback(() => {
    setChipGridOpen(!insightsChipGridStore.getExpanded());
  }, [setChipGridOpen]);

  useEffect(() => {
    return () => {
      insightsChipGridStore.setExpanded(false);
    };
  }, []);

  const chipGridTop = sticky.stickyMeasured
    ? `calc(var(--safe-t) + ${sticky.stickyClipHeight}px)`
    : 'var(--safe-t)';
  const tire = DEFAULT_INSIGHTS_TIRE_VIEW;
  const damageLevel = Math.round(tire.damageLevel);
  const damageTheme = getDamageLevelTheme(damageLevel);
  const lifeTheme = getTireLifeTheme(tire.cumulativeKm, tire);
  const fillRatio = Math.min(
    1,
    Math.max(0, tire.cumulativeKm / tire.expectedTireLifeKm),
  );
  const badgeLeft = `${fillRatio * 100}%`;
  const alignDistanceEnd = fillRatio < 0.52;
  const midScaleKm = Math.round(tire.expectedTireLifeKm / 2);
  const isUp = tire.damageLevelDeltaPct > 0;
  const statusIcon = getDamageStatusIcon(damageLevel);

  const weekLabel = useMemo(() => {
    // Demo fixed week matching July 2026 context
    return { month: 'July 2026', range: 'Jul 13 – Jul 19' };
  }, []);

  return (
    <div className="screen insights">
      <div
        className="insights__sticky"
        style={{
          height: sticky.stickyMeasured
            ? `calc(var(--safe-t) + ${sticky.stickyClipHeight}px)`
            : undefined,
        }}
      >
        <div
          className="insights__gauge-fill"
          style={{ width: `${damageLevel}%`, opacity: sticky.gaugeFillOpacity }}
          aria-hidden
        />

        <div
          className="insights__sticky-clip"
          style={
            sticky.stickyMeasured
              ? { height: sticky.stickyClipHeight }
              : undefined
          }
        >
          <div
            ref={sticky.stickyBodyRef}
            className="insights__sticky-body"
            style={{ transform: `translateY(${sticky.stickyShiftY}px)` }}
          >
            <div className="insights__header">
              <div
                ref={sticky.titleRowRef}
                className="insights__title-row"
                style={{ opacity: sticky.titleOpacity }}
              >
                <h1>Insights</h1>
                <div className="insights__actions">
                  <button
                    type="button"
                    className="insights__icon-btn"
                    aria-label="Add tire"
                  >
                    <img src={IMG.addTire} alt="" width={42} height={42} />
                  </button>
                  <button
                    type="button"
                    className="insights__icon-btn"
                    aria-label="CSV"
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
                >
                  ‹
                </button>
                <button type="button" className="insights__date-center">
                  <span className="insights__date-text">
                    <strong>{weekLabel.month}</strong>
                    <small>{weekLabel.range}</small>
                  </span>
                  <i className="insights__caret" />
                </button>
                <button
                  type="button"
                  className="insights__chevron"
                  aria-label="Next week"
                >
                  ›
                </button>
              </div>
            </div>

            <div className="insights__chips">
              <div className="insights__chip-scroll">
                {INSIGHTS_CHIP_KEYS.map(key => (
                  <button
                    key={key}
                    type="button"
                    className={
                      key === selectedChip
                        ? 'insights__chip insights__chip--on'
                        : 'insights__chip'
                    }
                    onClick={() => setSelectedChip(key)}
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
        style={{ paddingTop: sticky.bodyPaddingTop }}
      >
        <InsightsGapWash
          height={
            sticky.stickyMeasured
              ? `calc(var(--safe-t) + ${sticky.stickyBodyHeight}px)`
              : 0
          }
          gaugeWidthPct={damageLevel}
          opacity={sticky.gaugeFillOpacity}
          className="insights__gap-wash--under-header"
        />

        <div
          ref={sticky.scrollRef}
          className={
            chipGridExpanded
              ? 'insights__scroll insights__scroll--locked'
              : 'insights__scroll'
          }
          onScroll={sticky.onScroll}
          style={{ paddingBottom: INSIGHTS_SCROLL_PADDING_BOTTOM }}
        >
          <InsightsGapWash
            height={sticky.titleRowHeight}
            gaugeWidthPct={damageLevel}
            opacity={sticky.gaugeFillOpacity}
          />

          <div className="insights__scroll-gauge">
            <div
              className="insights__gauge-fill"
              style={{
                width: `${damageLevel}%`,
                opacity: sticky.gaugeFillOpacity,
              }}
              aria-hidden
            />
            <div className="insights__status">
              <div className="insights__status-wash" />
              <div className="insights__status-content">
                <span className="insights__badge">
                  {INSIGHTS_CHIP_LABELS[selectedChip]}
                </span>
                <div className="insights__headline">
                  <h2>{getDamageStatusHeadline(damageLevel)}</h2>
                  <img src={statusIcon} alt="" width={32} height={22} />
                </div>
              </div>
            </div>
          </div>

          <section
            className="insights__damage"
            style={{ height: DAMAGE_CARD_H }}
          >
            <div className="insights__damage-wash" />
            <img
              className="insights__damage-tire"
              src={damageTheme.tireImage}
              alt=""
              style={{ width: DAMAGE_TIRE_W, height: DAMAGE_CARD_H }}
            />
            <div
              className="insights__damage-gauge"
              style={{
                width: `${damageLevel}%`,
                background: `linear-gradient(90deg, ${damageTheme.gaugeColors[0]}, ${damageTheme.gaugeColors[1]})`,
              }}
            />
            <div className="insights__damage-content">
              <div className="insights__damage-label">
                <span>Damage Level</span>
                <img src={IMG.insightsInfo} alt="" width={16} height={16} />
              </div>
              <div className="insights__damage-value-row">
                <strong>{damageLevel}%</strong>
                <div className="insights__damage-compare">
                  <div className="insights__damage-compare-top">
                    <span>{isUp ? '▲' : '▼'}</span>
                    <span>
                      {formatDamageDeltaPct(tire.damageLevelDeltaPct)} %
                    </span>
                  </div>
                  <small>vs Last week</small>
                </div>
              </div>
            </div>
          </section>

          <section className="insights__life">
            <div className="insights__life-wash" />
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
                  <p
                    className="insights__life-km"
                    style={{ color: lifeTheme.color }}
                  >
                    {Math.round(tire.cumulativeKm).toLocaleString('en-US')} KM
                  </p>
                </div>
              </div>

              <div className="insights__life-progress">
                <div
                  className="insights__life-badge-wrap"
                  style={{ left: badgeLeft }}
                >
                  <span
                    className="insights__life-badge"
                    style={{ background: lifeTheme.badgeBg }}
                  >
                    <img
                      src={lifeTheme.truckIcon}
                      alt=""
                      width={32}
                      height={32}
                    />
                    <span style={{ color: lifeTheme.badgeTextColor }}>
                      {lifeTheme.badgeLabel}
                    </span>
                  </span>
                  <i
                    className="insights__life-badge-tail"
                    style={{ borderTopColor: lifeTheme.badgeBg }}
                  />
                </div>
                <div className="insights__life-track">
                  <span
                    className="insights__life-fill"
                    style={{
                      width: `${fillRatio * 100}%`,
                      background: `linear-gradient(90deg, ${lifeTheme.fillColors[0]}, ${lifeTheme.fillColors[1]})`,
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
                <strong>{tire.alertCount}</strong>
              </div>
              <div className="insights__life-sub-card insights__life-sub-card--locked">
                <div className="insights__life-lock">
                  <p>Next Replace (Est.)</p>
                  <img src={IMG.lock} alt="" width={28} height={28} />
                </div>
              </div>
            </div>

            <div className="insights__unlock">
              <img src={IMG.star} alt="" width={20} height={20} />
              <div>
                <p>Unlock estimated replace date</p>
                <p>by adding tire info</p>
              </div>
            </div>
          </section>

          <section className="insights__watch">
            <div className="insights__watch-header">
              <h3>Watch This Week</h3>
              <img src={IMG.insightsInfo} alt="" width={16} height={16} />
            </div>
            <div className="insights__watch-list">
              {WATCH_WEEK_CARDS.map(card => (
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
      </div>

      {sticky.stickyMeasured ? (
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
                onSelect={key => setSelectedChip(INSIGHTS_SLOT_TO_CHIP[key])}
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
