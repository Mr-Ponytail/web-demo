import { IMG } from '../assets';

export type LocalAlertImageKey = 'caution' | 'danger';

const DEFAULTS: Record<LocalAlertImageKey, { title: string; body: string }> = {
  caution: {
    title: 'Tire Caution',
    body: 'A caution-level tire alert was detected.',
  },
  danger: {
    title: 'Tire Danger',
    body: 'A danger-level tire alert was detected.',
  },
};

const ICONS: Record<LocalAlertImageKey, string> = {
  caution: IMG.statusLog.caution,
  danger: IMG.statusLog.danger,
};

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export async function displayLocalAlertNotification(options: {
  image: LocalAlertImageKey;
  title?: string;
  body?: string;
}): Promise<void> {
  if (!isNotificationSupported()) {
    throw new Error('This browser does not support notifications');
  }

  const granted = await ensureNotificationPermission();
  if (!granted) {
    throw new Error('Notification permission was not granted');
  }

  const defaults = DEFAULTS[options.image];
  const title = options.title ?? defaults.title;
  const body = options.body ?? defaults.body;

  const notification = new Notification(title, {
    body,
    icon: ICONS[options.image],
    tag: `isensor-alert-${options.image}-${Date.now()}`,
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  // Auto-dismiss like a transient alert banner (RN shows persistent until dismissed).
  window.setTimeout(() => notification.close(), 12_000);
}
