import { useEffect, useMemo, useState } from 'react';
import { IMG } from '../../assets';
import {
  MONTH_SHORT_LABELS,
  WEEKDAY_LABELS,
  buildMonthCells,
  getWeekRangeForDate,
  startOfDay,
  type InsightsWeekRange,
} from '../../data/insightsWeek';
import './InsightsWeekCalendarModal.css';

type Props = {
  visible: boolean;
  onClose: () => void;
  selectedWeek: InsightsWeekRange;
  onSelectWeek: (week: InsightsWeekRange) => void;
};

export function InsightsWeekCalendarModal({
  visible,
  onClose,
  selectedWeek,
  onSelectWeek,
}: Props) {
  const [viewYear, setViewYear] = useState(selectedWeek.start.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedWeek.start.getMonth());
  const [pickerYear, setPickerYear] = useState(selectedWeek.start.getFullYear());
  const [mode, setMode] = useState<'calendar' | 'month'>('calendar');
  const [selectionEnabled, setSelectionEnabled] = useState(false);
  const [entered, setEntered] = useState(false);

  const selectedStartTs = selectedWeek.start.getTime();

  useEffect(() => {
    if (!visible) {
      setEntered(false);
      setSelectionEnabled(false);
      setMode('calendar');
      return;
    }

    setViewYear(selectedWeek.start.getFullYear());
    setViewMonth(selectedWeek.start.getMonth());
    setPickerYear(selectedWeek.start.getFullYear());
    setMode('calendar');
    setSelectionEnabled(false);

    const frame = requestAnimationFrame(() => setEntered(true));
    const timer = window.setTimeout(() => setSelectionEnabled(true), 350);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [visible, selectedStartTs, selectedWeek.start]);

  const cells = useMemo(
    () => buildMonthCells(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  if (!visible) return null;

  const shiftMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const isInRange = (date: Date) => {
    const t = startOfDay(date).getTime();
    return (
      t >= startOfDay(selectedWeek.start).getTime() &&
      t <= startOfDay(selectedWeek.end).getTime()
    );
  };

  const handleSelectDate = (date: Date) => {
    if (!selectionEnabled) return;
    onSelectWeek(getWeekRangeForDate(date));
    onClose();
  };

  const handleSelectMonth = (monthIndex: number) => {
    setViewYear(pickerYear);
    setViewMonth(monthIndex);
    setMode('calendar');
  };

  return (
    <div className="week-cal-root" role="presentation">
      <button
        type="button"
        className={
          entered
            ? 'week-cal__backdrop week-cal__backdrop--open'
            : 'week-cal__backdrop'
        }
        aria-label="Close calendar"
        onClick={onClose}
      />

      <div
        className={entered ? 'week-cal__wrap week-cal__wrap--open' : 'week-cal__wrap'}
      >
        <div
          className="week-cal__card"
          role="dialog"
          aria-modal="true"
          aria-label="Select week"
        >
          {mode === 'calendar' ? (
            <>
              <div className="week-cal__header">
                <button
                  type="button"
                  className="week-cal__nav"
                  aria-label="Previous month"
                  onClick={() => shiftMonth(-1)}
                >
                  <img
                    className="week-cal__chevron-left"
                    src={IMG.chevronCalendar}
                    alt=""
                    width={18}
                    height={18}
                  />
                </button>
                <button
                  type="button"
                  className="week-cal__month-center"
                  onClick={() => {
                    setPickerYear(viewYear);
                    setMode('month');
                  }}
                >
                  <span className="week-cal__month-title">
                    {MONTH_SHORT_LABELS[viewMonth]} {viewYear}
                  </span>
                  <i className="week-cal__caret" />
                </button>
                <button
                  type="button"
                  className="week-cal__nav"
                  aria-label="Next month"
                  onClick={() => shiftMonth(1)}
                >
                  <img
                    src={IMG.chevronCalendar}
                    alt=""
                    width={18}
                    height={18}
                  />
                </button>
              </div>

              <div className="week-cal__weekdays">
                {WEEKDAY_LABELS.map(label => (
                  <span key={label}>{label}</span>
                ))}
              </div>

              <div className="week-cal__grid">
                {Array.from(
                  { length: Math.ceil(cells.length / 7) },
                  (_, weekIndex) => {
                    const weekCells = cells.slice(
                      weekIndex * 7,
                      weekIndex * 7 + 7,
                    );
                    const weekSelected = weekCells.some(cell =>
                      isInRange(cell.date),
                    );
                    return (
                      <button
                        key={`week-${weekIndex}`}
                        type="button"
                        className={
                          weekSelected
                            ? 'week-cal__week week-cal__week--on'
                            : 'week-cal__week'
                        }
                        disabled={!selectionEnabled}
                        onClick={() => handleSelectDate(weekCells[0]!.date)}
                      >
                        {weekCells.map(cell => {
                          const inRange = isInRange(cell.date);
                          return (
                            <span key={cell.key} className="week-cal__day">
                              <span
                                className={[
                                  'week-cal__day-text',
                                  !cell.inCurrentMonth
                                    ? 'week-cal__day-text--muted'
                                    : '',
                                  inRange ? 'week-cal__day-text--on' : '',
                                ]
                                  .filter(Boolean)
                                  .join(' ')}
                              >
                                {cell.date.getDate()}
                              </span>
                            </span>
                          );
                        })}
                      </button>
                    );
                  },
                )}
              </div>
            </>
          ) : (
            <>
              <div className="week-cal__header">
                <button
                  type="button"
                  className="week-cal__nav"
                  aria-label="Previous year"
                  onClick={() => setPickerYear(year => year - 1)}
                >
                  <img
                    className="week-cal__chevron-left"
                    src={IMG.chevronCalendar}
                    alt=""
                    width={18}
                    height={18}
                  />
                </button>
                <span className="week-cal__month-title">{pickerYear}</span>
                <button
                  type="button"
                  className="week-cal__nav"
                  aria-label="Next year"
                  onClick={() => setPickerYear(year => year + 1)}
                >
                  <img
                    src={IMG.chevronCalendar}
                    alt=""
                    width={18}
                    height={18}
                  />
                </button>
              </div>

              <div className="week-cal__months">
                {MONTH_SHORT_LABELS.map((label, monthIndex) => {
                  const selected =
                    pickerYear === viewYear && monthIndex === viewMonth;
                  return (
                    <button
                      key={label}
                      type="button"
                      className="week-cal__month-cell"
                      onClick={() => handleSelectMonth(monthIndex)}
                    >
                      <span
                        className={
                          selected
                            ? 'week-cal__month-pill week-cal__month-pill--on'
                            : 'week-cal__month-pill'
                        }
                      >
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
