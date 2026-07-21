import { normalizeTireOkayPrompt } from '../components/voice/tireOkayMatch';

const EXACT_PHRASES = [
  'hey track',
  'hey tracks',
  'hey trek',
  'hey trak',
  'hey trac',
  'hey trackk',
  'hey truck',
  'hay track',
  'he track',
  'hi track',
  'hy track',
  'a track',
  'e track',
  '8 track',
  'head track',
  'ate track',
  'heytrack',
  'haytrack',
  'hetrack',
  'hitrack',
  'hey 트랙',
  '헤이 track',
  '헤이 트랙',
  '헤이트랙',
  '헤이 트렉',
  '헤이트렉',
  '헤이 트랙크',
  '헤이트랙크',
  '해이 트랙',
  '해이트랙',
  '헤 트랙',
  '헤트랙',
  '에이 트랙',
  '에이트랙',
  '에 트랙',
  '헤트랙',
  '헤트렉',
  '헤 track',
  '헤이 트랙',
] as const;

const HEY_VARIANTS = [
  'hey',
  'hay',
  'he',
  'hei',
  'heyy',
  'hi',
  'hy',
  'head',
  'ate',
  'a',
  'e',
  '8',
  '예',
  '헤이',
  '해이',
  '헤',
  '에이',
  '헤이야',
  '헤드',
];

const TRACK_VARIANTS = [
  'track',
  'tracks',
  'trek',
  'treck',
  'trak',
  'trach',
  'trac',
  'truk',
  'truck',
  '트랙',
  '트렉',
  '트랙크',
  '특',
  '뜩',
  '뜨랙',
  '트랙이',
];

const WAKE_COMPACT_TARGETS = [
  'heytrack',
  'heytracks',
  'heytrak',
  'heytruk',
  'heytruck',
  'heytrac',
  'haytrack',
  'hetrack',
  'hitrack',
  'headtrack',
  '헤이트랙',
  '해이트랙',
  '헤트랙',
  '헤트렉',
  '에이트랙',
  '헤이트렉',
];

const LOOSE_WAKE_PATTERNS = [
  /\b(hey|hay|he|hi|hy|head|ate|a)\s*(track|trek|trak|truck|tracks|trac)\b/i,
  /(헤이|해이|헤|에이|예)\s*(트랙|트렉|트랙크|특|뜩)/,
  /(hey|hay|he|hi)\s*(트랙|트렉|트랙크)/i,
  /(헤이|해이|헤|에이)\s*(track|trek|trak|truck|tracks)/i,
  /(헤이트랙|해이트랙|헤트랙|헤트렉|heytrack|haytrack|hetrack)/,
] as const;

const MAX_WAKE_TOKEN_DISTANCE = 6;
const MAX_COMPACT_WAKE_DISTANCE = 3;

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

function isSimilarToken(
  token: string,
  variants: readonly string[],
  maxDistance: number,
): boolean {
  if (token.length < 1) return false;

  return variants.some(variant => {
    if (token === variant) return true;
    if (token.includes(variant) || variant.includes(token)) return true;
    if (Math.abs(token.length - variant.length) > maxDistance) return false;
    return levenshtein(token, variant) <= maxDistance;
  });
}

function matchesExactPhrase(normalized: string, compactText: string): boolean {
  return EXACT_PHRASES.some(phrase => {
    if (normalized.includes(phrase)) return true;
    return compactText.includes(compact(phrase));
  });
}

function matchesLoosePatterns(text: string, normalized: string, compactText: string): boolean {
  if (LOOSE_WAKE_PATTERNS.some(pattern => pattern.test(text))) return true;
  if (LOOSE_WAKE_PATTERNS.some(pattern => pattern.test(normalized))) return true;
  return LOOSE_WAKE_PATTERNS.some(pattern => pattern.test(compactText));
}

