import type { TireKey, TireStatus } from '../data/tireMocks';

/** Layout derived from iSensorApp `detailConstants.ts`, parameterized by screen width. */
export function buildDetailLayout(sw: number) {
  const windowHeight =
    typeof window !== 'undefined' ? window.innerHeight : 844;
  const topFadeHeight = windowHeight * 0.5;

  const carW = 500;
  const carH = Math.round(carW * (3252 / 1581));

  const tireW = 95;
  const tireH = 204;
  const tireStartRight = 50;
  /** Web demo: lift vehicle scene ~30px vs native defaults. */
  const tireStartTop = 200;
  const focusCenterX = sw - tireStartRight - tireW / 2;
  const focusCenterY = tireStartTop + tireH / 2;

  const horizontalGap = 400;
  const rearGap = 500;
  const innerInset = 110;
  const innerLift = 0;
  const leftOutset = 10;
  const rightInset = 0;

  const viewHorizontalPan = 595;
  const verticalPanDelta = 500;
  const innerPanX = 90;

  const sceneExtraW = 600;
  const sceneW = sw + sceneExtraW;
  const carLeft = sceneW - 253 - carW;
  const carTop = 20;

  const leftLightW = 380;
  const leftLightH = 370;
  const leftLightOffsetX = -16;
  const leftLightOffsetY = 95;

  const rightLightW = 380;
  const rightLightH = 370;
  const rightLightOffsetX = 13;
  const rightLightOffsetY = 95;

  const sceneTireAnchors: Record<TireKey, { x: number; y: number }> = {
    FL: {
      x: focusCenterX - leftOutset,
      y: focusCenterY,
    },
    FR: {
      x: focusCenterX + horizontalGap - rightInset,
      y: focusCenterY,
    },
    LO: {
      x: focusCenterX - leftOutset,
      y: focusCenterY + rearGap,
    },
    LI: {
      x: focusCenterX + innerInset - leftOutset,
      y: focusCenterY + rearGap - innerLift,
    },
    RI: {
      x: focusCenterX + horizontalGap - innerInset - rightInset,
      y: focusCenterY + rearGap - innerLift,
    },
    RO: {
      x: focusCenterX + horizontalGap - rightInset,
      y: focusCenterY + rearGap,
    },
  };

  const viewportPan: Record<TireKey, { x: number; y: number }> = {
    FL: { x: leftOutset, y: 0 },
    FR: { x: -viewHorizontalPan + rightInset, y: 0 },
    LO: { x: leftOutset, y: -verticalPanDelta },
    LI: {
      x: -innerPanX + leftOutset,
      y: -verticalPanDelta,
    },
    RI: {
      x: -viewHorizontalPan + innerPanX + rightInset,
      y: -verticalPanDelta,
    },
    RO: {
      x: -viewHorizontalPan + rightInset,
      y: -verticalPanDelta,
    },
  };

  return {
    sw,
    topFadeHeight,
    carW,
    carH,
    carLeft,
    carTop,
    tireW,
    tireH,
    rearGap,
    verticalPanDelta,
    sceneW,
    sceneHeight: 760 + Math.max(rearGap, verticalPanDelta),
    leftLightW,
    leftLightH,
    leftLightOffsetX,
    leftLightOffsetY,
    rightLightW,
    rightLightH,
    rightLightOffsetX,
    rightLightOffsetY,
    sceneTireAnchors,
    viewportPan,
    fadeOutMs: 40,
    fadeInMs: 280,
    /** Extra delay before showing cards after left/right tire switch. */
    cardRevealDelayMs: 80,
    lightShowDelayMs: 400,
    selectorH: 100,
  };
}

export type DetailLayout = ReturnType<typeof buildDetailLayout>;

export const TIRE_DETAIL_ALL_KEYS: TireKey[] = [
  'FL',
  'FR',
  'LO',
  'LI',
  'RI',
  'RO',
];

export const TIRE_DETAIL_POSITION_LABELS: Record<
  TireKey,
  { axle: string; side: string }
> = {
  FL: { axle: 'FRONT', side: 'LEFT' },
  FR: { axle: 'FRONT', side: 'RIGHT' },
  LO: { axle: 'REAR', side: 'LEFT OUTER' },
  LI: { axle: 'REAR', side: 'LEFT INNER' },
  RI: { axle: 'REAR', side: 'RIGHT INNER' },
  RO: { axle: 'REAR', side: 'RIGHT OUTER' },
};

