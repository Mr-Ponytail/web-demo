import { useEffect, useRef, useState } from 'react';

export const AI_TYPEWRITER_SPARK_FADE_MS = 280;
export const AI_TYPEWRITER_START_DELAY_MS = 180;

type Options = {
  visible: boolean;
  text: string;
  intervalMs: number;
  onSparkReady?: () => void;
};

export function useAiTypewriter({
  visible,
  text,
  intervalMs,
  onSparkReady,
}: Options) {
  const [typedText, setTypedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [sparkOpacity, setSparkOpacity] = useState(0);
  const onSparkReadyRef = useRef(onSparkReady);
  onSparkReadyRef.current = onSparkReady;

  useEffect(() => {
    if (!visible) {
      setTypedText('');
      setIsComplete(false);
      setSparkOpacity(0);
      return;
    }

    let typeTimer: ReturnType<typeof setInterval> | undefined;
    let startTypeTimer: ReturnType<typeof setTimeout> | undefined;
    let sparkTimer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    setTypedText('');
    setIsComplete(false);
    setSparkOpacity(0);

    // next frame → fade spark
    requestAnimationFrame(() => {
      if (!cancelled) setSparkOpacity(1);
    });

    sparkTimer = setTimeout(() => {
      if (cancelled) return;
      onSparkReadyRef.current?.();
      startTypeTimer = setTimeout(() => {
        let index = 0;
        typeTimer = setInterval(() => {
          index += 1;
          setTypedText(text.slice(0, index));
          if (index >= text.length) {
            if (typeTimer) clearInterval(typeTimer);
            setIsComplete(true);
          }
        }, intervalMs);
      }, AI_TYPEWRITER_START_DELAY_MS);
    }, AI_TYPEWRITER_SPARK_FADE_MS);

    return () => {
      cancelled = true;
      if (sparkTimer) clearTimeout(sparkTimer);
      if (startTypeTimer) clearTimeout(startTypeTimer);
      if (typeTimer) clearInterval(typeTimer);
    };
  }, [visible, text, intervalMs]);

  return { typedText, sparkOpacity, isComplete };
}
