/** Port of iSensorApp `presentation/screens/tire/constants.ts` (web). */

export const TIRE_CHEVRON_SIZE = 20;

export const TIRE_W = 55;
export const TIRE_H = 105;
export const TIRE_FRONT_CAR_W = 130;
export const TIRE_FRONT_CAR_H = 93;
export const TIRE_REAR_CAR_W = 129;
export const TIRE_REAR_CAR_H = 225;

export const TIRE_AXLE_FRONT_TIRE_GAP = 80;
export const TIRE_AXLE_REAR_SIDE_MARGIN = -10;
export const TIRE_AXLE_REAR_DUAL_GAP = 8;

export const TIRE_CARD_PAD_H = 12;
export const TIRE_CARD_PAD_TOP = 16;
export const TIRE_CARD_PAD_BOTTOM = 12;
export const TIRE_CARD_LABEL_HEIGHT = 20;
export const TIRE_CARD_LABEL_GAP = 8;
export const TIRE_REAR_OUTER_TIRE_OFFSET = 52;
export const TIRE_REAR_INNER_TIRE_UP_OFFSET = -32;

export const TIRE_FRONT_LABEL_GAP = 72;
export const TIRE_FRONT_TO_REAR_GAP = 15;
export const TIRE_REAR_TIRE_DOWN_OFFSET = 42;
export const TIRE_FRONT_TIRE_UP_OFFSET = -48;
export const TIRE_REAR_CHIP_GAP = 20;
export const TIRE_REAR_CHIP_BOTTOM_MIN_GAP = 113;

export const TIRE_DETAIL_LANE_GAP = 16;
export const TIRE_DETAIL_CARD_PAD_H = 12;
export const TIRE_DETAIL_CARD_H = 120;
export const TIRE_DETAIL_GAUGE_H = 23;
export const TIRE_DETAIL_INDICATOR_SIZE = 24;
/** Push whole gauge block slightly down (web visual tune). */
export const TIRE_DETAIL_GAUGE_OFFSET_Y = 0;
/** Indicator sits above the track (web: slightly higher than native 2). */
export const TIRE_DETAIL_INDICATOR_OFFSET_Y = 0;
/** Gauge track sinks below wrap bottom so it sits lower than the indicator. */
export const TIRE_DETAIL_GAUGE_TRACK_BOTTOM = 6;
/** Wrap taller than indicator so up/down offsets don’t clip. */
export const TIRE_DETAIL_GAUGE_WRAP_H = 30;

export const TIRE_DETAIL_VALUE_ABOVE_GAUGE = 0;
export const TIRE_DETAIL_VALUE_OFFSET_Y = 8;
export const TIRE_PRESSURE_GAUGE_MIN = 30;
export const TIRE_PRESSURE_GAUGE_MAX = 370;
export const TIRE_TEMP_GAUGE_MAX = 100;
export const TIRE_TEMP_DISPLAY_TARGET = 58;
export const TIRE_DETAIL_INACTIVE_OPACITY = 0.8;

/** Match RN `StyleSheet.hairlineWidth` (~1/devicePixelRatio). */
export const TIRE_HAIRLINE =
  typeof window !== 'undefined' ? 1 / (window.devicePixelRatio || 2) : 0.5;
export const TIRE_CAR_BODY_BETWEEN_HEIGHT =
  TIRE_FRONT_TO_REAR_GAP * 2 + TIRE_HAIRLINE;
export const TIRE_REAR_CAR_TOP = TIRE_FRONT_CAR_H + TIRE_CAR_BODY_BETWEEN_HEIGHT;

export const TIRE_UNCONNECTED_ICON_SIZE = 58;
export const TIRE_UNCONNECTED_ICON_GAP = 10;
export const TIRE_UNCONNECTED_ICON_SCAN_GAP = 12;
export const TIRE_UNCONNECTED_SCAN_BTN_H = 28;
export const TIRE_UNCONNECTED_CARD_BORDER_RADIUS = 8;
export const TIRE_UNCONNECTED_CARD_BORDER_WIDTH = 1;

export const TIRE_CONNECTED_CARD_W = TIRE_W + TIRE_CARD_PAD_H * 2;
export const TIRE_AXLE_REAR_INNER_OFFSET =
  TIRE_AXLE_REAR_SIDE_MARGIN + TIRE_CONNECTED_CARD_W + TIRE_AXLE_REAR_DUAL_GAP;
export const TIRE_CONNECTED_CARD_H =
  TIRE_CARD_PAD_TOP +
  TIRE_CARD_LABEL_HEIGHT +
  TIRE_CARD_LABEL_GAP +
  TIRE_H +
  TIRE_CARD_PAD_BOTTOM;
