/** Port of iSensorApp `presentation/screens/insights/constants.ts` (scroll). */
export const INSIGHTS_HEADER_FADE_DISTANCE = 120;
export const INSIGHTS_TITLE_COLLAPSE_DISTANCE = 64;
export const INSIGHTS_SCROLL_BOTTOM_SPACER = 40;
export const INSIGHTS_CHIP_GRID_ANIM_MS = 250;
export const BLE_GRID_HEIGHT = 153;
export const INSIGHTS_CHIP_GRID_EXPAND_HEIGHT = BLE_GRID_HEIGHT + 24;

/** Extra scroll content padding below tab bar (Insights scrollContent.paddingBottom). */
export const INSIGHTS_SCROLL_PADDING_BOTTOM = 80;

/** Tire Log ScrollView content padding below floating tab bar (+ inset handled by --safe-b). */
export const TIRELOG_SCROLL_PADDING_BOTTOM = 16;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function insightsGaugeFillOpacity(scrollY: number): number {
  return clamp(1 - scrollY / INSIGHTS_HEADER_FADE_DISTANCE, 0, 1);
}

export function insightsTitleOpacity(
  scrollY: number,
  collapseDistance: number,
): number {
  return clamp(1 - scrollY / (collapseDistance * 0.7), 0, 1);
}

export function insightsStickyShiftY(
  scrollY: number,
  collapseDistance: number,
  titleRowHeight: number,
): number {
  const progress = clamp(scrollY / collapseDistance, 0, 1);
  return -progress * titleRowHeight;
}

export function insightsStickyClipHeight(
  scrollY: number,
  collapseDistance: number,
  stickyBodyHeight: number,
  titleRowHeight: number,
): number {
  const progress = clamp(scrollY / collapseDistance, 0, 1);
  return stickyBodyHeight - progress * titleRowHeight;
}
