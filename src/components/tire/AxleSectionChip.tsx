import './AxleSectionChip.css';

export function AxleSectionChip({ label }: { label: 'FRONT' | 'REAR' }) {
  return (
    <div className="axle-chip">
      <span>{label}</span>
    </div>
  );
}
