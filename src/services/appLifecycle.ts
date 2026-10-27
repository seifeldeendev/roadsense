import { AppState } from 'react-native';
import type { AppActivity } from '../domain/repositories';

// The app's foreground/background changes; other states (e.g. 'unknown') are dropped.
export function subscribeToAppActivity(onChange: (activity: AppActivity) => void): () => void {
  const subscription = AppState.addEventListener('change', (state) => {
    if (state === 'active' || state === 'inactive' || state === 'background') onChange(state);
  });
  return () => subscription.remove();
}
