const WHEEL_SPOKEN: Record<string, string> = {
  FL: 'front left',
  FR: 'front right',
  LO: 'left outer',
  LI: 'left inner',
  RO: 'right outer',
  RI: 'right inner',
};

const WHEEL_CODE_PATTERN = /^(FL|FR|LO|LI|RO|RI)\b/;

export function speakableAlertTitle(title: string): string {
  return title.replace(WHEEL_CODE_PATTERN, match => WHEEL_SPOKEN[match] ?? match);
}

export function buildSpeakableAlertUtterance(title: string, body: string): string {
  const spokenTitle = speakableAlertTitle(title).trim();
  const spokenBody = body.trim();
  if (!spokenTitle) return spokenBody;
  if (!spokenBody) return spokenTitle;
  return `${spokenTitle}. ${spokenBody}`;
}
