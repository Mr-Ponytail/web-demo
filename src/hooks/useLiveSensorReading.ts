import { useEffect, useState } from 'react';

const TICK_MS = 900;

type Options = {
  /** Phase offset so multiple sensors don't move in sync. */
  phase?: number;
  /** Peak wobble around the base value (same units as base). */
  amplitude?: number;
};

/**
 * Demo-only live sensor reading: gentle wobble around a base value so the UI
 * feels like a connected BLE sensor streaming updates.
 */
export function useLiveSensorReading(
  base: number,
  enabled: boolean,
  options: Options = {},
): number {
  const { phase = 0, amplitude = 1 } = options;
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setOffset(0);
      return;
    }

    const started = performance.now();
    const tick = () => {
      const t = (performance.now() - started) / 1000;
      const wobble =
        Math.sin(t * 0.85 + phase) * 0.72 +
        Math.sin(t * 1.7 + phase * 1.3) * 0.28;
      const noise = (Math.random() - 0.5) * 0.2;
      setOffset((wobble + noise) * amplitude);
    };

    tick();
    const id = window.setInterval(tick, TICK_MS);
    return () => window.clearInterval(id);
  }, [enabled, phase, amplitude]);

  if (!enabled) return base;
  return Math.round((base + offset) * 10) / 10;
}
