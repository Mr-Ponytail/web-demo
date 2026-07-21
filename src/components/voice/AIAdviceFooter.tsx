import { useEffect, useState } from 'react';
import { IMG } from '../../assets';
import { PULL_OVER_COPY, type PullOverLocale } from './pullOverCopy';
import { useAiTypewriter } from './useAiTypewriter';
import './AICards.css';

type Props = {
  visible: boolean;
  onGotIt?: () => void;
  locale?: PullOverLocale;
};

export function AIAdviceFooter({
  visible,
  onGotIt,
  locale = 'en',
}: Props) {
  const copy = PULL_OVER_COPY[locale];
  const [showButtons, setShowButtons] = useState(false);
  const { typedText, sparkOpacity, isComplete } = useAiTypewriter({
    visible,
    text: copy.advice,
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
            {copy.openMap}
          </button>
          <button type="button" className="ai-advice__got" onClick={onGotIt}>
            {copy.gotIt}
          </button>
        </div>
      ) : null}
    </div>
  );
}
