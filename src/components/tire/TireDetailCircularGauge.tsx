import { useEffect, useState } from 'react';
import {
  TIRE_DETAIL_GAUGE_C,
  TIRE_DETAIL_GAUGE_R,
  TIRE_DETAIL_GAUGE_ROT,
  TIRE_DETAIL_GAUGE_SIZE,
  TIRE_DETAIL_GAUGE_SW,
  getGaugeColor,
} from '../../tire/detailConstants';
import './TireDetailCircularGauge.css';

type Props = {
  progress: number;
  iconSrc: string;
  iconSize: number;
  animationKey?: string;
};

export function TireDetailCircularGauge({
  progress,
  iconSrc,
  iconSize,
  animationKey,
}: Props) {
  const target = Math.min(1, Math.max(0, progress));
  const [displayProgress, setDisplayProgress] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(false);

  useEffect(() => {
    setTransitionEnabled(false);
    setDisplayProgress(0);

    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setTransitionEnabled(true);
        setDisplayProgress(target);
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [animationKey, target]);

  const cx = TIRE_DETAIL_GAUGE_SIZE / 2;
  const cy = TIRE_DETAIL_GAUGE_SIZE / 2;
  const offset = TIRE_DETAIL_GAUGE_C * (1 - displayProgress);

  return (
    <div
      className="td-circ-gauge"
      style={{ width: TIRE_DETAIL_GAUGE_SIZE, height: TIRE_DETAIL_GAUGE_SIZE }}
    >
      <svg
        width={TIRE_DETAIL_GAUGE_SIZE}
        height={TIRE_DETAIL_GAUGE_SIZE}
        className="td-circ-gauge__svg"
        aria-hidden
      >
        <circle
          cx={cx}
          cy={cy}
          r={TIRE_DETAIL_GAUGE_R}
          fill="none"
          stroke="#E1E2E4"
          strokeWidth={TIRE_DETAIL_GAUGE_SW}
        />
        <circle
          cx={cx}
          cy={cy}
          r={TIRE_DETAIL_GAUGE_R}
          fill="none"
          stroke={getGaugeColor(target)}
          strokeWidth={TIRE_DETAIL_GAUGE_SW}
          strokeDasharray={`${TIRE_DETAIL_GAUGE_C} ${TIRE_DETAIL_GAUGE_C}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(${TIRE_DETAIL_GAUGE_ROT}, ${cx}, ${cy})`}
          style={{
            transition: transitionEnabled
              ? 'stroke-dashoffset 420ms ease-out, stroke 200ms ease'
              : 'none',
          }}
        />
      </svg>
      <img
        className="td-circ-gauge__icon"
        src={iconSrc}
        alt=""
        width={iconSize}
        height={iconSize}
      />
    </div>
  );
}
