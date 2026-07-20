export type InsightsChipKey = 'FL' | 'FR' | 'RRI' | 'RRO' | 'RLI' | 'RLO';

export const INSIGHTS_CHIP_KEYS: InsightsChipKey[] = [
  'FL',
  'FR',
  'RRI',
  'RRO',
  'RLI',
  'RLO',
];

export const INSIGHTS_CHIP_LABELS: Record<InsightsChipKey, string> = {
  FL: 'FRONT LEFT',
  FR: 'FRONT RIGHT',
  RRI: 'REAR RIGHT INSIDE',
  RRO: 'REAR RIGHT OUTSIDE',
  RLI: 'REAR LEFT INSIDE',
  RLO: 'REAR LEFT OUTSIDE',
};

export type TireLifeThresholds = {
  expectedTireLifeKm: number;
  runningLowKm: number;
  nearLimitKm: number;
};

export type InsightsTireView = {
  damageLevel: number;
  damageLevelDeltaPct: number;
  cumulativeKm: number;
  alertCount: number;
  recommendedReplaceDate: string | null;
} & TireLifeThresholds;

export const DEFAULT_INSIGHTS_TIRE_VIEW: InsightsTireView = {
  damageLevel: 30,
  damageLevelDeltaPct: 4.2,
  cumulativeKm: 52000,
  expectedTireLifeKm: 100000,
  runningLowKm: 56000,
  nearLimitKm: 72000,
  alertCount: 3,
  recommendedReplaceDate: null,
};

export type WatchWeekCardData = {
  title: string;
  iconKey: 'pressure' | 'temperature' | 'load' | 'nut' | 'align';
  valueLabel: string;
  unit: string;
  trendDirection: 'up' | 'down';
  trendLabel: string;
  alert?: 'caution' | 'danger';
  series: number[];
  baseline: number[];
  insightTitle: string;
  insightBody: string;
};

export const WATCH_WEEK_CARDS: WatchWeekCardData[] = [
  {
    title: 'Pressure',
    iconKey: 'pressure',
    valueLabel: '88',
    unit: 'PSI',
    trendDirection: 'down',
    trendLabel: '6.2% | -6',
    alert: 'caution',
    series: [78, 82, 74, 80, 72, 70, 66],
    baseline: [84, 84, 83, 84, 84, 83, 84],
    insightTitle: 'Dropping below target soon',
    insightBody:
      'At this rate, pressure falls below target in about 3 days. Top it up ahead of time to stay safe.',
  },
  {
    title: 'Temp',
    iconKey: 'temperature',
    valueLabel: '78',
    unit: '°C',
    trendDirection: 'up',
    trendLabel: '14°C',
    alert: 'danger',
    series: [52, 58, 54, 62, 68, 72, 78],
    baseline: [55, 56, 55, 56, 55, 56, 55],
    insightTitle: 'Running hotter than usual',
    insightBody:
      'Same route, but it ran hotter this week. Low pressure may be hiding underneath.',
  },
  {
    title: 'Load',
    iconKey: 'load',
    valueLabel: '1,610',
    unit: 'kg',
    trendDirection: 'up',
    trendLabel: '6.2% | +94',
    alert: 'caution',
    series: [1320, 1400, 1360, 1480, 1520, 1580, 1610],
    baseline: [1450, 1450, 1460, 1450, 1450, 1460, 1450],
    insightTitle: 'Running near max load',
    insightBody:
      'Peak load hit 1,610 kg this week, close to the 1,700 kg limit. Tire life drops faster at this level.',
  },
  {
    title: 'Nut',
    iconKey: 'nut',
    valueLabel: '71',
    unit: '%',
    trendDirection: 'down',
    trendLabel: '18%',
    alert: 'danger',
    series: [92, 88, 84, 80, 76, 73, 71],
    baseline: [90, 90, 89, 90, 90, 89, 90],
    insightTitle: 'Nut torque past safe line',
    insightBody:
      "Nut torque dropped below the safe threshold. Re-torque before departure, don't run it like this.",
  },
  {
    title: 'Toe',
    iconKey: 'align',
    valueLabel: '0.06',
    unit: '°',
    trendDirection: 'down',
    trendLabel: '+0.01°',
    series: [0.04, 0.045, 0.042, 0.05, 0.055, 0.058, 0.06],
    baseline: [0.04, 0.04, 0.041, 0.04, 0.04, 0.041, 0.04],
    insightTitle: 'Drifting slightly',
    insightBody:
      'Wheel alignment is drifting slightly. Uneven wear could start if it continues.',
  },
];
