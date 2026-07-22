import type { ApiSignalMessage } from './shinhan/types';

export type InsightMessageCopy = {
  title: string;
  body: string;
  alert?: 'caution' | 'danger';
};

/** Commercial pressure floor used to estimate days-to-target on the client. */
const PRESSURE_TARGET_PSI = 85;

function daysToTarget(slopePerDay: number, lastAvg: number | undefined): number {
  if (!slopePerDay || slopePerDay >= 0 || lastAvg == null) return 3;
  const remaining = lastAvg - PRESSURE_TARGET_PSI;
  if (remaining <= 0) return 0;
  return Math.max(1, Math.ceil(remaining / Math.abs(slopePerDay)));
}

/**
 * Server sends message.code + params only; the client owns the sentence catalog.
 */
export function resolveInsightMessage(
  message: ApiSignalMessage | null | undefined,
  options?: { lastAvg?: number },
): InsightMessageCopy | null {
  if (!message) return null;

  switch (message.code) {
    case 'PRESSURE_BELOW_TARGET_SOON': {
      const slope = message.params.slopePerDay ?? -1.25;
      const deltaPct = message.params.deltaPct ?? 0;
      const days = daysToTarget(slope, options?.lastAvg);
      return {
        title: 'Dropping below target soon',
        body:
          days <= 0
            ? 'Pressure is already at or below the safe target. Top it up before the next run.'
            : `At this rate, pressure falls below target in about ${days} day${days === 1 ? '' : 's'} (${deltaPct}% vs last week). Top it up ahead of time to stay safe.`,
        alert: 'caution',
      };
    }
    case 'TEMP_PEAK_CLIMBING': {
      const slope = message.params.maxSlopePerDay ?? 0;
      const peak = message.params.peakMax ?? 0;
      return {
        title: 'Peak temperature climbing',
        body: `Daily peak is climbing about ${slope.toFixed(1)}°C/day (high ${peak.toFixed(1)}°C). Check pressure and load before the next long haul.`,
        alert: 'danger',
      };
    }
    default:
      return {
        title: 'Worth watching',
        body: 'This signal changed versus last week. Open Tire Log for the related events.',
        alert: 'caution',
      };
  }
}
