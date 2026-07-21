import { normalizeTireOkayPrompt } from '../components/voice/tireOkayMatch';

const EXACT_PHRASES = [
  'hey track',
  'hay track',
  'he track',
  'hey trek',
  'hey trak',
  'hey truck',
  'a track',
  '헤이 트랙',
  '헤이트랙',
  '헤이 트렉',
  '헤이 트랙크',
  '해이 트랙',
  '해이트랙',
  '헤 트랙',
  '에이 트랙',
  'heytrack',
  'haytrack',
  'hetrack',
] as const;

const HEY_VARIANTS = ['hey', 'hay', 'he', 'hei', 'heyy', '헤이', '해이', '헤', '에이'];
const TRACK_VARIANTS = [
  'track',
  'trek',
  'trak',
  'trach',
  'truck',
  'tracks',
  '트랙',
  '트렉',
  '트랙크',
  '특',
  '뜩',
];

const WAKE_COMPACT_TARGETS = ['heytrack', 'heytrak', 'heytruk', '헤이트랙', '해이트랙'];

function normalizeForMatch(text: string): string {
  return text
    .toLowerCase()
    .replace(/[''`]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function compact(text: string): string {
  return normalizeForMatch(text).replace(/\s/g, '');
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix: number[][] = Array.from({ length: rows }, () =>
    Array<number>(cols).fill(0),
  );

  for (let i = 0; i < rows; i += 1) matrix[i][0] = i;
  for (let j = 0; j < cols; j += 1) matrix[0][j] = j;

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[a.length][b.length];
}

function isSimilarToken(token: string, variants: readonly string[], maxDistance: number): boolean {
  if (token.length < 2) return false;

  return variants.some(variant => {
    if (token.includes(variant) || variant.includes(token)) return true;
    if (Math.abs(token.length - variant.length) > maxDistance) return false;
    return levenshtein(token, variant) <= maxDistance;
  });
}

function matchesCompactWakePhrase(compactText: string): boolean {
  if (compactText.length < 5) return false;

  for (const target of WAKE_COMPACT_TARGETS) {
    const maxLen = Math.max(target.length + 2, 10);
    for (let len = Math.max(5, target.length - 2); len <= maxLen; len += 1) {
      if (len > compactText.length) continue;
      for (let i = 0; i <= compactText.length - len; i += 1) {
        const slice = compactText.slice(i, i + len);
        if (levenshtein(slice, target) <= 2) return true;
      }
    }
  }

  return false;
}

function matchesTokenPair(normalized: string): boolean {
  const tokens = normalized.split(/\s+/).filter(Boolean);
  if (tokens.length < 1) return false;

  const heyIndices: number[] = [];
  const trackIndices: number[] = [];

  tokens.forEach((token, index) => {
    if (isSimilarToken(token, HEY_VARIANTS, 1)) heyIndices.push(index);
    if (isSimilarToken(token, TRACK_VARIANTS, 2)) trackIndices.push(index);
  });

  for (const heyIndex of heyIndices) {
    for (const trackIndex of trackIndices) {
      if (Math.abs(heyIndex - trackIndex) <= 4) return true;
    }
  }

  return false;
}

function matchesExactPhrase(normalized: string, compactText: string): boolean {
  return EXACT_PHRASES.some(phrase => {
    if (normalized.includes(phrase)) return true;
    return compactText.includes(compact(phrase));
  });
}

function matchesLoosePair(normalized: string, compactText: string): boolean {
  const hasHey =
    /\b(hey|hay|he|hei|heyy)\b/i.test(normalized) ||
    /(헤이|해이|에이)/.test(compactText) ||
    compactText.startsWith('he') ||
    compactText.includes('hey');

  const hasTrack =
    /\b(track|trek|trak|truck|tracks)\b/i.test(normalized) ||
    /(트랙|트렉|트랙크|특|뜩)/.test(compactText);

  return hasHey && hasTrack;
}

export function containsWakePhrase(text: string): boolean {
  if (!text.trim()) return false;

  const normalized = normalizeForMatch(text);
  const compactText = compact(text);

  if (matchesExactPhrase(normalized, compactText)) return true;
  if (matchesCompactWakePhrase(compactText)) return true;
  if (matchesTokenPair(normalized)) return true;
  if (matchesLoosePair(normalized, compactText)) return true;

  return false;
}

export function extractWakeCommand(text: string): string | null {
  return normalizeTireOkayPrompt(text);
}

export function collectFullTranscript(event: SpeechRecognitionEvent): string {
  let text = '';
  for (let i = 0; i < event.results.length; i += 1) {
    text += event.results[i][0]?.transcript ?? '';
  }
  return text;
}
