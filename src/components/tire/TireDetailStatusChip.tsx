import { IMG } from '../../assets';
import type { TireStatus } from '../../data/tireMocks';
import './TireDetailStatusChip.css';

const CHIP: Record<
  Exclude<TireStatus, 'offline'>,
  { bg: string; icon: string; label: string; text?: string; message?: string }
> = {
  normal: { bg: '#F2FFF6', icon: IMG.statusChip.good, label: 'Good' },
  caution: {
    bg: '#FEF4E6',
    icon: IMG.statusChip.caution,
    label: 'Warning',
    text: '#FF8C00',
    message: 'Please add air to the tire',
  },
  danger: {
    bg: '#FEECEC',
    icon: IMG.statusChip.danger,
    label: 'Critical',
    text: '#FF4242',
    message: 'Please deflat the tire',
  },
};

type Props = {
  status: TireStatus;
};

export function TireDetailStatusChip({ status }: Props) {
  if (status === 'offline') return null;

  const { bg, icon, label, text, message } = CHIP[status];

  return (
    <div
      className={
        message ? 'td-status-chip td-status-chip--message' : 'td-status-chip'
      }
      style={{ backgroundColor: bg }}
      aria-label={message ? `${label}. ${message}` : label}
    >
      <img src={icon} alt="" width={24} height={24} />
      {message ? (
        <span className="td-status-chip__text" style={{ color: text }}>
          {message}
        </span>
      ) : null}
    </div>
  );
}
