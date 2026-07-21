import { useEffect, useRef, useState } from 'react';
import { IMG } from '../../assets';
import './AIAnswerCard.css';

const CHART_WIDTH = 310;
const CHART_HEIGHT = 136;
const LINE_PAD = 8;
const IMPACT_X = 128;
const IMPACT_Y = 18;
const MID_Y = 62;
const NOW_X = 188;
const NOW_Y = 106;
const PATH_D = `M ${LINE_PAD} ${IMPACT_Y} L ${IMPACT_X} ${IMPACT_Y} L ${NOW_X} ${NOW_Y} L ${CHART_WIDTH - LINE_PAD} ${NOW_Y}`;
const PATH_LENGTH =
  IMPACT_X -
  LINE_PAD +
  Math.hypot(NOW_X - IMPACT_X, NOW_Y - IMPACT_Y) +
  (CHART_WIDTH - LINE_PAD - NOW_X);

const GRAPH_DELAY_MS = 380;
const GRAPH_DRAW_MS = 1200;
const LABEL_FADE_MS = 220;

type Props = {
  onGraphComplete?: () => void;
  showChart?: boolean;
};

export function AIAnswerCard({
  onGraphComplete,
  showChart = true,
}: Props) {
  const pathRef = useRef<SVGPathElement>(null);
  const [impactOn, setImpactOn] = useState(false);
  const [nowOn, setNowOn] = useState(false);
  const [gridOn, setGridOn] = useState(false);
  const completeRef = useRef(false);

  useEffect(() => {
    if (!showChart) {
      onGraphComplete?.();
      return;
    }

    completeRef.current = false;
    setImpactOn(false);
    setNowOn(false);
    setGridOn(false);
    const path = pathRef.current;
    if (path) {
      path.style.strokeDasharray = `${PATH_LENGTH}`;
      path.style.strokeDashoffset = `${PATH_LENGTH}`;
      path.style.opacity = '0';
    }

    const delay = window.setTimeout(() => {
      setGridOn(true);
      if (path) {
        path.style.opacity = '1';
        path.style.transition = `stroke-dashoffset ${GRAPH_DRAW_MS}ms cubic-bezier(0.33, 1, 0.68, 1)`;
        path.style.strokeDashoffset = '0';
      }
    }, GRAPH_DELAY_MS);

    const impactT = window.setTimeout(
      () => setImpactOn(true),
      GRAPH_DELAY_MS + GRAPH_DRAW_MS * 0.35,
    );
    const nowT = window.setTimeout(
      () => setNowOn(true),
      GRAPH_DELAY_MS + GRAPH_DRAW_MS * 0.8,
    );
    const doneT = window.setTimeout(() => {
      if (completeRef.current) return;
      completeRef.current = true;
      window.setTimeout(() => onGraphComplete?.(), LABEL_FADE_MS);
    }, GRAPH_DELAY_MS + GRAPH_DRAW_MS);

    return () => {
      window.clearTimeout(delay);
      window.clearTimeout(impactT);
      window.clearTimeout(nowT);
      window.clearTimeout(doneT);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onGraphComplete, showChart]);

  return (
    <div className="ai-answer">
      <div className="ai-answer__glow" />
      <div className="ai-answer__header">
        <img src={IMG.statusLog.danger} alt="" width={32} height={28} />
        <h3>Pull Over - Check RLO Wheel</h3>
      </div>
      <hr className="ai-answer__divider" />
      <div className="ai-answer__metric">
        <img src={IMG.insightsMetric.nut} alt="" width={18} height={18} />
        <span className="ai-answer__metric-label">Nut torque</span>
        <span className="ai-answer__metric-delta">-44%</span>
      </div>

      {showChart ? (
        <div className="ai-answer__chart" style={{ height: CHART_HEIGHT }}>
          <svg
            width="100%"
            height={CHART_HEIGHT}
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <linearGradient id="torqueLineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#989BA2" />
                <stop offset="0.45" stopColor="#FF8C8C" />
                <stop offset="1" stopColor="#FF6363" />
              </linearGradient>
            </defs>
            <g style={{ opacity: gridOn ? 1 : 0, transition: 'opacity 200ms' }}>
              {[IMPACT_Y, MID_Y, NOW_Y].map(y => (
                <line
                  key={y}
                  x1={0}
                  y1={y}
                  x2={CHART_WIDTH}
                  y2={y}
                  stroke="rgba(255,255,255,0.18)"
                  strokeWidth={1}
                  strokeDasharray="4 5"
                />
              ))}
            </g>
            <path
              ref={pathRef}
              d={PATH_D}
              stroke="url(#torqueLineGrad)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>

          <span
            className={impactOn ? 'ai-answer__dot ai-answer__dot--impact is-on' : 'ai-answer__dot ai-answer__dot--impact'}
            style={{
              left: `${(IMPACT_X / CHART_WIDTH) * 100}%`,
              top: `${(IMPACT_Y / CHART_HEIGHT) * 100}%`,
            }}
          />
          <div
            className={impactOn ? 'ai-answer__impact-labels is-on' : 'ai-answer__impact-labels'}
            style={{
              left: `${(((LINE_PAD + IMPACT_X) / 2) / CHART_WIDTH) * 100}%`,
              top: `${((IMPACT_Y + 10) / CHART_HEIGHT) * 100}%`,
            }}
          >
            <span>At Impact</span>
            <strong>98%</strong>
          </div>

          <span
            className={nowOn ? 'ai-answer__dot ai-answer__dot--now is-on' : 'ai-answer__dot ai-answer__dot--now'}
            style={{
              left: `${(NOW_X / CHART_WIDTH) * 100}%`,
              top: `${(NOW_Y / CHART_HEIGHT) * 100}%`,
            }}
          />
          <div
            className={nowOn ? 'ai-answer__now-cap is-on' : 'ai-answer__now-cap'}
            style={{
              left: `${(NOW_X / CHART_WIDTH) * 100}%`,
              top: `${((NOW_Y + 12) / CHART_HEIGHT) * 100}%`,
            }}
          >
            Now
          </div>
          <div
            className={nowOn ? 'ai-answer__now-val is-on' : 'ai-answer__now-val'}
            style={{
              left: `${(((NOW_X + CHART_WIDTH - LINE_PAD) / 2) / CHART_WIDTH) * 100}%`,
              top: `${((NOW_Y - 50) / CHART_HEIGHT) * 100}%`,
            }}
          >
            54%
          </div>
        </div>
      ) : null}
    </div>
  );
}
