import { useEffect, useRef } from 'react';
import {
  collectFullTranscript,
  collectRecentTranscript,
  containsWakePhrase,
  extractWakeCommand,
} from './wakeWordMatch';

type Options = {
  enabled: boolean;
  onWakeWord: (command: string | null) => void;
};

function getSpeechRecognitionCtor():
  | (new () => SpeechRecognition)
  | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
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

    const scheduleRestart = (delayMs = 150) => {
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
      const fullTranscript = collectFullTranscript(event);
      const recentTranscript = collectRecentTranscript(event);
      const transcript = containsWakePhrase(recentTranscript)
        ? recentTranscript
        : fullTranscript;

      if (!containsWakePhrase(transcript) || triggeredRef.current) return;

      triggeredRef.current = true;
      recognition.stop();
      onWakeWordRef.current(extractWakeCommand(fullTranscript));
    };

    recognition.onerror = event => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        stopped = true;
        clearRestartTimer();
        return;
      }
      scheduleRestart(event.error === 'no-speech' ? 80 : 250);
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
