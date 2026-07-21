import type { TireSlotKey } from '../data/tireSlotGrid';

type Listener = () => void;
type TireCodes = Partial<Record<TireSlotKey, string>>;

const STORAGE_KEY = 'banf.web-demo.tireDotCodes';
const listeners = new Set<Listener>();

function readCodes(): TireCodes {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as TireCodes;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

let codes: TireCodes = readCodes();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(codes));
  } catch {
    // ignore quota / private mode
  }
  listeners.forEach(listener => listener());
}

export const registeredTireStore = {
  /** Stable snapshot — must not allocate a new object per call (useSyncExternalStore). */
  getCodes: (): TireCodes => codes,
  getCode: (slot: TireSlotKey): string | undefined => codes[slot],
  setCode: (slot: TireSlotKey, code: string) => {
    const cleaned = code.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length !== 4) return;
    if (codes[slot] === cleaned) return;
    codes = { ...codes, [slot]: cleaned };
    persist();
  },
  isRegistered: (slot: TireSlotKey): boolean => Boolean(codes[slot]),
  getRegisteredSlots: (): ReadonlySet<TireSlotKey> =>
    new Set(
      (Object.entries(codes) as [TireSlotKey, string | undefined][])
        .filter(([, value]) => Boolean(value))
        .map(([key]) => key),
    ),
  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function formatRecommendedReplaceDate(isoDate: string | null): string {
  if (!isoDate) return '-';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate);
  if (!match) return isoDate;
  return `${match[1]}.${match[2]}.${match[3]}`;
}

/** Demo unlock date shown after a tire DOT is registered. */
export const DEMO_RECOMMENDED_REPLACE_DATE = '2026-11-15';
