import {
  TIRE_CAR_BODY_BETWEEN_HEIGHT,
  TIRE_FRONT_CAR_H,
  TIRE_FRONT_CAR_W,
  TIRE_FRONT_TO_REAR_GAP,
  TIRE_HAIRLINE,
  TIRE_REAR_CAR_H,
  TIRE_REAR_CAR_W,
} from '../../tire/constants';
import { IMG } from '../../assets';
import './CarBodyStack.css';

export function CarBodyStack({
  showDivider,
  rearCarUpOffset = 0,
}: {
  showDivider: boolean;
  rearCarUpOffset?: number;
}) {
  return (
    <div className="car-stack">
      <div className="car-stack__section">
        <img
          src={IMG.frontCar}
          alt=""
          width={TIRE_FRONT_CAR_W}
          height={TIRE_FRONT_CAR_H}
        />
      </div>
      <div
        className="car-stack__between"
        style={{
          height: TIRE_CAR_BODY_BETWEEN_HEIGHT,
          marginTop: 0,
          marginBottom: 0,
        }}
      >
        {showDivider ? (
          <div
            className="car-stack__line"
            style={{
              marginTop: TIRE_FRONT_TO_REAR_GAP,
              height: TIRE_HAIRLINE,
            }}
          />
        ) : null}
      </div>
      <div
        className="car-stack__section"
        style={rearCarUpOffset ? { marginTop: -rearCarUpOffset } : undefined}
      >
        <img
          src={IMG.rearCar}
          alt=""
          width={TIRE_REAR_CAR_W}
          height={TIRE_REAR_CAR_H}
        />
      </div>
    </div>
  );
}
