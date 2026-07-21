import type { CSSProperties } from 'react';
import type { TireKey, TireStatus } from '../../data/tireMocks';
import {
  getTireStatusDotColor,
  TIRE_DETAIL_SELECTOR_LABELS,
} from '../../tire/detailConstants';
import './TireDetailSelector.css';

const TOP: TireKey[] = ['FL', 'FR'];
const BOTTOM: TireKey[] = ['LO', 'LI', 'RI', 'RO'];

function indicatorStyle(key: TireKey): CSSProperties {
  const halfH = '50%';
  const halfW = '50%';
  const q = '25%';
  switch (key) {
    case 'FL':
      return { left: 0, top: 0, width: halfW, height: halfH, borderTopLeftRadius: 7.5 };
    case 'FR':
      return {
        left: halfW,
        top: 0,
        width: halfW,
        height: halfH,
        borderTopRightRadius: 7.5,
      };
    case 'LO':
      return {
        left: 0,
        top: halfH,
        width: q,
        height: halfH,
        borderBottomLeftRadius: 7.5,
      };
    case 'LI':
      return { left: q, top: halfH, width: q, height: halfH };
    case 'RI':
      return { left: '50%', top: halfH, width: q, height: halfH };
    case 'RO':
      return {
        left: '75%',
        top: halfH,
        width: q,
        height: halfH,
        borderBottomRightRadius: 7.5,
      };
  }
}

type Props = {
  selected: TireKey;
  onSelect: (key: TireKey) => void;
  tireStatusByKey: Record<TireKey, TireStatus>;
};

export function TireDetailSelector({
  selected,
  onSelect,
  tireStatusByKey,
}: Props) {
  return (
    <div className="td-selector">
      <div className="td-selector__indicator" style={indicatorStyle(selected)} />
      <div className="td-selector__divH" />
      <div className="td-selector__divV" style={{ left: '50%', top: 0, bottom: '50%' }} />
      <div className="td-selector__divV" style={{ left: '25%', top: '50%', bottom: 0 }} />
      <div className="td-selector__divV" style={{ left: '50%', top: '50%', bottom: 0 }} />
      <div className="td-selector__divV" style={{ left: '75%', top: '50%', bottom: 0 }} />

      <div className="td-selector__row">
        {TOP.map(key => {
          const on = selected === key;
          const dot = getTireStatusDotColor(tireStatusByKey[key]);
          return (
            <button
              key={key}
              type="button"
              className={on ? 'td-selector__cell td-selector__cell--half is-on' : 'td-selector__cell td-selector__cell--half'}
              onClick={() => onSelect(key)}
            >
              <span className="td-selector__label">
                {TIRE_DETAIL_SELECTOR_LABELS[key]}
                {dot ? (
                  <span className="td-selector__dot" style={{ background: dot }} />
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
      <div className="td-selector__row">
        {BOTTOM.map(key => {
          const on = selected === key;
          const dot = getTireStatusDotColor(tireStatusByKey[key]);
          return (
            <button
              key={key}
              type="button"
              className={on ? 'td-selector__cell td-selector__cell--q is-on' : 'td-selector__cell td-selector__cell--q'}
              onClick={() => onSelect(key)}
            >
              <span className="td-selector__label">
                {TIRE_DETAIL_SELECTOR_LABELS[key]}
                {dot ? (
                  <span className="td-selector__dot" style={{ background: dot }} />
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
