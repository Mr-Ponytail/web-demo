import { useLiveSensorReading } from '../../hooks/useLiveSensorReading';
import './SignalBadge.css';

type Props = {
  rssi: number | undefined;
  /** Stable phase so multiple badges don't move in sync. */
  phase?: number;
};

function rssiLevel(rssi: number | undefined): 'good' | 'caution' | 'danger' {
  if (rssi === undefined) return 'caution';
  if (rssi >= -65) return 'good';
  if (rssi >= -80) return 'caution';
  return 'danger';
}

function rssiWifiIcon(level: 'good' | 'caution' | 'danger'): string {
  return `/assets/icons/wifi-${level}.svg`;
}

export function phaseFromDeviceId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return (Math.abs(hash) % 1000) / 100;
}

export function SignalBadge({ rssi, phase = 0 }: Props) {
  const liveRssi = useLiveSensorReading(rssi ?? 0, rssi !== undefined, {
    phase,
    amplitude: 5,
  });
  const displayRssi =
    rssi !== undefined ? Math.round(liveRssi) : undefined;
  const level = rssiLevel(displayRssi);
  const label = displayRssi !== undefined ? `${displayRssi} dBm` : '--';

  return (
    <span className={`signal-badge signal-badge--${level}`}>
      <img src={rssiWifiIcon(level)} alt="" width={12} height={12} />
      {label}
    </span>
  );
}
