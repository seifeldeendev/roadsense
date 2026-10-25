import type { AlertKind, SoundMode } from '../../entities';

export type AlertFeedback = 'speak' | 'vibrate' | 'none';

// How an approaching alert is announced for the chosen sound mode.
export function alertFeedback(
  soundMode: SoundMode,
  voiceEnabled: boolean,
  kind: AlertKind,
): AlertFeedback {
  switch (soundMode) {
    case 'muted':
      return 'none';
    case 'vibrate':
      return 'vibrate';
    case 'cameras':
      return kind === 'camera' && voiceEnabled ? 'speak' : 'none';
    case 'all':
      return voiceEnabled ? 'speak' : 'none';
  }
}
