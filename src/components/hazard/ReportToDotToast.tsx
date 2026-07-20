import { IMG } from '../../assets';
import {
  HAZARD_REPORT_UNDO_RING_SIZE,
  HAZARD_REPORT_UNDO_RING_STROKE,
} from '../../hazard/constants';
import './ReportToDotToast.css';

type ReportToDotToastProps = {
  visible: boolean;
  secondsLeft: number;
  progress: number;
  onUndo: () => void;
};

export function ReportToDotToast({
  visible,
  secondsLeft,
  progress,
  onUndo,
}: ReportToDotToastProps) {
  if (!visible) {
    return null;
  }

  const radius = (HAZARD_REPORT_UNDO_RING_SIZE - HAZARD_REPORT_UNDO_RING_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = HAZARD_REPORT_UNDO_RING_SIZE / 2;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="report-to-dot-toast">
      <img src={IMG.complete} alt="" width={32} height={32} />
      <span className="report-to-dot-toast__message">Report sent to DOT.</span>
      <button type="button" className="report-to-dot-toast__undo" onClick={onUndo}>
        <span className="report-to-dot-toast__countdown">
          <svg
            width={HAZARD_REPORT_UNDO_RING_SIZE}
            height={HAZARD_REPORT_UNDO_RING_SIZE}
            aria-hidden
          >
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#989BA2"
              strokeWidth={HAZARD_REPORT_UNDO_RING_STROKE}
            />
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#F3F5F7"
              strokeWidth={HAZARD_REPORT_UNDO_RING_STROKE}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${center} ${center})`}
            />
          </svg>
          <span>{secondsLeft}</span>
        </span>
        <span className="report-to-dot-toast__undo-text">Undo</span>
      </button>
    </div>
  );
}
