import { useCallback, useEffect, useState } from 'react';
import { IMG } from '../../assets';
import { AIAdviceFooter } from './AIAdviceFooter';
import { AIAnswerCard } from './AIAnswerCard';
import { AIReportCard } from './AIReportCard';
import { AIReportFooter } from './AIReportFooter';
import { VoiceErrorBoundary } from './VoiceErrorBoundary';
import { VoiceMicButton } from './VoiceMicButton';
import {
  CANCEL_BUTTON_SIZE,
  formatHistoryTranscript,
  GUIDE_PROMPTS,
  HISTORY_FONT_SIZE,
  HISTORY_OPACITY,
  INSIGHT_CARD_GAP,
  isPotholePrompt,
  isPullOverPrompt,
  LIVE_FONT_SIZE,
  SPARK_ICON_SIZE,
  TRANSCRIPT_BASE_MARGIN,
} from './constants';
import {
  useVoiceModalTransition,
  type VoicePhase,
} from './useVoiceModalTransition';
import './VoiceModal.css';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function VoiceModal({ visible, onClose }: Props) {
  const [phase, setPhase] = useState<VoicePhase>('panel');
  const [isListening, setIsListening] = useState(false);
  const [demoTranscript, setDemoTranscript] = useState<string | null>(null);
  const [showAdvice, setShowAdvice] = useState(false);
  const [showReportAdvice, setShowReportAdvice] = useState(false);
  const [awaitingCancel, setAwaitingCancel] = useState(false);
  const [insightKey, setInsightKey] = useState(0);

  const displayTranscript = demoTranscript ?? '';

  const {
    headerHidden,
    riseActive,
    isHistoryTranscript,
    resetTransition,
    headerFadeMs,
    riseMs,
  } = useVoiceModalTransition({
    phase,
    isListening,
    demoTranscript,
    awaitingCancel,
    displayTranscript,
  });

  const resetSession = useCallback(() => {
    resetTransition();
    setDemoTranscript(null);
    setShowAdvice(false);
    setShowReportAdvice(false);
    setAwaitingCancel(false);
    setIsListening(false);
  }, [resetTransition]);

  const handleClose = useCallback(() => {
    setIsListening(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!visible) {
      setPhase('panel');
      resetSession();
    }
  }, [visible, resetSession]);

  const showTranscript = phase === 'animating' && !!displayTranscript;
  const showPotholeReport =
    showTranscript &&
    isHistoryTranscript &&
    isPotholePrompt(displayTranscript);
  const showPullOverInsight =
    showTranscript &&
    isHistoryTranscript &&
    isPullOverPrompt(displayTranscript);
  const showGenericInsight =
    showTranscript &&
    isHistoryTranscript &&
    !showPullOverInsight &&
    !showPotholeReport;

  useEffect(() => {
    if (!showPotholeReport) {
      setShowReportAdvice(false);
      setAwaitingCancel(false);
      return;
    }
    const timer = window.setTimeout(() => setShowReportAdvice(true), 650);
    return () => window.clearTimeout(timer);
  }, [showPotholeReport]);

  const handleMicPress = () => {
    if (phase === 'animating') {
      resetSession();
      setPhase('panel');
      return;
    }
    setShowAdvice(false);
    setShowReportAdvice(false);
    setAwaitingCancel(false);
    setDemoTranscript(null);
    resetTransition();
    setPhase('animating');
    setIsListening(true);
  };

  const handleGuidePromptPress = (prompt: string) => {
    resetTransition();
    setShowAdvice(false);
    setShowReportAdvice(false);
    setAwaitingCancel(false);
    setIsListening(false);
    setDemoTranscript(prompt);
    setInsightKey(k => k + 1);
    setPhase('animating');
  };

  if (!visible) return null;

  return (
    <div
      className="vm"
      role="dialog"
      aria-modal="true"
      aria-label="Voice assistant"
    >
      <div className="vm__bg" aria-hidden />
      <div className="vm__glow" aria-hidden />

      <div className="vm__content">
        {phase === 'panel' ? (
          <div className="vm__panel">
            <img
              src={IMG.aiSpark}
              alt=""
              width={SPARK_ICON_SIZE}
              height={SPARK_ICON_SIZE}
            />
            <h2>What can I do for you</h2>
            <div className="vm__prompts">
              {GUIDE_PROMPTS.map(prompt => (
                <button
                  key={prompt}
                  type="button"
                  className="vm__prompt"
                  onClick={() => handleGuidePromptPress(prompt)}
                >
                  “{prompt}”
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="vm__listen-scroll">
            <div
              className={
                headerHidden
                  ? 'vm__listen-header is-hidden'
                  : 'vm__listen-header'
              }
              style={{ transitionDuration: `${headerFadeMs}ms` }}
            >
              <img
                src={IMG.aiSpark}
                alt=""
                width={SPARK_ICON_SIZE}
                height={SPARK_ICON_SIZE}
              />
              <h2>I&apos;m listening...</h2>
            </div>

            {showTranscript ? (
              <div
                className={
                  riseActive
                    ? 'vm__transcript-wrap is-rise'
                    : 'vm__transcript-wrap'
                }
                style={{
                  marginTop: TRANSCRIPT_BASE_MARGIN,
                  transitionDuration: `${riseMs}ms`,
                  ['--vm-rise' as string]: `-${TRANSCRIPT_BASE_MARGIN}px`,
                }}
              >
                <p
                  className={
                    isHistoryTranscript
                      ? 'vm__transcript vm__transcript--history'
                      : 'vm__transcript'
                  }
                  style={{
                    fontSize: isHistoryTranscript
                      ? HISTORY_FONT_SIZE
                      : LIVE_FONT_SIZE,
                    opacity: isHistoryTranscript ? HISTORY_OPACITY : 1,
                  }}
                >
                  {isHistoryTranscript
                    ? formatHistoryTranscript(displayTranscript)
                    : displayTranscript}
                </p>

                <VoiceErrorBoundary key={insightKey}>
                  {showPullOverInsight ? (
                    <div
                      className={
                        riseActive ? 'vm__insight is-in' : 'vm__insight'
                      }
                      style={{ marginTop: INSIGHT_CARD_GAP }}
                    >
                      <AIAnswerCard
                        onGraphComplete={() => setShowAdvice(true)}
                      />
                      <AIAdviceFooter
                        visible={showAdvice}
                        onGotIt={handleClose}
                      />
                    </div>
                  ) : null}

                  {showPotholeReport ? (
                    <div
                      className={
                        riseActive ? 'vm__insight is-in' : 'vm__insight'
                      }
                      style={{ marginTop: INSIGHT_CARD_GAP }}
                    >
                      <AIReportCard />
                      <AIReportFooter
                        visible={showReportAdvice}
                        onReadyForCancelListen={() => setAwaitingCancel(true)}
                        onCancel={handleClose}
                      />
                    </div>
                  ) : null}

                  {showGenericInsight ? (
                    <div
                      className={
                        riseActive ? 'vm__insight is-in' : 'vm__insight'
                      }
                      style={{ marginTop: INSIGHT_CARD_GAP }}
                    >
                      <div className="vm__generic-card">
                        <img
                          src={IMG.statusLog.danger}
                          alt=""
                          width={32}
                          height={28}
                        />
                        <div>
                          <strong>FL needs attention first</strong>
                          <p>
                            Front-left shows the highest risk right now. Check
                            pressure and damage level before the others.
                          </p>
                        </div>
                      </div>
                      <div className="vm__generic-actions">
                        <button
                          type="button"
                          className="vm__got-it"
                          onClick={handleClose}
                        >
                          Got it
                        </button>
                      </div>
                    </div>
                  ) : null}
                </VoiceErrorBoundary>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="vm__controls">
        <div className="vm__ai-slot">
          <VoiceMicButton
            animating={phase === 'animating'}
            onPress={handleMicPress}
          />
        </div>
        <button
          type="button"
          className="vm__cancel"
          onClick={handleClose}
          aria-label="Close"
          style={{ width: CANCEL_BUTTON_SIZE, height: CANCEL_BUTTON_SIZE }}
        >
          <img
            src={IMG.cancel}
            alt=""
            width={CANCEL_BUTTON_SIZE}
            height={CANCEL_BUTTON_SIZE}
          />
        </button>
      </div>
    </div>
  );
}
