/** Mirrors iSensorApp `screens/tirelog/constants.ts` hazard map values. */
export const HAZARD_INFO_CARD_RADIUS = 12;
export const HAZARD_INFO_CARD_MIN_HEIGHT = 48;
export const HAZARD_BOTTOM_CARD_GAP = 20;
export const HAZARD_BOTTOM_CARD_WIDTH = 140;
export const HAZARD_BOTTOM_CARD_HEIGHT = 180;
export const HAZARD_REPORT_UNDO_SECONDS = 10;
export const HAZARD_REPORT_UNDO_RING_SIZE = 24;
export const HAZARD_REPORT_UNDO_RING_STROKE = 2.5;
export const HAZARD_BOTTOM_BTN_HEIGHT = 52;
export const HAZARD_REPORT_TOAST_ABOVE_BUTTONS = -20;
export const HAZARD_MARKER_SHEET_MAX_HEIGHT_RATIO = 0.68;
export const HAZARD_MARKER_FOCUS_PADDING_TOP = 300;
export const HAZARD_INITIAL_MAP_PADDING_BOTTOM = 140;

/** Extra lift so pins sit clearly above the summary card carousel. */
export const HAZARD_MAP_PADDING_EXTRA = 28;

/** Extra bottom padding at max zoom-in to lift map focus above bottom UI. */
export const HAZARD_MAP_ZOOM_FOCUS_LIFT = 140;

/** Lowers the initial map focus slightly on screen (subtract from bottom padding). */
export const HAZARD_MAP_FOCUS_SHIFT_DOWN = 120;

/** Demo hazard cluster geographic shift (west, north). */
export const HAZARD_DEMO_GEO_OFFSET: [number, number] = [-0.0002, 0.0001];

/** Map camera easing — slow, smooth zoom for marker focus/reset. */
export const HAZARD_MAP_FOCUS_DURATION_MS = 600;
export const HAZARD_MAP_RESET_DURATION_MS = 600;
export const HAZARD_MAP_PIN_ZOOM_TRANSITION_MS = 120;
export const HAZARD_MAP_PIN_SELECTION_TRANSITION_MS = 480;

/** Marker detail bottom sheet slide animation. */
export const HAZARD_MARKER_SHEET_OPEN_DURATION_MS = 450;
export const HAZARD_MARKER_SHEET_CLOSE_DURATION_MS = 400;

/** Summary cards bottom panel dismiss animation. */
export const HAZARD_BOTTOM_PANEL_DISMISS_DURATION_MS = 400;

/** AI Insight card expand/collapse animation. */
export const HAZARD_INFO_CARD_EXPAND_DURATION_MS = 700;
export const HAZARD_INFO_CARD_DETAIL_FADE_DURATION_MS = 220;
