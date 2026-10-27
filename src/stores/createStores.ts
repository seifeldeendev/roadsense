import type { Dependencies } from '../data/dependencies';
import { createCameraStore } from './useCameraStore';
import { createHazardStore } from './useHazardStore';
import { createNavigationStore } from './useNavigationStore';
import { createRouteStore } from './useRouteStore';
import { createSessionStore } from './useSessionStore';
import { createTripStore } from './useTripStore';

// The stores that depend on the outside world, built from one set of dependencies.
export type AppStores = {
  useCameraStore: ReturnType<typeof createCameraStore>;
  useHazardStore: ReturnType<typeof createHazardStore>;
  useNavigationStore: ReturnType<typeof createNavigationStore>;
  useRouteStore: ReturnType<typeof createRouteStore>;
  useSessionStore: ReturnType<typeof createSessionStore>;
  useTripStore: ReturnType<typeof createTripStore>;
};

export function createStores(deps: Dependencies): AppStores {
  return {
    useCameraStore: createCameraStore(deps),
    useHazardStore: createHazardStore(deps),
    useNavigationStore: createNavigationStore(deps.location.demoRoute),
    useRouteStore: createRouteStore(deps),
    useSessionStore: createSessionStore(deps),
    useTripStore: createTripStore(deps),
  };
}
