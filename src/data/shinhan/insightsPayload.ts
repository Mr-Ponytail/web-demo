import type {
  ApiDailyPoint,
  ApiInsightsPayload,
  ApiSignal,
  ApiTireInsights,
  ApiTireLife,
} from './types';

const DEMO_TIRE_LIFE: ApiTireLife = {
  cumulativeKm: 10458,
  expectedTireLifeKm: 80000,
  runningLowKm: 56000,
  nearLimitKm: 72000,
  tireAgeMonths: 90,
  ageLimitMonths: 120,
  ageRunningLowMonths: 84,
  ageNearLimitMonths: 108,
  state: 'RUNNING_LOW',
};

function addDays(isoDate: string, offset: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + offset));
  return date.toISOString().slice(0, 10);
}

function round(n: number, digits = 2): number {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

function slopingDaily(
  startDate: string,
  values: Array<{ avg: number; min: number; max: number }>,
): ApiDailyPoint[] {
  return values.map((v, i) => ({
    date: addDays(startDate, i),
    ...v,
  }));
}

/**
 * Build a lively 7-day series around `center` with a mild trend + day wobble.
 * `pattern` shifts the wave phase so each tire/signal looks different.
 */
function wavyAvgs(
  center: number,
  amplitude: number,
  trendPerDay: number,
  pattern: number,
  days = 7,
): number[] {
  return Array.from({ length: days }, (_, i) => {
    const wave = Math.sin((i + pattern) * 0.95) * amplitude;
    const bump = ((i + pattern * 3) % 3 === 0 ? amplitude * 0.35 : 0);
    const dip = ((i + pattern) % 4 === 2 ? -amplitude * 0.25 : 0);
    return round(center + trendPerDay * i + wave + bump + dip, 2);
  });
}

function dailyFromAvgs(
  startDate: string,
  avgs: number[],
  band: number,
): ApiDailyPoint[] {
  return avgs.map((avg, i) => ({
    date: addDays(startDate, i),
    avg,
    min: round(avg - band, 2),
    max: round(avg + band, 2),
  }));
}

function signalFromSeries(
  current: number[],
  previous: number[],
  band: number,
  currentStart: string,
  previousStart: string,
  message: ApiSignal['message'] = null,
): ApiSignal {
  const currentAvg = round(
    current.reduce((s, v) => s + v, 0) / current.length,
    2,
  );
  const previousAvg = round(
    previous.reduce((s, v) => s + v, 0) / previous.length,
    2,
  );
  const deltaPct =
    previousAvg === 0
      ? 0
      : round(((currentAvg - previousAvg) / previousAvg) * 100, 1);

  return {
    currentAvg,
    previousAvg,
    deltaPct,
    currentDaily: dailyFromAvgs(currentStart, current, band),
    previousDaily: dailyFromAvgs(previousStart, previous, band),
    message,
  };
}

const CURRENT_START = '2026-07-15';
const PREVIOUS_START = '2026-07-08';

/** Per-wheel lively baselines (RR pressure / RL temp overridden below). */
function baseSignals(
  wheel: ApiTireInsights['wheelPosition'],
  pressureCenter: number,
): ApiTireInsights['signals'] {
  const phase = { FL: 0, FR: 1.2, RL: 2.1, RR: 3.4 }[wheel];

  return {
    pressure: signalFromSeries(
      wavyAvgs(pressureCenter, 2.8, -0.15, phase),
      wavyAvgs(pressureCenter + 1.2, 2.2, 0.05, phase + 0.6),
      2.5,
      CURRENT_START,
      PREVIOUS_START,
    ),
    temperature: signalFromSeries(
      wavyAvgs(74, 4.5, 0.55, phase + 0.4),
      wavyAvgs(70, 3.2, 0.2, phase + 1.1),
      5,
      CURRENT_START,
      PREVIOUS_START,
    ),
    load: signalFromSeries(
      wavyAvgs(1210, 55, 8, phase + 0.8),
      wavyAvgs(1160, 40, 3, phase + 1.5),
      45,
      CURRENT_START,
      PREVIOUS_START,
    ),
    toe: signalFromSeries(
      wavyAvgs(0.032, 0.006, 0.0008, phase + 0.2),
      wavyAvgs(0.03, 0.004, 0.0002, phase + 0.9),
      0.003,
      CURRENT_START,
      PREVIOUS_START,
    ),
    lugnut: signalFromSeries(
      wavyAvgs(96, 2.2, -0.45, phase + 1.3),
      wavyAvgs(98.5, 1.4, -0.1, phase + 0.3),
      1.2,
      CURRENT_START,
      PREVIOUS_START,
    ),
  };
}

function tire(
  wheelPosition: ApiTireInsights['wheelPosition'],
  damageLevel: number,
  damageLevelDeltaPct: number,
  alertCount: number,
  alertCountDelta: number,
  signals: ApiTireInsights['signals'],
): ApiTireInsights {
  return {
    wheelPosition,
    damageLevel,
    damageLevelDeltaPct,
    tireLife: { ...DEMO_TIRE_LIFE },
    alertCount,
    alertCountDelta,
    recommendedReplaceDate: '2027-02-06',
    signals,
  };
}

/** Hero story: RL heat climb (keep API message + strong upward week). */
const rlTemperature: ApiSignal = {
  currentAvg: 87.6,
  previousAvg: 75.57,
  deltaPct: 15.9,
  currentDaily: slopingDaily(CURRENT_START, [
    { avg: 82.5, min: 76.5, max: 88.5 },
    { avg: 84.2, min: 78.2, max: 90.2 },
    { avg: 85.9, min: 79.9, max: 91.9 },
    { avg: 87.6, min: 81.6, max: 93.6 },
    { avg: 89.3, min: 83.3, max: 95.3 },
    { avg: 91.0, min: 85.0, max: 97.0 },
    { avg: 92.7, min: 86.7, max: 98.7 },
  ]),
  previousDaily: slopingDaily(PREVIOUS_START, [
    { avg: 71.2, min: 65.5, max: 76.8 },
    { avg: 72.8, min: 67.0, max: 78.5 },
    { avg: 73.5, min: 67.8, max: 79.2 },
    { avg: 75.7, min: 69.7, max: 81.7 },
    { avg: 77.4, min: 71.4, max: 83.4 },
    { avg: 79.1, min: 73.1, max: 85.1 },
    { avg: 80.8, min: 74.8, max: 86.8 },
  ]),
  message: {
    code: 'TEMP_PEAK_CLIMBING',
    params: { maxSlopePerDay: 1.7, peakMax: 98.7 },
  },
};

/** Hero story: RR slow leak (keep API message + clear downward week). */
const rrPressure: ApiSignal = {
  currentAvg: 92.6,
  previousAvg: 100.58,
  deltaPct: -7.9,
  currentDaily: slopingDaily(CURRENT_START, [
    { avg: 96.35, min: 93.85, max: 98.85 },
    { avg: 95.1, min: 92.6, max: 97.6 },
    { avg: 93.85, min: 91.35, max: 96.35 },
    { avg: 92.6, min: 90.1, max: 95.1 },
    { avg: 91.35, min: 88.85, max: 93.85 },
    { avg: 90.1, min: 87.6, max: 92.6 },
    { avg: 88.85, min: 86.35, max: 91.35 },
  ]),
  previousDaily: slopingDaily(PREVIOUS_START, [
    { avg: 102.4, min: 99.9, max: 104.9 },
    { avg: 102.05, min: 99.55, max: 104.55 },
    { avg: 101.7, min: 99.2, max: 104.2 },
    { avg: 101.35, min: 98.85, max: 103.85 },
    { avg: 100.1, min: 97.6, max: 102.6 },
    { avg: 98.85, min: 96.35, max: 101.35 },
    { avg: 97.6, min: 95.1, max: 100.1 },
  ]),
  message: {
    code: 'PRESSURE_BELOW_TARGET_SOON',
    params: { slopePerDay: -1.25, deltaPct: -7.9 },
  },
};

/** Seeded Insights response for vehicle 6a45ef1da3ddbd4f721b4186 (window [07-15, 07-22)). */
export const SHINHAN_INSIGHTS: ApiInsightsPayload = {
  range: {
    from: '2026-07-15T00:00:00Z',
    to: '2026-07-22T00:00:00Z',
  },
  previousRange: {
    from: '2026-07-08T00:00:00Z',
    to: '2026-07-15T00:00:00Z',
  },
  wheelCount: 6,
  tires: [
    tire('FL', 77.5, 1.2, 1, 1, baseSignals('FL', 107)),
    tire('FR', 76.7, 0.6, 2, 1, baseSignals('FR', 108)),
    tire('RL', 76.7, 1.2, 1, 0, {
      ...baseSignals('RL', 108),
      temperature: rlTemperature,
    }),
    tire('RR', 77.1, 1.6, 3, 2, {
      ...baseSignals('RR', 108),
      pressure: rrPressure,
    }),
  ],
};

/** Fixed demo "today" so the seeded week stays stable. */
export const SHINHAN_DEMO_NOW = new Date(2026, 6, 22);
