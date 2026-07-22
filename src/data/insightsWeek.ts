export type InsightsWeekRange = {
  start: Date;
  end: Date;
};

export const WEEKDAY_LABELS = [
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
  'Sun',
] as const;

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export const MONTH_SHORT_LABELS = [
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

type DayCell = {
  key: string;
  date: Date;
  inCurrentMonth: boolean;
};

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeekMonday(date: Date) {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function endOfWeekSunday(date: Date) {
  const start = startOfWeekMonday(date);
  return new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
}

export function getWeekRangeForDate(date: Date): InsightsWeekRange {
  return {
    start: startOfWeekMonday(date),
    end: endOfWeekSunday(date),
  };
}

export function shiftWeekRange(
  week: InsightsWeekRange,
  weekDelta: number,
): InsightsWeekRange {
  const next = new Date(
    week.start.getFullYear(),
    week.start.getMonth(),
    week.start.getDate() + weekDelta * 7,
  );
  return getWeekRangeForDate(next);
}

export function formatWeekRangeLabel(start: Date, end: Date) {
  const fmt = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, '0');
    return `${dd} (${WEEKDAY_SHORT[d.getDay()]})`;
  };
  return `${fmt(start)}-${fmt(end)}`;
}

export function formatWeekMonthLabel(week: InsightsWeekRange) {
  const mid = new Date(
    week.start.getFullYear(),
    week.start.getMonth(),
    week.start.getDate() + 3,
  );
  return `${MONTH_SHORT_LABELS[mid.getMonth()]} ${mid.getFullYear()}`;
}

/** Fixed demo clock (Shinhan seed as-of date) so the story week stays stable. */
export const DEMO_CLOCK = new Date(2026, 6, 22);

/** Demo default: the week containing the Shinhan seed "today". */
export function getDemoInitialWeek(): InsightsWeekRange {
  return getWeekRangeForDate(DEMO_CLOCK);
}

/** True when the week's Monday is after today — no insights data yet. */
export function isFutureInsightsWeek(
  week: InsightsWeekRange,
  now: Date = DEMO_CLOCK,
) {
  return startOfDay(week.start).getTime() > startOfDay(now).getTime();
}

export function weekSeed(week: InsightsWeekRange): number {
  const d = week.start;
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

/** Monday-first calendar cells */
export function buildMonthCells(year: number, month: number): DayCell[] {
  const first = new Date(year, month, 1);
  const mondayOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const cells: DayCell[] = [];

  for (let i = mondayOffset - 1; i >= 0; i -= 1) {
    const day = prevMonthDays - i;
    cells.push({
      key: `prev-${day}`,
      date: new Date(year, month - 1, day),
      inCurrentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      key: `cur-${day}`,
      date: new Date(year, month, day),
      inCurrentMonth: true,
    });
  }

  const trailing = (7 - (cells.length % 7)) % 7;
  for (let day = 1; day <= trailing; day += 1) {
    cells.push({
      key: `next-${day}`,
      date: new Date(year, month + 1, day),
      inCurrentMonth: false,
    });
  }

  return cells;
}
