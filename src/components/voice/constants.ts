export const CONTENT_HORIZONTAL_PADDING = 24;
export const AI_BUTTON_SIZE = 80;
export const CANCEL_BUTTON_SIZE = 36;
export const SPARK_ICON_SIZE = 24;
export const LIVE_FONT_SIZE = 20;
export const HISTORY_FONT_SIZE = 18;
export const HISTORY_OPACITY = 0.6;
export const HEADER_FADE_MS = 250;
export const TRANSCRIPT_RISE_MS = 550;
export const TRANSCRIPT_LIVE_MARGIN_TOP = 23;
export const LISTENING_HEADER_HEIGHT = SPARK_ICON_SIZE + 6 + 36;
export const TRANSCRIPT_BASE_MARGIN =
  LISTENING_HEADER_HEIGHT + TRANSCRIPT_LIVE_MARGIN_TOP;
export const INSIGHT_CARD_GAP = 16;
export const HAZARD_REPORT_UNDO_SECONDS = 10;
export const HAZARD_REPORT_UNDO_RING_SIZE = 24;
export const HAZARD_REPORT_UNDO_RING_STROKE = 2.5;

export const PULL_OVER_PROMPT = 'Should I pull over?';
export const POTHOLE_PROMPT = 'Report the pothole I just hit.';

export const GUIDE_PROMPTS = [
  'Which tire needs attention first?',
  POTHOLE_PROMPT,
  PULL_OVER_PROMPT,
] as const;

export function isPullOverPrompt(text: string): boolean {
  return /pull\s*over/i.test(text);
}

export function isPotholePrompt(text: string): boolean {
  return /pothole/i.test(text);
}

export function isDemoGuidePrompt(text: string): boolean {
  return isPullOverPrompt(text) || isPotholePrompt(text);
}

export function formatHistoryTranscript(transcript: string): string {
  return transcript.replace(/\n/g, ' / ');
}
