import { IMG } from '../../assets';
import type { AlertPreferenceOption } from '../../data/settingsMocks';
import './AlertPreferenceCard.css';

type AlertPreferenceCardProps = {
  option: AlertPreferenceOption;
  selected: boolean;
  onSelect: () => void;
};

export function AlertPreferenceCard({
  option,
  selected,
  onSelect,
}: AlertPreferenceCardProps) {
  return (
    <button
      type="button"
      className={
        selected
          ? 'alert-pref-card alert-pref-card--selected'
          : 'alert-pref-card'
      }
      onClick={onSelect}
      aria-pressed={selected}
    >
      <div className="alert-pref-card__top">
        <div className="alert-pref-card__header">
          <div className="alert-pref-card__title-block">
            <div className="alert-pref-card__title-row">
              <strong>{option.title}</strong>
              {selected && option.badge ? (
                <span
                  className={`alert-pref-card__badge alert-pref-card__badge--${option.badge.tone}`}
                >
                  {option.badge.label}
                </span>
              ) : null}
            </div>
            <p className="alert-pref-card__desc">{option.description}</p>
          </div>
          <img
            src={selected ? IMG.checked : IMG.checkedNot}
            alt=""
            width={22}
            height={22}
          />
        </div>
      </div>

      {selected ? (
        <div className="alert-pref-card__detail">
          <hr className="alert-pref-card__divider" />
          <div className="alert-pref-card__thresholds">
            <span className="alert-pref-card__threshold-label">Threshold</span>
            {option.thresholds.map(row => (
              <div key={row.label} className="alert-pref-card__threshold-row">
                <span className="alert-pref-card__threshold-key">{row.label}</span>
                <span className="alert-pref-card__threshold-value">{row.value}</span>
              </div>
            ))}

            {option.footerNote ? (
              <>
                <hr className="alert-pref-card__footer-div" />
                <div
                  className={
                    option.footerNote.showWarningIcon
                      ? 'alert-pref-card__footer alert-pref-card__footer--icon'
                      : 'alert-pref-card__footer'
                  }
                >
                  {option.footerNote.showWarningIcon ? (
                    <img
                      src={
                        option.id === 'proactive' ? IMG.safety : IMG.warning
                      }
                      alt=""
                      width={20}
                      height={20}
                    />
                  ) : null}
                  <p
                    className={`alert-pref-card__footer-text alert-pref-card__footer-text--${option.footerNote.tone}`}
                  >
                    {option.footerNote.text}
                  </p>
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </button>
  );
}
