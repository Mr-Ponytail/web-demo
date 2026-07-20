import './TireLaneBackground.css';

export function TireLaneBackground() {
  return (
    <div className="tire-lane" aria-hidden>
      <div className="tire-lane__wrap">
        <img src="/assets/icons/lane.svg" alt="" className="tire-lane__img" />
      </div>
    </div>
  );
}
