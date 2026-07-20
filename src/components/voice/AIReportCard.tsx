import { IMG } from '../../assets';
import './AICards.css';

export function AIReportCard() {
  return (
    <div className="ai-report">
      <div className="ai-report__header">
        <img src={IMG.aiReport} alt="" width={32} height={28} />
        <h3>Road hazard report</h3>
      </div>
      <hr className="ai-report__divider" />
      <p className="ai-report__primary">I - 80 W · MM42 · 2:32 PM</p>
      <p className="ai-report__secondary">Detected impact · RLO Wheel Sensor</p>
    </div>
  );
}