export const TIRE_CARD_HEIGHT = TIRE_CONNECTED_CARD_H;

export const TIRE_AXLE_BODY_MIN_HEIGHT =
  TIRE_REAR_CAR_TOP +
  TIRE_REAR_TIRE_DOWN_OFFSET +
  TIRE_REAR_OUTER_TIRE_OFFSET +
  TIRE_CARD_HEIGHT;

export const TIRE_REAR_CAR_TO_CHIP_GAP =
  TIRE_REAR_CHIP_GAP +
  TIRE_REAR_TIRE_DOWN_OFFSET +
  TIRE_REAR_OUTER_TIRE_OFFSET +
  TIRE_CARD_HEIGHT -
  TIRE_REAR_CAR_H;

export const TIRE_DETAIL_REAR_CHIP_LIFT = 44;
export const TIRE_DETAIL_REAR_CHIP_GAP =
  TIRE_REAR_CAR_TO_CHIP_GAP - TIRE_DETAIL_REAR_CHIP_LIFT;

export const TIRE_DETAIL_DIVIDER_LINE_H = 1;
export const TIRE_DETAIL_DIVIDER_Y = TIRE_FRONT_CAR_H + TIRE_FRONT_TO_REAR_GAP;
export const TIRE_DETAIL_DIVIDER_GAP = 33;
export const TIRE_DETAIL_REAR_ROW_GAP = 10;
export const TIRE_DETAIL_FRONT_ROW_TOP =
  TIRE_DETAIL_DIVIDER_Y - TIRE_DETAIL_DIVIDER_GAP - TIRE_DETAIL_CARD_H;
export const TIRE_DETAIL_REAR_MID_ROW_TOP =
  TIRE_DETAIL_DIVIDER_Y + TIRE_DETAIL_DIVIDER_LINE_H + TIRE_DETAIL_DIVIDER_GAP;
export const TIRE_DETAIL_REAR_OUTER_ROW_TOP =
  TIRE_DETAIL_REAR_MID_ROW_TOP + TIRE_DETAIL_CARD_H + TIRE_DETAIL_REAR_ROW_GAP;
export const TIRE_DETAIL_CARD_INSET = 10;
export const TIRE_DETAIL_OUTER_CARD_OFFSET = -6;
export const TIRE_DETAIL_BODY_MIN_HEIGHT = Math.max(
  TIRE_REAR_CAR_TOP + TIRE_REAR_CAR_H,
  TIRE_DETAIL_REAR_OUTER_ROW_TOP + TIRE_DETAIL_CARD_H,
);

export const TIRE_POSITION_LABELS = {
  FL: 'FL',
  FR: 'FR',
  LO: 'RLO',
  LI: 'RLI',
  RI: 'RRI',
  RO: 'RRO',
} as const;

export const TIRE_DETAIL_CARD_CONFIGS = [
  { key: 'FL' as const, metric: 'pressure' as const, row: 'front' as const, side: 'left' as const },
  { key: 'FR' as const, metric: 'pressure' as const, row: 'front' as const, side: 'right' as const },
  { key: 'LI' as const, metric: 'pressure' as const, row: 'rearMid' as const, side: 'left' as const },
  { key: 'RI' as const, metric: 'pressure' as const, row: 'rearMid' as const, side: 'right' as const },
  { key: 'LO' as const, metric: 'temp' as const, row: 'rearOuter' as const, side: 'left' as const },
  { key: 'RO' as const, metric: 'temp' as const, row: 'rearOuter' as const, side: 'right' as const },
];

export function detailCardWidth(screenWidth: number): number {
  return (screenWidth - 114 - TIRE_DETAIL_LANE_GAP) / 2;
}

export function detailGaugeWidth(screenWidth: number): number {
  return detailCardWidth(screenWidth) - TIRE_DETAIL_CARD_PAD_H * 2;
}

export function getDetailRowTop(row: 'front' | 'rearMid' | 'rearOuter'): number {
  if (row === 'front') return TIRE_DETAIL_FRONT_ROW_TOP;
  if (row === 'rearMid') return TIRE_DETAIL_REAR_MID_ROW_TOP;
  return TIRE_DETAIL_REAR_OUTER_ROW_TOP;
}

export function getGaugeProgress(metric: 'pressure' | 'temp', value: number): number {
  if (metric === 'pressure') {
    return Math.min(
      1,
      Math.max(
        0,
        (value - TIRE_PRESSURE_GAUGE_MIN) /
          (TIRE_PRESSURE_GAUGE_MAX - TIRE_PRESSURE_GAUGE_MIN),
      ),
    );
  }
  return Math.min(1, Math.max(0, value / TIRE_TEMP_GAUGE_MAX));
}
