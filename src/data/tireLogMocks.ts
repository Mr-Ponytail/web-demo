export type EventSeverity = 'danger' | 'caution' | 'good';
export type EventCategory =
  | 'Impact'
  | 'Pressure'
  | 'Leak'
  | 'Nut'
  | 'Wear'
  | 'Temp'
  | 'Load';

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

export function formatDateBadge(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);
  return `${date.getDate()} ${DAY_NAMES[date.getDay()]}`;
}
