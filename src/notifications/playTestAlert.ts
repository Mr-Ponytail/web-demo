import type { LocalAlertImageKey } from './displayLocalAlertNotification';
import { displayLocalAlertNotification } from './displayLocalAlertNotification';
import { enqueueAlertSpeech } from './alertSpeechQueue';

export function playTestAlert(
  image: LocalAlertImageKey,
  title: string,
  body: string,
): void {
  displayLocalAlertNotification({ image, title, body }).catch(error => {
    const message =
      error instanceof Error ? error.message : 'Failed to show notification';
    window.alert(`Notification\n\n${message}`);
  });
  enqueueAlertSpeech(title, body);
}
