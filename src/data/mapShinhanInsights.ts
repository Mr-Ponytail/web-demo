import { resolveInsightMessage } from './insightMessageCatalog';
import {
  EMPTY_INSIGHTS_TIRE_VIEW,
  type InsightsChipKey,
  type InsightsTireView,
  type WatchWeekCardData,
} from './insightsMocks';
import { SHINHAN_INSIGHTS } from './shinhan/insightsPayload';
import type {
  ApiSignal,
  ApiTireInsights,
  ApiWheelPosition,
} from './shinhan/types';

/** API corner sensors → 6-slot dual-rear chips (mirror onto inside + outside). */
const API_TO_CHIPS: Record<ApiWheelPosition, InsightsChipKey[]> = {
  FL: ['FL'],
  FR: ['FR'],
  RL: ['RLI', 'RLO'],
  RR: ['RRI', 'RRO'],
};

type SignalMeta = {
  key: keyof ApiTireInsights['signals'];
  title: string;
  iconKey: WatchWeekCardData['iconKey'];
  unit: string;
};

const SIGNAL_META: SignalMeta[] = [
  { key: 'pressure', title: 'Pressure', iconKey: 'pressure', unit: 'PSI' },
  { key: 'temperature', title: 'Temp', iconKey: 'temperature', unit: '°C' },
  { key: 'load', title: 'Load', iconKey: 'load', unit: 'kg' },
  { key: 'lugnut', title: 'Nut', iconKey: 'nut', unit: '%' },
  { key: 'toe', title: 'Toe', iconKey: 'align', unit: '°' },
];

function formatAbsDelta(signal: ApiSignal, unit: string): string | null {
  const signed = signal.currentAvg - signal.previousAvg;
  if (unit === '°C') {
    const abs = Math.abs(signed);
    return `${abs >= 1 ? Math.round(abs) : abs.toFixed(1)}°C`;
  }
  if (unit === '°') {
    return `${signed >= 0 ? '+' : ''}${signed.toFixed(2)}°`;
  }
  if (unit === 'PSI' || unit === 'kg') {
    const rounded = Math.round(signed);
    return `${rounded >= 0 ? '+' : ''}${rounded}`;
  }
  if (unit === '%') {
    return `${Math.abs(Math.round(signed))}%`;
  }
  return null;
}

/** UI shows ▲/▼ separately — primary is always |deltaPct|%. */
function formatTrendLabel(signal: ApiSignal, unit: string): string {
  const pct = `${Math.abs(signal.deltaPct).toFixed(1)}%`;
  const secondary = formatAbsDelta(signal, unit);
  // Nut: percent-only (same unit as value). Others: "15.9% | 12°C" / "-7.9% | -8".
  if (secondary == null || unit === '%') return pct;
  return `${pct} | ${secondary}`;
}

function formatValue(avg: number, unit: string): string {
  if (unit === '°') return avg.toFixed(2);
  if (unit === 'kg' || unit === 'PSI') {
    return Math.round(avg).toLocaleString('en-US');
  }
  if (unit === '%') return String(Math.round(avg));
  return String(Math.round(avg));
}

function dailyAvgSeries(
  points: ApiSignal['currentDaily'] | ApiSignal['previousDaily'],
): number[] {
  // Always 7 slots from API; null avg → omit from scale by repeating neighbors later in sparkline.
  return points.map(p => (p.avg == null ? Number.NaN : p.avg));
}

function defaultInsight(meta: SignalMeta): { title: string; body: string } {
  switch (meta.key) {
    case 'pressure':
      return {
        title: 'Holding steady',
        body: 'Pressure stayed near target this week. Keep an eye on cold starts before long hauls.',
      };
    case 'temperature':
      return {
        title: 'Within normal band',
        body: 'Temperature tracked the usual corridor pattern. No heat climb detected on this wheel.',
      };
    case 'load':
      return {
        title: 'Load looking balanced',
        body: 'Average load is consistent with last week on this route.',
      };
    case 'lugnut':
      return {
        title: 'Torque looks solid',
        body: 'Nut torque stayed in the safe band this week.',
      };
    case 'toe':
      return {
        title: 'Alignment steady',
        body: 'Toe angle is stable. Uneven wear risk stays low at this level.',
      };
  }
}

function mapSignalToCard(signal: ApiSignal, meta: SignalMeta): WatchWeekCardData {
  const series = dailyAvgSeries(signal.currentDaily);
  const baseline = dailyAvgSeries(signal.previousDaily);
  const lastAvg =
    signal.currentDaily[signal.currentDaily.length - 1]?.avg ?? undefined;
  const copy = resolveInsightMessage(signal.message, {
    lastAvg: lastAvg ?? undefined,
  });
  const fallback = defaultInsight(meta);
  const trendDirection: 'up' | 'down' =
    signal.deltaPct < 0 ? 'down' : 'up';

  return {
    title: meta.title,
    iconKey: meta.iconKey,
    valueLabel: formatValue(signal.currentAvg, meta.unit),
    unit: meta.unit,
    noData: false,
    trendDirection,
    // Always surface API deltaPct (e.g. 15.9%, -7.9%, 0.0%).
    trendLabel: formatTrendLabel(signal, meta.unit),
    alert: copy?.alert,
    series,
    baseline,
    insightTitle: copy?.title ?? fallback.title,
    insightBody: copy?.body ?? fallback.body,
  };
}

export function mapTireToView(tire: ApiTireInsights): InsightsTireView {
  return {
    hasData: true,
    damageLevel: tire.damageLevel,
    damageLevelDeltaPct: tire.damageLevelDeltaPct,
    cumulativeKm: tire.tireLife.cumulativeKm,
    expectedTireLifeKm: tire.tireLife.expectedTireLifeKm,
    runningLowKm: tire.tireLife.runningLowKm,
    nearLimitKm: tire.tireLife.nearLimitKm,
    alertCount: tire.alertCount,
    recommendedReplaceDate: tire.recommendedReplaceDate,
  };
}

export function mapTireToWatchCards(tire: ApiTireInsights): WatchWeekCardData[] {
  return SIGNAL_META.map(meta => mapSignalToCard(tire.signals[meta.key], meta));
}

export function buildShinhanChipMaps(): {
  tireViews: Record<InsightsChipKey, InsightsTireView>;
  watchCards: Record<InsightsChipKey, WatchWeekCardData[]>;
} {
  const tireViews = {
    FL: EMPTY_INSIGHTS_TIRE_VIEW,
    FR: EMPTY_INSIGHTS_TIRE_VIEW,
    RRI: EMPTY_INSIGHTS_TIRE_VIEW,
    RRO: EMPTY_INSIGHTS_TIRE_VIEW,
    RLI: EMPTY_INSIGHTS_TIRE_VIEW,
    RLO: EMPTY_INSIGHTS_TIRE_VIEW,
  } as Record<InsightsChipKey, InsightsTireView>;

  const watchCards = {
    FL: [],
    FR: [],
    RRI: [],
    RRO: [],
    RLI: [],
    RLO: [],
  } as Record<InsightsChipKey, WatchWeekCardData[]>;

  for (const tire of SHINHAN_INSIGHTS.tires) {
    const view = mapTireToView(tire);
    const cards = mapTireToWatchCards(tire);
    for (const chip of API_TO_CHIPS[tire.wheelPosition]) {
      tireViews[chip] = view;
      watchCards[chip] = cards;
    }
  }

  return { tireViews, watchCards };
}

export const SHINHAN_CHIP_MAPS = buildShinhanChipMaps();
