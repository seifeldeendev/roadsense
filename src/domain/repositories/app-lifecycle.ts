import type { Unsubscribe } from './location-source';

// Whether the app is on screen. 'inactive' is the brief state between the two
// (an incoming call, the app switcher).
export type AppActivity = 'active' | 'inactive' | 'background';

// Tells the app when it goes to the background and comes back.
export interface AppLifecycle {
  subscribe(onChange: (activity: AppActivity) => void): Unsubscribe;
}
