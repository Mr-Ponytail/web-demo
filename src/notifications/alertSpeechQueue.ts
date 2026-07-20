import { buildSpeakableAlertUtterance } from './speakableAlertText';

type QueueItem = { title: string; body: string };

const queue: QueueItem[] = [];
let speaking = false;

function getSpeechSynthesis(): SpeechSynthesis | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }
  return window.speechSynthesis;
}

function pickEnVoice(): SpeechSynthesisVoice | undefined {
  const synth = getSpeechSynthesis();
  if (!synth) return undefined;
  const voices = synth.getVoices();
  return (
    voices.find(v => v.lang === 'en-US') ??
    voices.find(v => v.lang.startsWith('en')) ??
    voices[0]
  );
}

function onUtteranceEnded(): void {
  speaking = false;
  pumpQueue();
}

function pumpQueue(): void {
  if (speaking || queue.length === 0) return;

  const synth = getSpeechSynthesis();
  const next = queue.shift();
  if (!synth || !next) return;

  speaking = true;
  const utterance = new SpeechSynthesisUtterance(
    buildSpeakableAlertUtterance(next.title, next.body),
  );
  utterance.lang = 'en-US';
  const voice = pickEnVoice();
  if (voice) utterance.voice = voice;
  utterance.onend = onUtteranceEnded;
  utterance.onerror = onUtteranceEnded;
  synth.speak(utterance);
}

/** Enqueue alert title+body for sequential en-US TTS playback. */
export function enqueueAlertSpeech(title: string, body: string): void {
  queue.push({ title, body });
  pumpQueue();
}
