import { IMG } from '../../assets';
import { MONTH_SHORT } from '../../data/tireLogMocks';
import './MonthPickerModal.css';

export type TireLogDateFilter = {
  year: number;
  month: number;
};

const MONTH_CELL_WIDTH = 84;
const PICKER_CARD_WIDTH = MONTH_CELL_WIDTH * 3 + 40;
const POPUP_TOP_GAP = 8;

type Props = {
  visible: boolean;
  year: number;
  dateFilter: TireLogDateFilter;
  anchorTop: number;
  markedMonths?: number[];
  onChangeYear: (year: number) => void;
  onSelectMonth: (month: number) => void;
  onClose: () => void;
};

export function MonthPickerModal({
  visible,
  year,
  dateFilter,
  anchorTop,
  markedMonths,
  onChangeYear,
  onSelectMonth,
  onClose,
}: Props) {
  if (!visible) return null;

  const pickerLeft = `calc(50% - ${PICKER_CARD_WIDTH / 2}px)`;

  return (
    <div className="month-picker-root" role="presentation">
      <button
        type="button"
        className="month-picker__backdrop"
        aria-label="Close month picker"
        onClick={onClose}
      />
      <div
        className="month-picker__card"
        role="dialog"
        aria-modal="true"
        aria-label="Select month"
        style={{
          top: anchorTop + POPUP_TOP_GAP,
          left: pickerLeft,
          width: PICKER_CARD_WIDTH,
        }}
      >
        <div className="month-picker__year-nav">
          <button
            type="button"
            className="month-picker__year-btn"
            aria-label="Previous year"
            onClick={() => onChangeYear(year - 1)}
          >
            <img
              className="month-picker__chevron-left"
              src={IMG.chevronCalendar}
              alt=""
              width={20}
              height={20}
            />
          </button>
          <span className="month-picker__year">{year}</span>
          <button
            type="button"
            className="month-picker__year-btn"
            aria-label="Next year"
            onClick={() => onChangeYear(year + 1)}
          >
            <img src={IMG.chevronCalendar} alt="" width={20} height={20} />
          </button>
        </div>

        <div className="month-picker__grid">
          {MONTH_SHORT.map((label, index) => {
            const isSelected =
              year === dateFilter.year && dateFilter.month === index;
            const isMarked = markedMonths?.includes(index) ?? false;
            return (
              <button
                key={label}
                type="button"
                className="month-picker__cell"
                onClick={() => onSelectMonth(index)}
              >
                <span
                  className={
                    isSelected
                      ? 'month-picker__pill month-picker__pill--on'
                      : 'month-picker__pill'
                  }
                >
                  <span className="month-picker__pill-inner">
                    <span
                      className={
                        isSelected
                          ? 'month-picker__label month-picker__label--on'
                          : 'month-picker__label'
                      }
                    >
                      {label}
                    </span>
                    {isMarked ? (
                      <span className="month-picker__dot" aria-hidden />
                    ) : null}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
