import './SignalBadge.css';

type Props = {
  rssi: number | undefined;
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

export function SignalBadge({ rssi }: Props) {
  const level = rssiLevel(rssi);
  const label = rssi !== undefined ? `${rssi} dBm` : '--';

  return (
    <span className={`signal-badge signal-badge--${level}`}>
      <img src={rssiWifiIcon(level)} alt="" width={12} height={12} />
      {label}
    </span>
  );
}
