import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IMG } from '../../assets';
import {
  DEMO_EXPORT_SENSOR_ID,
  INSIGHTS_EXPORT_ACTION_ICON_SIZE,
  downloadCsvFile,
  openCsvInNewTab,
  prepareDemoCsvExport,
} from '../../data/exportCsvMocks';
import { formatCsvByteSize } from '../../data/readingExportCsv';
import { useBottomSheetDragDismiss } from '../../hooks/useBottomSheetDragDismiss';
import './ExportRangeSheet.css';

const SAVE_SUCCESS_MESSAGE = 'CSV saved to Downloads';
const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_LABELS = [
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
];
const MONTH_SHORT_LABELS = [
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
];

type DayCell = {
  key: string;
  date: Date;
  inCurrentMonth: boolean;
};

type PreparedCsv = {
  csv: string;
  fileName: string;
  rowCount: number;
  byteSize: number;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  wheelPosition: string;
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a: Date | null, b: Date | null) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDisplayDate(date: Date | null) {
  if (!date) return '-';
  return `${MONTH_SHORT_LABELS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function buildMonthCells(year: number, month: number): DayCell[] {
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const cells: DayCell[] = [];

  for (let i = startWeekday - 1; i >= 0; i -= 1) {
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

export function ExportRangeSheet({ visible, onClose, wheelPosition }: Props) {
  const now = useMemo(() => new Date(), []);
  const [entered, setEntered] = useState(false);
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [step, setStep] = useState<'range' | 'export'>('range');
  const [preparing, setPreparing] = useState(false);
  const [prepareError, setPrepareError] = useState<string | null>(null);
  const [prepared, setPrepared] = useState<PreparedCsv | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedPath, setSavedPath] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const sessionIdRef = useRef(0);

  const cells = useMemo(
    () => buildMonthCells(viewYear, viewMonth),
    [viewYear, viewMonth],
  );
  const canContinue = startDate != null && endDate != null && !preparing;

  useEffect(() => {
    if (!visible) {
      setEntered(false);
      return;
    }
    sessionIdRef.current += 1;
    setStep('range');
    setPreparing(false);
    setSaving(false);
    setPrepared(null);
    setPrepareError(null);
    setSavedPath(null);
    setSaveError(null);
    let openFrame = 0;
    const frame = requestAnimationFrame(() => {
      openFrame = requestAnimationFrame(() => setEntered(true));
    });
    return () => {
      cancelAnimationFrame(frame);
      if (openFrame) cancelAnimationFrame(openFrame);
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible]);

  const handleClose = useCallback(() => {
    sessionIdRef.current += 1;
    setPreparing(false);
    setSaving(false);
    setSavedPath(null);
    setSaveError(null);
    setPrepareError(null);
    onClose();
  }, [onClose]);

  const { panelStyle, dragBindings, stopScrollDragPropagation } =
    useBottomSheetDragDismiss({
      enabled: visible && entered,
      onClose: handleClose,
      openTransition: 'transform 280ms cubic-bezier(0.33, 1, 0.68, 1)',
    });

  if (!visible) return null;

  const clearSaveState = () => {
    setSavedPath(null);
    setSaveError(null);
  };

  const shiftMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const applyQuickRange = (kind: '7' | '30' | 'month') => {
    const end = startOfDay(now);
    let start = startOfDay(now);
    if (kind === '7') {
      start = new Date(end);
      start.setDate(end.getDate() - 6);
    } else if (kind === '30') {
      start = new Date(end);
      start.setDate(end.getDate() - 29);
    } else {
      start = new Date(end.getFullYear(), end.getMonth(), 1);
    }
    setStartDate(start);
    setEndDate(end);
    setSelectingEnd(false);
    setViewYear(end.getFullYear());
    setViewMonth(end.getMonth());
  };

  const handleSelectDay = (date: Date) => {
    const selected = startOfDay(date);
    if (!startDate || (startDate && endDate) || !selectingEnd) {
      setStartDate(selected);
      setEndDate(null);
      setSelectingEnd(true);
      return;
    }
    if (selected.getTime() < startDate.getTime()) {
      setStartDate(selected);
      setEndDate(null);
      setSelectingEnd(true);
      return;
    }
    setEndDate(selected);
    setSelectingEnd(false);
  };

  const isInRange = (date: Date) => {
    if (!startDate || !endDate) return false;
    const t = startOfDay(date).getTime();
    return t >= startDate.getTime() && t <= endDate.getTime();
  };

  const handleContinue = async () => {
    if (!startDate || !endDate) return;
    const sessionId = sessionIdRef.current;
    setPreparing(true);
    setPrepareError(null);
    clearSaveState();
    try {
      const result = await prepareDemoCsvExport({
        start: startDate,
        end: endDate,
        wheelPosition,
        sensorId: DEMO_EXPORT_SENSOR_ID,
      });
      if (sessionId !== sessionIdRef.current) return;
      setPrepared(result);
      setStep('export');
    } catch {
      if (sessionId !== sessionIdRef.current) return;
      setPrepareError('Failed to prepare CSV. Please try again.');
    } finally {
      if (sessionId === sessionIdRef.current) setPreparing(false);
    }
  };

  const handleDownload = () => {
    if (!prepared || saving) return;
    setSaving(true);
    clearSaveState();
    try {
      const path = downloadCsvFile(prepared.fileName, prepared.csv);
      setSavedPath(path);
    } catch {
      setSaveError('Failed to save CSV. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenSavedCsv = () => {
    if (!prepared) return;
    try {
      openCsvInNewTab(prepared.csv);
    } catch {
      setSaveError('Failed to open CSV. Please try again.');
    }
  };

  const handlePrevious = () => {
    setPrepared(null);
    clearSaveState();
    setStep('range');
  };

  const hasFullRange =
    startDate != null &&
    endDate != null &&
    startDate.getTime() !== endDate.getTime();

  return createPortal(
    <div className="export-sheet-root" role="presentation">
      <button
        type="button"
        className={
          entered
            ? 'export-sheet__overlay export-sheet__overlay--open'
            : 'export-sheet__overlay'
        }
        aria-label="Close export sheet"
        onClick={handleClose}
      />

      <div
        className={
          entered ? 'export-sheet export-sheet--open' : 'export-sheet'
        }
        style={panelStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-sheet-title"
        {...dragBindings}
      >
        <div className="export-sheet__handle" aria-hidden />

        <div className="export-sheet__header">
          <h2 id="export-sheet-title" className="export-sheet__title">
            {step === 'range' ? 'Export range' : 'Export CSV'}
          </h2>
          <button
            type="button"
            className="export-sheet__close"
            aria-label="Close"
            onClick={handleClose}
          >
            <img src={IMG.cancel} alt="" width={28} height={28} />
          </button>
        </div>

        <div
          className="export-sheet__body"
          onPointerDown={stopScrollDragPropagation}
        >
        {step === 'range' ? (
          <>
            <div className="export-sheet__quick">
              {(
                [
                  { key: '7', label: 'Last 7 days' },
                  { key: '30', label: 'Last 30 days' },
                  { key: 'month', label: 'This month' },
                ] as const
              ).map(item => (
                <button
                  key={item.key}
                  type="button"
                  className="export-sheet__quick-chip"
                  onClick={() => applyQuickRange(item.key)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="export-sheet__range-row">
              <div className="export-sheet__range-field">
                <span className="export-sheet__range-label">Starts</span>
                <strong className="export-sheet__range-value">
                  {formatDisplayDate(startDate)}
                </strong>
              </div>
              <div className="export-sheet__range-field">
                <span className="export-sheet__range-label">Ends</span>
                <strong className="export-sheet__range-value">
                  {formatDisplayDate(endDate)}
                </strong>
              </div>
            </div>

            <div className="export-sheet__month-nav">
              <button
                type="button"
                className="export-sheet__month-btn"
                aria-label="Previous month"
                onClick={() => shiftMonth(-1)}
              >
                <img
                  className="export-sheet__chevron-left"
                  src={IMG.chevronCalendar}
                  alt=""
                  width={20}
                  height={20}
                />
              </button>
              <span className="export-sheet__month-title">
                {MONTH_LABELS[viewMonth]} {viewYear}
              </span>
              <button
                type="button"
                className="export-sheet__month-btn"
                aria-label="Next month"
                onClick={() => shiftMonth(1)}
              >
                <img
                  src={IMG.chevronCalendar}
                  alt=""
                  width={20}
                  height={20}
                />
              </button>
            </div>

            <div className="export-sheet__weekdays">
              {WEEKDAY_LABELS.map((label, index) => (
                <span key={`${label}-${index}`}>{label}</span>
              ))}
            </div>

            <div className="export-sheet__day-grid">
              {Array.from(
                { length: Math.ceil(cells.length / 7) },
                (_, weekIndex) => {
                  const weekCells = cells.slice(
                    weekIndex * 7,
                    weekIndex * 7 + 7,
                  );
                  return (
                    <div
                      key={`week-${weekIndex}`}
                      className="export-sheet__week"
                    >
                      {weekCells.map(cell => {
                        const isStart = isSameDay(cell.date, startDate);
                        const isEnd = isSameDay(cell.date, endDate);
                        const inMiddle =
                          hasFullRange &&
                          isInRange(cell.date) &&
                          !isStart &&
                          !isEnd;
                        const showRangeTrack =
                          hasFullRange && (isStart || isEnd || inMiddle);
                        const selected = isStart || isEnd;
                        return (
                          <button
                            key={cell.key}
                            type="button"
                            className="export-sheet__day"
                            onClick={() => handleSelectDay(cell.date)}
                          >
                            {showRangeTrack ? (
                              <span
                                className={[
                                  'export-sheet__day-track',
                                  isStart && !isEnd
                                    ? 'export-sheet__day-track--start'
                                    : '',
                                  isEnd && !isStart
                                    ? 'export-sheet__day-track--end'
                                    : '',
                                  inMiddle
                                    ? 'export-sheet__day-track--middle'
                                    : '',
                                ]
                                  .filter(Boolean)
                                  .join(' ')}
                              />
                            ) : null}
                            <span
                              className={
                                selected
                                  ? 'export-sheet__day-inner export-sheet__day-inner--on'
                                  : 'export-sheet__day-inner'
                              }
                            >
                              <span
                                className={[
                                  'export-sheet__day-text',
                                  !cell.inCurrentMonth
                                    ? 'export-sheet__day-text--muted'
                                    : '',
                                  selected
                                    ? 'export-sheet__day-text--on'
                                    : '',
                                ]
                                  .filter(Boolean)
                                  .join(' ')}
                              >
                                {cell.date.getDate()}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  );
                },
              )}
            </div>

            {prepareError ? (
              <p className="export-sheet__error">{prepareError}</p>
            ) : null}

            <button
              type="button"
              className={
                canContinue
                  ? 'export-sheet__continue export-sheet__continue--on'
                  : 'export-sheet__continue'
              }
              disabled={!canContinue}
              onClick={handleContinue}
            >
              Continue
            </button>
          </>
        ) : (
          <>
            <div className="export-sheet__range-row">
              <div className="export-sheet__range-field">
                <span className="export-sheet__range-label">Starts</span>
                <strong className="export-sheet__range-value">
                  {formatDisplayDate(startDate)}
                </strong>
              </div>
              <div className="export-sheet__range-field">
                <span className="export-sheet__range-label">Ends</span>
                <strong className="export-sheet__range-value">
                  {formatDisplayDate(endDate)}
                </strong>
              </div>
            </div>

            <div className="export-sheet__file-card">
              <div className="export-sheet__file-name-row">
                <img src={IMG.doc} alt="" width={40} height={40} />
                <div className="export-sheet__file-name-text">
                  <span className="export-sheet__meta-label">File Name</span>
                  <strong className="export-sheet__file-name">
                    {prepared?.fileName ?? ''}
                  </strong>
                </div>
              </div>
              <div className="export-sheet__file-divider" />
              <div className="export-sheet__file-stats">
                <div className="export-sheet__file-stat">
                  <span className="export-sheet__meta-label">Size</span>
                  <span className="export-sheet__meta-value">
                    {prepared ? formatCsvByteSize(prepared.byteSize) : '—'}
                  </span>
                </div>
                <div className="export-sheet__file-stat-divider" />
                <div className="export-sheet__file-stat">
                  <span className="export-sheet__meta-label">Rows</span>
                  <span className="export-sheet__meta-value">
                    {prepared ? `${prepared.rowCount} readings` : '—'}
                  </span>
                </div>
              </div>
            </div>

            <div className="export-sheet__actions">
              <button
                type="button"
                className="export-sheet__action export-sheet__action--disabled"
                disabled
              >
                <img
                  src={IMG.share}
                  alt=""
                  width={INSIGHTS_EXPORT_ACTION_ICON_SIZE}
                  height={INSIGHTS_EXPORT_ACTION_ICON_SIZE}
                />
                <span>Share via</span>
              </button>
              <div className="export-sheet__action-divider" />
              <button
                type="button"
                className={
                  saving
                    ? 'export-sheet__action export-sheet__action--disabled'
                    : 'export-sheet__action'
                }
                disabled={!prepared || saving}
                onClick={handleDownload}
              >
                <img
                  src={IMG.download}
                  alt=""
                  width={INSIGHTS_EXPORT_ACTION_ICON_SIZE}
                  height={INSIGHTS_EXPORT_ACTION_ICON_SIZE}
                />
                <span>Download CSV</span>
              </button>
            </div>

            {saveError ? (
              <p className="export-sheet__error">{saveError}</p>
            ) : null}

            <button
              type="button"
              className="export-sheet__previous"
              onClick={handlePrevious}
            >
              Previous
            </button>
          </>
        )}
      </div>
      </div>

      {preparing ? (
        <div className="export-sheet__banner" aria-live="polite">
          <span className="export-sheet__spinner" aria-hidden />
          <span className="export-sheet__banner-text">
            Preparing your CSV...
          </span>
        </div>
      ) : null}

      {savedPath ? (
        <div className="export-sheet__banner" aria-live="polite">
          <span className="export-sheet__banner-icon" aria-hidden>
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                width="32"
                height="32"
                rx="16"
                fill="#69A5FF"
                fillOpacity="0.3"
              />
              <path
                d="M13.8929 19.8929C14.2834 20.2834 14.9166 20.2834 15.3071 19.8929L20.95 14.25C21.3366 13.8634 21.3366 13.2366 20.95 12.85C20.5634 12.4634 19.9366 12.4634 19.55 12.85L14.6 17.8L12.45 15.65C12.0634 15.2634 11.4366 15.2634 11.05 15.65C10.6634 16.0366 10.6634 16.6634 11.05 17.05L13.8929 19.8929ZM16 26C14.6167 26 13.3167 25.7373 12.1 25.212C10.8833 24.6873 9.825 23.975 8.925 23.075C8.025 22.175 7.31267 21.1167 6.788 19.9C6.26267 18.6833 6 17.3833 6 16C6 14.6167 6.26267 13.3167 6.788 12.1C7.31267 10.8833 8.025 9.825 8.925 8.925C9.825 8.025 10.8833 7.31233 12.1 6.787C13.3167 6.26233 14.6167 6 16 6C17.3833 6 18.6833 6.26233 19.9 6.787C21.1167 7.31233 22.175 8.025 23.075 8.925C23.975 9.825 24.6873 10.8833 25.212 12.1C25.7373 13.3167 26 14.6167 26 16C26 17.3833 25.7373 18.6833 25.212 19.9C24.6873 21.1167 23.975 22.175 23.075 23.075C22.175 23.975 21.1167 24.6873 19.9 25.212C18.6833 25.7373 17.3833 26 16 26Z"
                fill="#9EC5FF"
              />
            </svg>
          </span>
          <span className="export-sheet__banner-text">
            {SAVE_SUCCESS_MESSAGE}
          </span>
          <button
            type="button"
            className="export-sheet__open"
            onClick={handleOpenSavedCsv}
          >
            Open
          </button>
        </div>
      ) : null}
    </div>,
    document.body,
  );
}
