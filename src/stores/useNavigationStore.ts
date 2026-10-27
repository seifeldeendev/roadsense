import { create } from 'zustand';
import type { LatLng, TripPoint } from '../domain/entities';
import type { DemoPlayback } from '../domain/repositories';
import { productionDependencies } from '../data/dependencies';

interface NavigationState {
  // The recorded demo drive path; the fallback for driveRoute and the demo start.
  demoRoute: LatLng[];
  // The route Drive Mode is about to play or is playing, so the map can draw it.
  // It only changes identity when the route does.
  driveRoute: LatLng[];
  // The route chosen in a planner; a demo drive follows it instead of the demo.
  plannedRoute: LatLng[] | null;
  // A trip replay queued for the next demo drive.
  pendingRoutePoints: TripPoint[] | null;
  // Queues a trip replay for the next drive and shows it; null restores the demo.
  setDriveRoutePoints(points: TripPoint[] | null): void;
  // Shows a planned route on the Drive map without replaying it; null restores the demo.
  showPlannedRoute(points: LatLng[] | null): void;
  // What the next demo drive plays. Consumes a queued replay, and puts the demo
  // route back on the map when nothing else is chosen.
  takeDemoPlayback(): DemoPlayback;
  reset(): void;
}

export function createNavigationStore(demoRoute: LatLng[]) {
  const initial = { demoRoute, driveRoute: demoRoute, plannedRoute: null, pendingRoutePoints: null };
  return create<NavigationState>()((set, get) => ({
    ...initial,
    setDriveRoutePoints: (points) =>
      set((state) => ({
        pendingRoutePoints: points,
        // A replay replaces any planned route.
        plannedRoute: points !== null ? null : state.plannedRoute,
        driveRoute: points === null ? demoRoute : points.map(({ lat, lng }) => ({ lat, lng })),
      })),
    showPlannedRoute: (points) => set({ plannedRoute: points, driveRoute: points ?? demoRoute }),
    takeDemoPlayback: () => {
      const { pendingRoutePoints, plannedRoute, driveRoute } = get();
      if (pendingRoutePoints !== null) {
        set({ pendingRoutePoints: null });
        return { kind: 'replay', points: pendingRoutePoints };
      }
      if (plannedRoute !== null) return { kind: 'planned', route: plannedRoute };
      if (driveRoute !== demoRoute) set({ driveRoute: demoRoute });
      return { kind: 'demo' };
    },
    reset: () => set(initial),
  }));
}

export const useNavigationStore = createNavigationStore(productionDependencies.location.demoRoute);
