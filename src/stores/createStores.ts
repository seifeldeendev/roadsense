import type { Dependencies } from '../data/dependencies';
import { createCameraStore } from './useCameraStore';
import { createHazardStore } from './useHazardStore';
import { createNavigationStore } from './useNavigationStore';
import { createRouteStore } from './useRouteStore';
import { createSessionStore } from './useSessionStore';
import { createSettingsStore } from './useSettingsStore';
import { createThemeStore } from './useThemeStore';
import { createTripStore } from './useTripStore';

// The app's stores, built from one set of dependencies.
export type AppStores = {
  useCameraStore: ReturnType<typeof createCameraStore>;
  useHazardStore: ReturnType<typeof createHazardStore>;
  useNavigationStore: ReturnType<typeof createNavigationStore>;
  useRouteStore: ReturnType<typeof createRouteStore>;
  useSessionStore: ReturnType<typeof createSessionStore>;
  useSettingsStore: ReturnType<typeof createSettingsStore>;
  useThemeStore: ReturnType<typeof createThemeStore>;
  useTripStore: ReturnType<typeof createTripStore>;
};

export function createStores(deps: Dependencies): AppStores {
  // Theme first, then settings: each starts reading its saved state when it is
  // created, and the theme must be back before the first paint (the splash waits
  // for the session, read after it). As module singletons the root layout
  // imported the theme before the composition root built the session.
  const useThemeStore = createThemeStore(deps);
  const useSettingsStore = createSettingsStore(deps);
  return {
    useThemeStore,
    useSettingsStore,
    useCameraStore: createCameraStore(deps),
    useHazardStore: createHazardStore(deps),
    useNavigationStore: createNavigationStore(deps.location.demoRoute),
    useRouteStore: createRouteStore(deps),
    useSessionStore: createSessionStore(deps),
    useTripStore: createTripStore(deps),
  };
}
