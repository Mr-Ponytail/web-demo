import { useCallback, useEffect, useRef, useState } from 'react';
import {
  HEADER_FADE_MS,
  TRANSCRIPT_RISE_MS,
} from './constants';

export type VoicePhase = 'panel' | 'animating';
export type TranscriptPhase = 'live' | 'history';

type Options = {
  phase: VoicePhase;
  isListening: boolean;
  demoTranscript: string | null;
  awaitingCancel: boolean;
  displayTranscript: string;
};

export function useVoiceModalTransition({
  phase,
  isListening,
  demoTranscript,
  awaitingCancel,
  displayTranscript,
}: Options) {
  const [transcriptPhase, setTranscriptPhase] =
    useState<TranscriptPhase>('live');
  const [headerHidden, setHeaderHidden] = useState(false);
  const [riseActive, setRiseActive] = useState(false);
  const hasRiseAnimatedRef = useRef(false);

  const resetTransition = useCallback(() => {
    hasRiseAnimatedRef.current = false;
    setTranscriptPhase('live');
    setHeaderHidden(false);
    setRiseActive(false);
  }, []);

  const playHistoryTransition = useCallback(() => {
    if (hasRiseAnimatedRef.current) return;
    hasRiseAnimatedRef.current = true;
    setTranscriptPhase('history');
    setHeaderHidden(true);
    // slight delay so CSS transition runs after history styles apply
    requestAnimationFrame(() => {
      setRiseActive(true);
    });
  }, []);

  useEffect(() => {
    if (
      phase === 'animating' &&
      isListening &&
      !demoTranscript &&
      !awaitingCancel
    ) {
      resetTransition();
      return;
    }

    if (
      phase === 'animating' &&
      !isListening &&
      displayTranscript &&
      !hasRiseAnimatedRef.current
    ) {
      // match app: small delay before rise (70ms built into TRANSCRIPT_RISE)
      const t = window.setTimeout(playHistoryTransition, 70);
      return () => window.clearTimeout(t);
    }
  }, [
    phase,
    isListening,
    displayTranscript,
    demoTranscript,
    awaitingCancel,
    playHistoryTransition,
    resetTransition,
  ]);

  return {
    headerHidden,
    riseActive,
    isHistoryTranscript: transcriptPhase === 'history',
    resetTransition,
    headerFadeMs: HEADER_FADE_MS,
    riseMs: TRANSCRIPT_RISE_MS,
  };
}
