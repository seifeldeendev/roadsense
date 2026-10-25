import { Vibration } from 'react-native';

const ALERT_VIBRATION_MS = 400;

export function vibrateForAlert(): void {
  Vibration.vibrate(ALERT_VIBRATION_MS);
}
