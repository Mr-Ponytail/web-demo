export const TIRE_OKAY_CANONICAL = '타이어 괜찮아?';

const EXACT_PHRASES = [
  '타이어 괜찮아',
  '타이어 괜찮나',
  '타이어 괜찮니',
  '타이어 괜찮아요',
  '타이어 괜찮습니까',
  '타이어가 괜찮',
  '타이어는 괜찮',
  '타이어 상태 괜찮',
  '타이어 상태 어때',
  '타이어 이상 없',
  '타이어 문제 없',
  '바퀴 괜찮',
  '바퀴는 괜찮',
  '바퀴 상태',
  'are my tires okay',
  'is my tire okay',
  'are the tires okay',
  'are my tires fine',
  'is the tire safe',
  'tires okay',
  'tire okay',
  'tires fine',
  'tire fine',
  'tires safe',
  'wheel okay',
  'wheels okay',
  'how are my tires',
  'how is my tire',
] as const;

const TIRE_VARIANTS = [
  '타이어',
  '타이',
  'tire',
  'tires',
  'tyre',
  'tyres',
  'wheel',
  'wheels',
  '바퀴',
  'whl',
];

const OKAY_VARIANTS = [
  '괜찮',
  '괜찬',
  '괜찮아',
  '괜찮나',
  '괜찮니',
  '괜찮습',
  '괜찮을',
  '괜찮은',
  'okay',
  'ok',
  'fine',
  'safe',
  'alright',
  'good',
  'normal',
  '문제없',
  '이상없',
  '어때',
  '상태',
  'kay',
];

const LOOSE_PATTERNS = [
  /(타이어|타이|tire|tires|tyre|wheel|wheels|바퀴).{0,12}(괜찮|괜찬|okay|ok|fine|safe|alright|문제\s*없|이상\s*없|어때|상태)/i,
  /(괜찮|괜찬|okay|ok|fine|safe|alright|문제\s*없|이상\s*없).{0,12}(타이어|타이|tire|tires|tyre|wheel|wheels|바퀴)/i,
  /(are|is)\s+(my|the)\s+(tire|tires|wheel|wheels)\s+(okay|ok|fine|safe|alright|good)/i,
  /(how)\s+(are|is)\s+(my|the)\s+(tire|tires|wheel|wheels)/i,
  /(tire|tires|wheel|wheels)\s+(okay|ok|fine|safe|alright|good)/i,
] as const;

const COMPACT_TARGETS = [
  '타이어괜찮',
  '타이어괜찬',
  '바퀴괜찮',
  'tireokay',
  'tiresokay',
  'tirefine',
  'tiresfine',
  'wheelsokay',
];

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
  if (token.length < 2) return false;

  return variants.some(variant => {
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

function matchesLoosePatterns(text: string): boolean {
  return LOOSE_PATTERNS.some(pattern => pattern.test(text));
}

function matchesTokenPair(normalized: string): boolean {
  const tokens = normalized.split(/\s+/).filter(Boolean);
  if (tokens.length < 1) return false;

  const tireIndices: number[] = [];
  const okayIndices: number[] = [];

  tokens.forEach((token, index) => {
    if (isSimilarToken(token, TIRE_VARIANTS, 2)) tireIndices.push(index);
    if (isSimilarToken(token, OKAY_VARIANTS, 2)) okayIndices.push(index);
  });

  for (const tireIndex of tireIndices) {
    for (const okayIndex of okayIndices) {
      if (Math.abs(tireIndex - okayIndex) <= 5) return true;
    }
  }

  return false;
}

function matchesCompactPhrase(compactText: string): boolean {
  if (compactText.length < 4) return false;

  for (const target of COMPACT_TARGETS) {
    const maxLen = Math.max(target.length + 3, 8);
    for (let len = Math.max(4, target.length - 2); len <= maxLen; len += 1) {
      if (len > compactText.length) continue;
      for (let i = 0; i <= compactText.length - len; i += 1) {
        const slice = compactText.slice(i, i + len);
        if (levenshtein(slice, target) <= 2) return true;
      }
    }
  }

  return false;
}

export function matchesTireOkayPrompt(text: string): boolean {
  if (!text.trim()) return false;

  const normalized = normalizeForMatch(text);
  const compactText = compact(text);

  if (matchesExactPhrase(normalized, compactText)) return true;
  if (matchesLoosePatterns(text)) return true;
  if (matchesTokenPair(normalized)) return true;
  if (matchesCompactPhrase(compactText)) return true;

  return false;
}

export function normalizeTireOkayPrompt(text: string): string | null {
  return matchesTireOkayPrompt(text) ? TIRE_OKAY_CANONICAL : null;
}