export const TIRE_DETAIL_SELECTOR_LABELS: Record<TireKey, string> = {
  FL: 'FL',
  FR: 'FR',
  LO: 'RLO',
  LI: 'RLI',
  RI: 'RRI',
  RO: 'RRO',
};

export function isRearInnerTire(key: TireKey): boolean {
  return key === 'LI' || key === 'RI';
}

export function isLeftTire(key: TireKey): boolean {
  return key === 'FL' || key === 'LO' || key === 'LI';
}

export function getTireImageKey(
  status: TireStatus,
): 'normal' | 'caution' | 'danger' {
  if (status === 'danger') return 'danger';
  if (status === 'caution') return 'caution';
  return 'normal';
}

export function getLightImageKey(
  status: TireStatus,
): 'normal' | 'caution' | 'danger' {
  return getTireImageKey(status);
}

export function getTireStatusDotColor(status: TireStatus): string | null {
  if (status === 'danger') return '#F66570';
  if (status === 'caution') return '#FF8E62';
  return null;
}

/** Approximate RN spring (tension -10, friction 20), slowed for web. */
export const VIEWPORT_TRANSITION =
  'transform 2000ms cubic-bezier(0.22, 1.05, 0.32, 1)';

/** Metric card / pressure gauge — from iSensorApp detailConstants. */
export const TIRE_DETAIL_METRIC_CARD_W = 68;
export const TIRE_DETAIL_METRIC_GAP = 7;
export const TIRE_DETAIL_PRESSURE_CARD_W =
  TIRE_DETAIL_METRIC_CARD_W * 2 + TIRE_DETAIL_METRIC_GAP;
export const TIRE_DETAIL_METRIC_CARD_H = 118;
export const TIRE_DETAIL_GAUGE_SIZE = 44;
export const TIRE_DETAIL_METRIC_ICON_SIZE = 26;
export const TIRE_DETAIL_GAUGE_R = 18;
export const TIRE_DETAIL_GAUGE_SW = 5;
export const TIRE_DETAIL_GAUGE_C = 2 * Math.PI * TIRE_DETAIL_GAUGE_R;
export const TIRE_DETAIL_GAUGE_ROT = -90;
export const TIRE_DETAIL_PRESSURE_GAUGE_H = 10;
export const TIRE_DETAIL_PRESSURE_PIN_SIZE = 40;
export const TIRE_DETAIL_PRESSURE_PIN_GAUGE_OVERLAP = 8;
export const TIRE_DETAIL_PRESSURE_PIN_OFFSET_Y = 3;
export const TIRE_DETAIL_PRESSURE_TICK_LEFT = 0.32;
export const TIRE_DETAIL_PRESSURE_TICK_RIGHT = 0.68;
export const TIRE_DETAIL_PRESSURE_TICK_TOP = -5;
export const TIRE_DETAIL_PRESSURE_TICK_POSITIONS = [
  TIRE_DETAIL_PRESSURE_TICK_LEFT,
  TIRE_DETAIL_PRESSURE_TICK_RIGHT,
] as const;

export type MetricLevel = 'normal' | 'caution' | 'danger';

export function getMetricLevel(progress: number): MetricLevel {
  if (progress >= 0.8) return 'danger';
  if (progress >= 0.5) return 'caution';
  return 'normal';
}

export function getGaugeColor(progress: number): string {
  const level = getMetricLevel(progress);
  if (level === 'danger') return '#FF6363';
  if (level === 'caution') return '#FF8C00';
  return '#1ED45A';
}

export function getPressureGaugeStatus(progress: number): MetricLevel {
  const p = Math.min(1, Math.max(0, progress));
  const cautionBand = 0.05;
  const tickLeft = TIRE_DETAIL_PRESSURE_TICK_LEFT;
  const tickRight = TIRE_DETAIL_PRESSURE_TICK_RIGHT;
  if (
    Math.abs(p - tickLeft) <= cautionBand ||
    Math.abs(p - tickRight) <= cautionBand
  ) {
    return 'caution';
  }
  if (p < tickLeft || p > tickRight) return 'danger';
  return 'normal';
}
