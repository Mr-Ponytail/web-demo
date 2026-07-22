import type {
  HazardDetailEvent,
  HazardDetailSheetContent,
} from './hazardLocationMocks';
import {
  SHINHAN_HAZARD_BANNER,
  SHINHAN_TIRE_LOG_DAY_GROUPS,
} from './mapShinhanSessions';
import type {
  EventCategory,
  EventSeverity,
  TireLogDayGroup,
  TireLogSession,
} from './tireLogTypes';

export type {
  EventCategory,
  EventSeverity,
  TireLogDayGroup,
  TireLogSession,
  TireLogTag,
} from './tireLogTypes';

const DETAIL_TAG_LABEL: Record<EventCategory, string> = {
  Impact: 'Impact',
  Pressure: 'Low Pressure',
  Leak: 'Slow Leak',
  Nut: 'Lug Nut Loose',
  Wear: 'Uneven Wear',
  Temp: 'Temp rise',
  Load: 'Overload',
};

const DETAIL_TITLE: Record<EventCategory, string> = {
  Impact: 'Unexpected Shock',
  Pressure: 'Low Pressure',
  Leak: 'Slow Leak Detected',
  Nut: 'Loose Nut',
  Wear: 'Uneven Wear',
  Temp: 'Temperature rise',
  Load: 'Overload',
};

const DETAIL_POSITIONS = ['FL', 'FR', 'RL', 'RR', 'RL', 'FR'] as const;

const SESSION_ACCENT_COLOR: Record<EventSeverity, string> = {
  danger: '#FF6363',
  caution: '#F48200',
  good: '#1ED45A',
};

export const TIRELOG_CATEGORY_FILTERS: EventCategory[] = [
  'Impact',
  'Pressure',
  'Leak',
  'Nut',
  'Wear',
  'Temp',
  'Load',
];

/** Shinhan seeded drive sessions (Jun–Jul 2026), newest days first. */
export const TIRE_LOG_DAY_GROUPS: TireLogDayGroup[] = SHINHAN_TIRE_LOG_DAY_GROUPS;

export const HAZARD_BANNER_DESCRIPTION = SHINHAN_HAZARD_BANNER;

export const SEVERITY_TAG_COLORS: Record<
  EventSeverity,
  { bg: string; text: string }
> = {
  danger: { bg: '#FEECEC', text: '#FF6363' },
  caution: { bg: '#FEF4E6', text: '#F48200' },
  good: { bg: '#F2FFF6', text: '#1ED45A' },
};

export const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export const MONTH_FULL = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;

export function formatMonthYear(year: number, month: number) {
  return `${MONTH_SHORT[month]} ${year}`;
}

/** 0-based month indexes that have tire-log events for the given year (demo). */
export function getEventMonthsForYear(year: number): number[] {
  const months = new Set<number>();
  for (const group of TIRE_LOG_DAY_GROUPS) {
    const date = new Date(`${group.date}T00:00:00`);
    if (date.getFullYear() === year) {
      months.add(date.getMonth());
    }
  }
  return [...months].sort((a, b) => a - b);
}

export function formatDateBadge(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);
  return `${date.getDate()} ${DAY_NAMES[date.getDay()]}`;
}

export function getSessionDetailEvents(session: TireLogSession): HazardDetailEvent[] {
  if (session.detailEvents?.length) {
    return session.detailEvents;
  }

  return session.tags.map((tag, index) => ({
    id: `${session.id}-detail-${index}`,
    time: session.time,
    tagLabel: DETAIL_TAG_LABEL[tag.category],
    title: DETAIL_TITLE[tag.category],
    position: DETAIL_POSITIONS[index % DETAIL_POSITIONS.length],
    severity: tag.severity,
  }));
}

export function buildSessionDetailSheetContent(
  session: TireLogSession,
  dayDate: string,
): HazardDetailSheetContent {
  return {
    date: dayDate,
    location: session.location,
    events: getSessionDetailEvents(session),
    accentColor: session.accentColor ?? SESSION_ACCENT_COLOR[session.severity],
  };
}
