import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { IMG } from '../assets';
import { SettingsSubNavBar } from '../components/settings/SettingsSubNavBar';
import type { TireSlotKey } from '../data/tireSlotGrid';
import { registeredTireStore } from '../state/registeredTireStore';
import './EnterDotDateCodePage.css';

const DOT_CODE_LENGTH = 4;

const DOT_DATE_CODE_POSITION_LABELS: Record<TireSlotKey, string> = {
  FL: 'FRONT LEFT',
  FR: 'FRONT RIGHT',
  LI: 'REAR LEFT INNER',
  RI: 'REAR RIGHT INNER',
  LO: 'REAR LEFT OUTER',
  RO: 'REAR RIGHT OUTER',
};

const SLOT_KEYS: TireSlotKey[] = ['FL', 'FR', 'LI', 'RI', 'LO', 'RO'];

function isTireSlotKey(value: string | undefined): value is TireSlotKey {
  return !!value && (SLOT_KEYS as string[]).includes(value);
}

function toDigitArray(code?: string | null): string[] {
  const digits = (code ?? '').replace(/\D/g, '').slice(0, DOT_CODE_LENGTH);
  return Array.from({ length: DOT_CODE_LENGTH }, (_, index) => digits[index] ?? '');
}

export function EnterDotDateCodePage() {
  const navigate = useNavigate();
  const { tireKey: paramKey } = useParams();
  const [searchParams] = useSearchParams();
  const tireKey: TireSlotKey = isTireSlotKey(paramKey) ? paramKey : 'FL';
  const initialCode = searchParams.get('code') ?? undefined;

  const [digits, setDigits] = useState(() => toDigitArray(initialCode));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    setDigits(toDigitArray(initialCode));
  }, [initialCode, tireKey]);

  const code = digits.join('');
  const canSave =
    !isSaving && code.length === DOT_CODE_LENGTH && /^\d{4}$/.test(code);
  const positionLabel = DOT_DATE_CODE_POSITION_LABELS[tireKey];

  const updateDigit = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, DOT_CODE_LENGTH - index).split('');
      const next = [...digits];
      chars.forEach((char, offset) => {
        next[index + offset] = char;
      });
      setDigits(next);
      const focusIndex = Math.min(index + chars.length, DOT_CODE_LENGTH - 1);
      inputRefs.current[focusIndex]?.focus();
      return;
    }

    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    if (cleaned && index < DOT_CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      event.preventDefault();
      const next = [...digits];
      next[index - 1] = '';
      setDigits(next);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    setError(null);
    try {
      await new Promise<void>(resolve => {
        window.setTimeout(resolve, 400);
      });
      registeredTireStore.setCode(tireKey, code);
      navigate(-1);
    } catch {
      setError('Failed to save DOT date code. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="dot-code-page">
      <SettingsSubNavBar
        title="Manage Tire Information"
        onBack={() => navigate(-1)}
        showDivider={false}
      />

      <div className="dot-code-page__body">
        <p className="dot-code-page__position">{positionLabel}</p>
        <h2 className="dot-code-page__heading">Enter DOT Date Code</h2>

        <div className="dot-code-page__digits">
          {digits.map((digit, index) => (
            <label
              key={`dot-digit-${index}`}
              className={
                focusedIndex === index
                  ? 'dot-code-page__digit dot-code-page__digit--on'
                  : 'dot-code-page__digit'
              }
            >
              <input
                ref={el => {
                  inputRefs.current[index] = el;
                }}
                className="dot-code-page__digit-input"
                value={digit}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                aria-label={`DOT digit ${index + 1}`}
                onChange={event => updateDigit(index, event.target.value)}
                onKeyDown={event => handleKeyDown(index, event)}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() =>
                  setFocusedIndex(current => (current === index ? null : current))
                }
              />
            </label>
          ))}
        </div>

        <div className="dot-code-page__guide">
          <div className="dot-code-page__guide-header">
            <p className="dot-code-page__pattern">
              DOT / XXXX / XXX /{' '}
              <span className="dot-code-page__pattern-pill">XXXX</span>
            </p>
            <p className="dot-code-page__guide-desc">
              The DOT date code is the final 4 digits of the tire identification
              number.
            </p>
          </div>
          <img
            className="dot-code-page__guide-img"
            src={IMG.tireNumber}
            alt="Tire DOT date code location"
          />
        </div>
      </div>

      <div className="dot-code-page__footer">
        <div className="dot-code-page__fade" aria-hidden />
        {error ? <p className="dot-code-page__error">{error}</p> : null}
        <button
          type="button"
          className={
            canSave
              ? 'dot-code-page__save dot-code-page__save--on'
              : 'dot-code-page__save'
          }
          disabled={!canSave}
          onClick={handleSave}
        >
          {isSaving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}
