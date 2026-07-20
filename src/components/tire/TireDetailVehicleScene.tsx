import { useMemo } from 'react';
import { TIRE_IMG } from '../../assets';
import type { TireKey, TireStatus } from '../../data/tireMocks';
import {
  getTireImageKey,
  isRearInnerTire,
  type DetailLayout,
  VIEWPORT_TRANSITION,
} from '../../tire/detailConstants';
import './TireDetailVehicleScene.css';

const CAR_BASE_OPACITY = 0.9;
const TIRE_FOCUSED_OPACITY = 1;
const TIRE_UNFOCUSED_OPACITY = 0.2;

type Props = {
  layout: DetailLayout;
  selectedKey: TireKey;
  pan: { x: number; y: number };
  tireStatusByKey: Record<TireKey, TireStatus>;
};

export function TireDetailVehicleScene({
  layout,
  selectedKey,
  pan,
  tireStatusByKey,
}: Props) {
  const carBlend = isRearInnerTire(selectedKey) ? 1 : 0;
  const transform = `translate(${pan.x}px, ${pan.y}px)`;
  const sceneStyle = useMemo(
    () => ({
      width: layout.sceneW,
      height: layout.sceneHeight,
      transform,
      transition: VIEWPORT_TRANSITION,
    }),
    [layout.sceneW, layout.sceneHeight, transform],
  );

  const li = layout.sceneTireAnchors.LI;
  const ri = layout.sceneTireAnchors.RI;
  const liLightLeft =
    li.x - layout.leftLightW / 2 + layout.leftLightOffsetX;
  const liLightTop =
    li.y - layout.leftLightH / 2 + layout.leftLightOffsetY;
  const riLightLeft =
    ri.x - layout.rightLightW / 2 + layout.rightLightOffsetX;
  const riLightTop =
    ri.y - layout.rightLightH / 2 + layout.rightLightOffsetY;

  return (
    <div className="td-viewport" aria-hidden>
      <div className="td-scene" style={sceneStyle}>
        <div
          className="td-car"
          style={{
            top: layout.carTop,
            left: layout.carLeft,
            width: layout.carW,
            height: layout.carH,
          }}
        >
          <img
            src="/assets/images/gray-car.png"
            alt=""
            className="td-car__img"
            style={{ opacity: (1 - carBlend) * CAR_BASE_OPACITY }}
          />
          <img
            src="/assets/images/black-car.png"
            alt=""
            className="td-car__img"
            style={{ opacity: carBlend * CAR_BASE_OPACITY }}
          />
        </div>
      </div>

      <div
        className="td-top-fade"
        style={{ height: layout.topFadeHeight }}
      />

      <div className="td-scene td-scene--tires" style={sceneStyle}>
        {(Object.keys(layout.sceneTireAnchors) as TireKey[]).map(key => {
          const anchor = layout.sceneTireAnchors[key];
          const status = tireStatusByKey[key];
          const selected = selectedKey === key;
          return (
            <div
              key={key}
              className="td-tire"
              style={{
                left: anchor.x - layout.tireW / 2,
                top: anchor.y - layout.tireH / 2,
                zIndex: selected ? 3 : 2,
                width: layout.tireW,
                height: layout.tireH,
              }}
            >
              <img
                src={TIRE_IMG[getTireImageKey(status)]}
                alt=""
                style={{
                  width: layout.tireW,
                  height: layout.tireH,
                  opacity: selected ? TIRE_FOCUSED_OPACITY : TIRE_UNFOCUSED_OPACITY,
                  transition: 'opacity 280ms ease',
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="td-scene td-scene--lights" style={sceneStyle}>
        <img
          src="/assets/images/leftlight-good.png"
          alt=""
          className="td-light"
          style={{
            left: liLightLeft,
            top: liLightTop,
            width: layout.leftLightW,
            height: layout.leftLightH,
            opacity: selectedKey === 'LI' ? 1 : 0,
            transition: `opacity 400ms ease ${selectedKey === 'LI' ? '400ms' : '0ms'}`,
          }}
        />
        <img
          src="/assets/images/rightlight-good.png"
          alt=""
          className="td-light"
          style={{
            left: riLightLeft,
            top: riLightTop,
            width: layout.rightLightW,
            height: layout.rightLightH,
            opacity: selectedKey === 'RI' ? 1 : 0,
            transition: `opacity 400ms ease ${selectedKey === 'RI' ? '400ms' : '0ms'}`,
          }}
        />
      </div>
    </div>
  );
}
