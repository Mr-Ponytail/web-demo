import { useEffect, useState } from 'react';
import { IMG } from '../../assets';
import { useAiTypewriter } from './useAiTypewriter';
import './AICards.css';

const ADVICE_TEXT =
  'Nut torque is down to 54% and still falling. Pull over now to prevent damage. You should check your navigation app for the nearest service center.';

type Props = {
  visible: boolean;
  onGotIt?: () => void;
};

export function AIAdviceFooter({ visible, onGotIt }: Props) {
  const [showButtons, setShowButtons] = useState(false);
  const { typedText, sparkOpacity, isComplete } = useAiTypewriter({
    visible,
    text: ADVICE_TEXT,
    intervalMs: 16,
  });

  useEffect(() => {
    if (!visible) {
      setShowButtons(false);
      return;
    }
    if (isComplete) setShowButtons(true);
  }, [visible, isComplete]);

  if (!visible) return null;

  return (
    <div className="ai-advice">
      <img
        src={IMG.aiSpark}
        alt=""
        width={24}
        height={24}
        style={{ opacity: sparkOpacity, transition: 'opacity 280ms ease-out' }}
      />
      <p className="ai-advice__text">{typedText}</p>
      {showButtons ? (
        <div className="ai-advice__btns">
          <button type="button" className="ai-advice__map">
            Open Map
          </button>
          <button type="button" className="ai-advice__got" onClick={onGotIt}>
            Got it
          </button>
        </div>
      ) : null}
    </div>
  );
}
