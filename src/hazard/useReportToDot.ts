import { useCallback, useEffect, useRef, useState } from 'react';
import { HAZARD_REPORT_UNDO_SECONDS } from './constants';

export function useReportToDot() {
  const [isReportToastVisible, setIsReportToastVisible] = useState(false);
  const [undoSecondsLeft, setUndoSecondsLeft] = useState(HAZARD_REPORT_UNDO_SECONDS);
  const [reportProgress, setReportProgress] = useState(0);
  const dismissTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressFrameRef = useRef<number | null>(null);
  const progressStartRef = useRef(0);

  const clearReportTimers = useCallback(() => {
    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current);
      dismissTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (progressFrameRef.current != null) {
      cancelAnimationFrame(progressFrameRef.current);
      progressFrameRef.current = null;
    }
  }, []);

  const dismissReportToast = useCallback(() => {
    clearReportTimers();
    setReportProgress(0);
    setIsReportToastVisible(false);
    setUndoSecondsLeft(HAZARD_REPORT_UNDO_SECONDS);
  }, [clearReportTimers]);

  const handleReportToDot = useCallback(() => {
    clearReportTimers();
    setIsReportToastVisible(true);
    setUndoSecondsLeft(HAZARD_REPORT_UNDO_SECONDS);
    setReportProgress(0);
    progressStartRef.current = performance.now();

    const tickProgress = (now: number) => {
      const elapsed = now - progressStartRef.current;
      const next = Math.min(1, elapsed / (HAZARD_REPORT_UNDO_SECONDS * 1000));
      setReportProgress(next);
      if (next < 1) {
        progressFrameRef.current = requestAnimationFrame(tickProgress);
      }
    };
    progressFrameRef.current = requestAnimationFrame(tickProgress);

    countdownIntervalRef.current = setInterval(() => {
      setUndoSecondsLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    dismissTimeoutRef.current = setTimeout(() => {
      dismissReportToast();
    }, HAZARD_REPORT_UNDO_SECONDS * 1000);
  }, [clearReportTimers, dismissReportToast]);

  useEffect(() => () => clearReportTimers(), [clearReportTimers]);

  return {
    isReportToastVisible,
    undoSecondsLeft,
    reportProgress,
    handleReportToDot,
    dismissReportToast,
  };
}
