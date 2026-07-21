import { useEffect, useRef } from 'react';
import { normalizeTireOkayPrompt } from '../components/voice/tireOkayMatch';

type Options = {
  enabled: boolean;
  onTranscript: (text: string) => void;
};

function getSpeechRecognitionCtor():
  | (new () => SpeechRecognition)
  | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}

function classifyTranscript(text: string): string {
  const command = normalizeTireOkayPrompt(text);
  if (command) return command;
  return text.trim();
}

export function useInModalSpeech({ enabled, onTranscript }: Options) {
  const onTranscriptRef = useRef(onTranscript);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    const SpeechRecognitionCtor = getSpeechRecognitionCtor();
    if (!SpeechRecognitionCtor || !enabled) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'ko-KR';

    let stopped = false;
    let fired = false;
    let readyAt = 0;
    let restartTimer: number | undefined;

    const clearTimer = () => {
      if (restartTimer !== undefined) {
        window.clearTimeout(restartTimer);
        restartTimer = undefined;
      }
    };

    const scheduleRestart = (delayMs = 200) => {
      if (stopped || fired) return;
      clearTimer();
      restartTimer = window.setTimeout(() => {
        if (stopped || fired) return;
        try {
          recognition.start();
        } catch {
          scheduleRestart(400);
        }
      }, delayMs);
    };

    recognition.onstart = () => {
      readyAt = Date.now();
    };

    recognition.onresult = event => {
      if (fired) return;
      if (Date.now() - readyAt < 350) return;

      let text = '';
      for (let i = 0; i < event.results.length; i += 1) {
        text += event.results[i][0]?.transcript ?? '';
      }
      text = text.trim();
      if (!text) return;

      fired = true;
      recognition.stop();
      onTranscriptRef.current(classifyTranscript(text));
    };

    recognition.onerror = event => {
      if (
        event.error === 'not-allowed' ||
        event.error === 'service-not-allowed'
      ) {
        stopped = true;
        clearTimer();
        return;
      }
      scheduleRestart(event.error === 'no-speech' ? 100 : 400);
    };

    recognition.onend = () => {
      if (stopped || fired) return;
      scheduleRestart();
    };

    try {
      recognition.start();
    } catch {
      scheduleRestart(300);
    }

    return () => {
      stopped = true;
      clearTimer();
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.onstart = null;
      try {
        recognition.abort();
      } catch {
        // ignore
      }
    };
  }, [enabled]);
}
