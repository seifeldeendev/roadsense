import type { Dependencies } from '../data/dependencies';
import { createHazardStore, useHazardStore } from './useHazardStore';
import { createNavigationStore, useNavigationStore } from './useNavigationStore';
import { createRouteStore, useRouteStore } from './useRouteStore';
import { createSessionStore, useSessionStore } from './useSessionStore';
import { createTripStore, useTripStore } from './useTripStore';

// The stores that depend on the outside world, built from one set of dependencies.
export type AppStores = {
  useHazardStore: typeof useHazardStore;
  useNavigationStore: typeof useNavigationStore;
  useRouteStore: typeof useRouteStore;
  useSessionStore: typeof useSessionStore;
  useTripStore: typeof useTripStore;
};

export function createStores(deps: Dependencies): AppStores {
  return {
    useHazardStore: createHazardStore(deps),
    useNavigationStore: createNavigationStore(deps.location.demoRoute),
    useRouteStore: createRouteStore(deps),
    useSessionStore: createSessionStore(deps),
    useTripStore: createTripStore(deps),
  };
}

// The app-wide instances, shared with code that still imports the stores directly.
export const defaultStores: AppStores = {
  useHazardStore,
  useNavigationStore,
  useRouteStore,
  useSessionStore,
  useTripStore,
};
