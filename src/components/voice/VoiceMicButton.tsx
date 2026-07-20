import { IMG } from '../../assets';
import { AI_BUTTON_SIZE } from './constants';

type Props = {
  animating: boolean;
  onPress: () => void;
};

export function VoiceMicButton({ animating, onPress }: Props) {
  return (
    <button
      type="button"
      className={animating ? 'vm__mic vm__mic--live' : 'vm__mic'}
      style={{ width: AI_BUTTON_SIZE, height: AI_BUTTON_SIZE }}
      onClick={onPress}
      aria-label={animating ? 'Stop listening' : 'Start listening'}
    >
      {animating ? (
        <>
          <span className="vm__mic-ring vm__mic-ring--a" aria-hidden />
          <span className="vm__mic-ring vm__mic-ring--b" aria-hidden />
          <img
            src={IMG.ai}
            alt=""
            width={AI_BUTTON_SIZE}
            height={AI_BUTTON_SIZE}
          />
        </>
      ) : (
        <img
          src={IMG.ai}
          alt=""
          width={AI_BUTTON_SIZE}
          height={AI_BUTTON_SIZE}
        />
      )}
    </button>
  );
}
