import { useEffect, useRef } from 'react';

const WAKE_PHRASES = ['hey track', '헤이 트랙', '헤이트랙', 'heytrack'] as const;

type Options = {
  enabled: boolean;
  onWakeWord: () => void;
};

function getSpeechRecognitionCtor():
  | (new () => SpeechRecognition)
  | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}

function normalizeTranscript(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

function containsWakePhrase(text: string): boolean {
  const normalized = normalizeTranscript(text);
  const compact = normalized.replace(/[\s,.!?]/g, '');

  if (
    WAKE_PHRASES.some(
      phrase =>
        normalized.includes(phrase) ||
        compact.includes(phrase.replace(/\s/g, '')),
    )
  ) {
    return true;
  }

  const hasHey = normalized.includes('hey') || normalized.includes('헤이');
  const hasTrack = normalized.includes('track') || normalized.includes('트랙');

  return hasHey && hasTrack;
}

function collectTranscript(event: SpeechRecognitionEvent): string {
  let text = '';
  for (let i = event.resultIndex; i < event.results.length; i += 1) {
    text += event.results[i][0]?.transcript ?? '';
  }
  return text;
}

export function useWakeWordListener({ enabled, onWakeWord }: Options) {
  const onWakeWordRef = useRef(onWakeWord);
  const triggeredRef = useRef(false);

  useEffect(() => {
    onWakeWordRef.current = onWakeWord;
  }, [onWakeWord]);

  useEffect(() => {
    triggeredRef.current = false;
  }, [enabled]);

  useEffect(() => {
    const SpeechRecognitionCtor = getSpeechRecognitionCtor();
    if (!SpeechRecognitionCtor || !enabled) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ko-KR';

    let stopped = false;
    let restartTimer: number | undefined;

    const clearRestartTimer = () => {
      if (restartTimer !== undefined) {
        window.clearTimeout(restartTimer);
        restartTimer = undefined;
      }
    };

    const scheduleRestart = (delayMs = 250) => {
      if (stopped || !enabled) return;
      clearRestartTimer();
      restartTimer = window.setTimeout(() => {
        if (stopped || !enabled || document.visibilityState !== 'visible') return;
        try {
          recognition.start();
        } catch {
          scheduleRestart(500);
        }
      }, delayMs);
    };

    recognition.onresult = event => {
      const transcript = collectTranscript(event);
      if (!containsWakePhrase(transcript) || triggeredRef.current) return;

      triggeredRef.current = true;
      recognition.stop();
      onWakeWordRef.current();
    };

    recognition.onerror = event => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        stopped = true;
        clearRestartTimer();
        return;
      }
      scheduleRestart(event.error === 'no-speech' ? 100 : 400);
    };

    recognition.onend = () => {
      if (stopped || triggeredRef.current) return;
      scheduleRestart();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        scheduleRestart(100);
        return;
      }
      clearRestartTimer();
      try {
        recognition.stop();
      } catch {
        // ignore stop errors while backgrounded
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (document.visibilityState === 'visible') {
      try {
        recognition.start();
      } catch {
        scheduleRestart(500);
      }
    }

    return () => {
      stopped = true;
      clearRestartTimer();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.abort();
      } catch {
        // ignore abort errors on cleanup
      }
    };
  }, [enabled]);
}
