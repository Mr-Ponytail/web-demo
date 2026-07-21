import type {
  HazardDetailEvent,
  HazardDetailSheetContent,
} from './hazardLocationMocks';

export type EventSeverity = 'danger' | 'caution' | 'good';
export type EventCategory =
  | 'Impact'
  | 'Pressure'
  | 'Leak'
  | 'Nut'
  | 'Wear'
  | 'Temp'
  | 'Load';

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
  Pressure: '50.2 PSI',
  Leak: 'Slow Leak Detected',
  Nut: 'Loose Nut',
  Wear: 'Uneven Wear',
  Temp: '49.2 PSI',
  Load: 'Overload',
};

const DETAIL_POSITIONS = ['RLO', 'FR', 'RRI', 'FL', 'RRO', 'RLI'] as const;

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

export type TireLogTag = {
  category: EventCategory;
  severity: EventSeverity;
};

export type TireLogSession = {
  id: string;
  time: string;
  location: string;
  severity: EventSeverity;
  tags: TireLogTag[];
  hazardSummary?: string;
  detailEvents?: HazardDetailEvent[];
  accentColor?: string;
};

export type TireLogDayGroup = {
  date: string;
  sessions: TireLogSession[];
};

export const TIRE_LOG_DAY_GROUPS: TireLogDayGroup[] = [
  {
    date: '2026-07-19',
    sessions: [
      {
        id: 's1',
        time: 'AM 08:24',
        location: 'Gangnam-daero',
        severity: 'danger',
        hazardSummary: 'Same impact zone detected 3 times this month',
        accentColor: '#28D6B9',
        detailEvents: [
          {
            id: 's1-detail-0',
            time: 'AM 08:24',
            tagLabel: 'Impact',
            severity: 'danger',
            title: 'Sharp impact detected',
            position: 'FL',
          },
          {
            id: 's1-detail-1',
            time: 'AM 08:24',
            tagLabel: 'Pressure',
            severity: 'caution',
            title: 'Pressure drop after impact',
            position: 'FL',
          },
        ],
        tags: [
          { category: 'Impact', severity: 'danger' },
          { category: 'Pressure', severity: 'caution' },
        ],
      },
      {
        id: 's2',
        time: 'PM 06:10',
        location: 'Olympic Expressway',
        severity: 'caution',
        tags: [{ category: 'Temp', severity: 'caution' }],
      },
    ],
  },
  {
    date: '2026-07-18',
    sessions: [
      {
        id: 's3',
        time: 'PM 02:05',
        location: 'Dongjak Bridge',
        severity: 'good',
        tags: [{ category: 'Wear', severity: 'good' }],
      },
    ],
  },
  {
    date: '2026-07-17',
    sessions: [
      {
        id: 's4',
        time: 'AM 07:40',
        location: 'Nambu Beltway',
        severity: 'caution',
        tags: [{ category: 'Load', severity: 'caution' }],
      },
      {
        id: 's5',
        time: 'PM 09:12',
        location: 'Parking lot',
        severity: 'danger',
        tags: [{ category: 'Nut', severity: 'danger' }],
      },
    ],
  },
  {
    date: '2026-07-15',
    sessions: [
      {
        id: 's6',
        time: 'AM 09:05',
        location: 'Seongsu Bridge',
        severity: 'good',
        tags: [],
      },
    ],
  },
];

export const HAZARD_BANNER_DESCRIPTION =
  'Same impact zone detected 3 times this month';

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
