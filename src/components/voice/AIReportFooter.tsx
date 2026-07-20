import { useEffect, useState } from 'react';
import { IMG } from '../../assets';
import {
  HAZARD_REPORT_UNDO_RING_SIZE,
  HAZARD_REPORT_UNDO_RING_STROKE,
  HAZARD_REPORT_UNDO_SECONDS,
} from './constants';
import { useAiTypewriter } from './useAiTypewriter';
import './AICards.css';

const CONFIRM_TEXT = 'Got it , sending this report to Ohio DOT.';
const HINT_TEXT = 'Just say "cancel" to stop.';

type Props = {
  visible: boolean;
  onReadyForCancelListen?: () => void;
  onCancel?: () => void;
};

export function AIReportFooter({
  visible,
  onReadyForCancelListen,
  onCancel,
}: Props) {
  const [showHint, setShowHint] = useState(false);
  const [showUndo, setShowUndo] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(HAZARD_REPORT_UNDO_SECONDS);
  const [progress, setProgress] = useState(0);

  const { typedText, sparkOpacity, isComplete } = useAiTypewriter({
    visible,
    text: CONFIRM_TEXT,
    intervalMs: 18,
    onSparkReady: onReadyForCancelListen,
  });

  useEffect(() => {
    if (!visible) {
      setShowHint(false);
      setShowUndo(false);
      setSecondsLeft(HAZARD_REPORT_UNDO_SECONDS);
      setProgress(0);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible || !isComplete) return;

    setShowHint(true);
    setShowUndo(true);
    setSecondsLeft(HAZARD_REPORT_UNDO_SECONDS);
    setProgress(0);

    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / (HAZARD_REPORT_UNDO_SECONDS * 1000));
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const countdown = window.setInterval(() => {
      setSecondsLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(countdown);
    };
  }, [visible, isComplete]);

  if (!visible) return null;

  const radius =
    (HAZARD_REPORT_UNDO_RING_SIZE - HAZARD_REPORT_UNDO_RING_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = HAZARD_REPORT_UNDO_RING_SIZE / 2;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="ai-report-footer">
      <img
        src={IMG.aiSpark}
        alt=""
        width={24}
        height={24}
        style={{ opacity: sparkOpacity, transition: 'opacity 280ms ease-out' }}
      />
      <p className="ai-report-footer__confirm">{typedText}</p>
      {showHint ? <p className="ai-report-footer__hint">{HINT_TEXT}</p> : null}
      {showUndo ? (
        <div className="ai-report-footer__undo">
          <button type="button" className="ai-report-footer__pill" onClick={onCancel}>
            <span className="ai-report-footer__ring">
              <svg
                width={HAZARD_REPORT_UNDO_RING_SIZE}
                height={HAZARD_REPORT_UNDO_RING_SIZE}
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
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${center} ${center})`}
                />
              </svg>
              <span>{secondsLeft}</span>
            </span>
            <span>Undo</span>
          </button>
          <button
            type="button"
            className="ai-report-footer__x"
            onClick={onCancel}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      ) : null}
    </div>
  );
}
