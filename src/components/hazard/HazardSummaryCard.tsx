import type { HazardSummaryCardData } from '../../data/hazardLocationMocks';
import './HazardSummaryCard.css';

type HazardSummaryCardProps = {
  item: HazardSummaryCardData;
  onPress?: () => void;
};

export function HazardSummaryCard({ item, onPress }: HazardSummaryCardProps) {
  return (
    <button
      type="button"
      className="hazard-summary-card"
      onClick={onPress}
      disabled={!onPress}
    >
      <div
        className="hazard-summary-card__accent"
        style={{ backgroundColor: item.accentColor }}
      />
      <div className="hazard-summary-card__header">
        <span
          className="hazard-summary-card__badge"
          style={{ backgroundColor: item.badgeColor }}
        >
          {item.order}
        </span>
        <span className="hazard-summary-card__tire">{item.tire}</span>
      </div>
      <p className="hazard-summary-card__time">{item.time}</p>
      <ul className="hazard-summary-card__alerts">
        {item.alerts.map((alert, index) => {
          const isCritical = index === 0;
          return (
            <li key={`${item.id}-${alert}-${index}`} className="hazard-summary-card__alert">
              <span
                className={
                  isCritical
                    ? 'hazard-summary-card__dot hazard-summary-card__dot--critical'
                    : 'hazard-summary-card__dot hazard-summary-card__dot--warning'
                }
              />
              <span
                className={
                  isCritical
                    ? 'hazard-summary-card__alert-text hazard-summary-card__alert-text--critical'
                    : 'hazard-summary-card__alert-text hazard-summary-card__alert-text--warning'
                }
              >
                {alert}
              </span>
            </li>
          );
        })}
      </ul>
    </button>
  );
}