function matchesCompactWakePhrase(compactText: string): boolean {
  if (compactText.length < 4) return false;

  for (const target of WAKE_COMPACT_TARGETS) {
    const maxLen = Math.max(target.length + 3, 9);
    for (
      let len = Math.max(4, target.length - 2);
      len <= maxLen;
      len += 1
    ) {
      if (len > compactText.length) continue;
      for (let i = 0; i <= compactText.length - len; i += 1) {
        const slice = compactText.slice(i, i + len);
        if (levenshtein(slice, target) <= MAX_COMPACT_WAKE_DISTANCE) return true;
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
    if (isSimilarToken(token, HEY_VARIANTS, 2)) heyIndices.push(index);
    if (isSimilarToken(token, TRACK_VARIANTS, 2)) trackIndices.push(index);
  });

  for (const heyIndex of heyIndices) {
    for (const trackIndex of trackIndices) {
      if (Math.abs(heyIndex - trackIndex) <= MAX_WAKE_TOKEN_DISTANCE) return true;
    }
  }

  return false;
}

function matchesCompactShape(compactText: string): boolean {
  let heyStart = -1;
  let heyEnd = -1;
  let trackStart = -1;
  let trackEnd = -1;

  for (const variant of HEY_VARIANTS) {
    const idx = compactText.indexOf(variant);
    if (idx >= 0) {
      heyStart = idx;
      heyEnd = idx + variant.length;
      break;
    }
  }

  if (heyStart < 0) {
    for (let i = 0; i < compactText.length - 1; i += 1) {
      for (const variant of HEY_VARIANTS) {
        if (variant.length < 2) continue;
        const slice = compactText.slice(i, i + variant.length + 1);
        if (levenshtein(slice.slice(0, variant.length), variant) <= 1) {
          heyStart = i;
          heyEnd = i + variant.length;
          break;
        }
      }
      if (heyStart >= 0) break;
    }
  }

  for (const variant of TRACK_VARIANTS) {
    const idx = compactText.indexOf(variant);
    if (idx >= 0) {
      trackStart = idx;
      trackEnd = idx + variant.length;
      break;
    }
  }

  if (trackStart < 0) {
    for (let i = 0; i < compactText.length - 2; i += 1) {
      for (const variant of TRACK_VARIANTS) {
        if (variant.length < 3) continue;
        const slice = compactText.slice(i, i + variant.length + 1);
        if (levenshtein(slice.slice(0, variant.length), variant) <= 2) {
          trackStart = i;
          trackEnd = i + variant.length;
          break;
        }
      }
      if (trackStart >= 0) break;
    }
  }

  if (heyStart < 0 || trackStart < 0) return false;

  const gap = Math.max(0, Math.max(trackStart, heyStart) - Math.min(heyEnd, trackEnd));
  return gap <= 4;
}

export function containsWakePhrase(text: string): boolean {
  if (!text.trim()) return false;

  const normalized = normalizeForMatch(text);
  const compactText = compact(text);

  if (matchesExactPhrase(normalized, compactText)) return true;
  if (matchesLoosePatterns(text, normalized, compactText)) return true;
  if (matchesCompactWakePhrase(compactText)) return true;
  if (matchesCompactShape(compactText)) return true;
  if (matchesTokenPair(normalized)) return true;

  return false;
}

export function extractWakeCommand(text: string): string | null {
  const afterWake = getTextAfterLastWakePhrase(text);
  if (!afterWake.trim()) return null;
  return normalizeTireOkayPrompt(afterWake);
}

function getTextAfterLastWakePhrase(text: string): string {
  const normalized = normalizeForMatch(text);
  const compactText = compact(text);
  let lastEnd = -1;

  for (const phrase of EXACT_PHRASES) {
    const idx = normalized.lastIndexOf(phrase);
    if (idx >= 0) {
      lastEnd = Math.max(lastEnd, idx + phrase.length);
    }

    const compactPhrase = compact(phrase);
    const compactIdx = compactText.lastIndexOf(compactPhrase);
    if (compactIdx >= 0) {
      lastEnd = Math.max(lastEnd, compactIdx + compactPhrase.length);
    }
  }

  if (lastEnd < 0) {
    for (const pattern of LOOSE_WAKE_PATTERNS) {
      const match = normalized.match(pattern);
      if (match && match.index !== undefined) {
        lastEnd = Math.max(lastEnd, match.index + match[0].length);
      }
    }
  }

  if (lastEnd < 0) return '';
  if (lastEnd >= normalized.length) return '';

  return normalized.slice(lastEnd).trim();
}

export function collectFullTranscript(event: SpeechRecognitionEvent): string {
  let text = '';
  for (let i = 0; i < event.results.length; i += 1) {
    text += event.results[i][0]?.transcript ?? '';
  }
  return text;
}

export function collectRecentTranscript(event: SpeechRecognitionEvent): string {
  let text = '';
  for (let i = event.resultIndex; i < event.results.length; i += 1) {
    text += event.results[i][0]?.transcript ?? '';
  }
  return text;
}
