import {
  EMPTY_INSIGHTS_TIRE_VIEW,
  INSIGHTS_CHIP_KEYS,
  type InsightsChipKey,
  type InsightsTireView,
  type WatchWeekCardData,
} from './insightsMocks';
import {
  getWeekRangeForDate,
  isFutureInsightsWeek,
  type InsightsWeekRange,
  weekSeed,
} from './insightsWeek';
import { SHINHAN_CHIP_MAPS } from './mapShinhanInsights';
import { SHINHAN_DEMO_NOW } from './shinhan/insightsPayload';

/** Week seed for the Shinhan insights window shown as the demo default. */
export const SHINHAN_DEMO_WEEK_SEED = weekSeed(
  getWeekRangeForDate(SHINHAN_DEMO_NOW),
);

function isShinhanDemoWeek(week: InsightsWeekRange) {
  return weekSeed(week) === SHINHAN_DEMO_WEEK_SEED;
}

function quieterTireView(chip: InsightsChipKey): InsightsTireView {
  const base = SHINHAN_CHIP_MAPS.tireViews[chip];
  if (!base.hasData) return EMPTY_INSIGHTS_TIRE_VIEW;
  return {
    ...base,
    damageLevel: Math.max(8, Math.round(base.damageLevel * 0.92)),
    damageLevelDeltaPct: Number((base.damageLevelDeltaPct * 0.4).toFixed(1)),
    alertCount: Math.max(0, base.alertCount - 1),
  };
}

function quieterWatchCards(chip: InsightsChipKey): WatchWeekCardData[] {
  return SHINHAN_CHIP_MAPS.watchCards[chip].map(card => ({
    ...card,
    alert: undefined,
    insightTitle: 'Looking stable',
    insightBody:
      'No strong trend this week on this wheel. Check the latest week for the active story.',
    // Keep API deltaPct + 7-day series/baseline; only soften the insight copy.
  }));
}

/** Shinhan-seeded Insights metrics for the demo week; quieter/empty otherwise. */
export function getInsightsTireViewForWeek(
  week: InsightsWeekRange,
  chip?: InsightsChipKey,
): InsightsTireView {
  if (isFutureInsightsWeek(week, SHINHAN_DEMO_NOW)) {
    return EMPTY_INSIGHTS_TIRE_VIEW;
  }

  const key = chip ?? INSIGHTS_CHIP_KEYS[0];
  if (isShinhanDemoWeek(week)) {
    return SHINHAN_CHIP_MAPS.tireViews[key];
  }

  return quieterTireView(key);
}

export function getWatchWeekCardsForWeek(
  week: InsightsWeekRange,
  chip?: InsightsChipKey,
): WatchWeekCardData[] {
  const key = chip ?? INSIGHTS_CHIP_KEYS[0];

  if (isFutureInsightsWeek(week, SHINHAN_DEMO_NOW)) {
    return SHINHAN_CHIP_MAPS.watchCards[key].map(card => ({
      ...card,
      noData: true,
      valueLabel: '-',
      trendLabel: null,
      alert: undefined,
    }));
  }

  if (isShinhanDemoWeek(week)) {
    return SHINHAN_CHIP_MAPS.watchCards[key];
  }

  return quieterWatchCards(key);
}
