import {
  DEFAULT_INSIGHTS_TIRE_VIEW,
  EMPTY_INSIGHTS_TIRE_VIEW,
  WATCH_WEEK_CARDS,
  type InsightsTireView,
  type WatchWeekCardData,
} from './insightsMocks';
import {
  isFutureInsightsWeek,
  type InsightsWeekRange,
  weekSeed,
} from './insightsWeek';

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** Lightly vary mock Insights metrics by selected week (deterministic). */
export function getInsightsTireViewForWeek(
  week: InsightsWeekRange,
): InsightsTireView {
  if (isFutureInsightsWeek(week)) {
    return EMPTY_INSIGHTS_TIRE_VIEW;
  }

  const seed = weekSeed(week);
  const wobble = (seed % 11) - 5;
  const base = DEFAULT_INSIGHTS_TIRE_VIEW;
  return {
    ...base,
    hasData: true,
    damageLevel: clamp(base.damageLevel + wobble, 8, 92),
    damageLevelDeltaPct: Number(
      (base.damageLevelDeltaPct + ((seed % 7) - 3) * 0.3).toFixed(1),
    ),
    alertCount: clamp(base.alertCount + (seed % 5) - 2, 0, 12),
    cumulativeKm: base.cumulativeKm + (seed % 17) * 120,
  };
}

export function getWatchWeekCardsForWeek(
  week: InsightsWeekRange,
): WatchWeekCardData[] {
  if (isFutureInsightsWeek(week)) {
    return WATCH_WEEK_CARDS.map(card => ({
      ...card,
      noData: true,
      valueLabel: '-',
      trendLabel: null,
      alert: undefined,
    }));
  }

  const seed = weekSeed(week);
  const factor = 1 + ((seed % 7) - 3) * 0.015;
  return WATCH_WEEK_CARDS.map((card, index) => {
    const offset = ((seed + index * 13) % 9) - 4;
    const series = card.series.map((value, i) =>
      Number((value * factor + offset * (0.2 + i * 0.05)).toFixed(3)),
    );
    const last = series[series.length - 1] ?? 0;
    let valueLabel: string;
    if (card.unit === '°') {
      valueLabel = last.toFixed(2);
    } else if (card.unit === 'kg' || card.unit === 'PSI') {
      valueLabel = Math.round(last).toLocaleString('en-US');
    } else {
      valueLabel = String(Math.round(last));
    }
    return {
      ...card,
      noData: false,
      series,
      valueLabel,
    };
  });
}
