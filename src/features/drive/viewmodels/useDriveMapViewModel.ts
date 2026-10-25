import { useEffect, useMemo, useSyncExternalStore } from 'react';
import type { Camera, Hazard, LatLng, MapType } from '@/domain/entities';
import { fitRouteRegion, type MapFrame } from '@/domain/usecases/drive/fitRegion';
import { nearestRouteIndex } from '@/domain/usecases/drive/nearestRouteIndex';
import { isHazardExpired } from '@/domain/usecases/hazards/isHazardExpired';
import { getCurrentLocation, requestLocationPermission } from '@/services/gps';
import { getDemoRoute, getDriveRoute, subscribeDriveRoute } from '@/services/location';
import { useDriveStore } from '@/stores/useDriveStore';
import { useHazardStore } from '@/stores/useHazardStore';
import { useSettingsStore } from '@/stores/useSettingsStore';

export type DriveMapViewModel = {
  // Empty when no route applies (a GPS drive with nothing planned).
  routePoints: LatLng[];
  routeFrame: MapFrame;
  // What the map frames while not driving: the route, or the driver's real position.
  idleFitCoords: LatLng[];
  currentLocation: LatLng | null;
  cameras: Camera[];
  activeHazards: Hazard[];
  position: LatLng | null;
  heading: number;
  isDriving: boolean;
  travelledIndex: number;
  mapType: MapType;
  showTraffic: boolean;
  northUp: boolean;
};

export function useDriveMapViewModel(): DriveMapViewModel {
  const isDriving = useDriveStore((s) => s.isDriving);
  const position = useDriveStore((s) => s.position);
  const heading = useDriveStore((s) => s.heading);
  const driveSource = useDriveStore((s) => s.driveSource);
  const currentLocation = useDriveStore((s) => s.currentLocation);
  const cameras = useHazardStore((s) => s.cameras);
  const hazards = useHazardStore((s) => s.hazards);
  const mapType = useSettingsStore((s) => s.mapType);
  const showTraffic = useSettingsStore((s) => s.showTraffic);
  const northUp = useSettingsStore((s) => s.northUp);
  const locationSource = useSettingsStore((s) => s.locationSource);

  // Where the driver really is, so the idle map opens there (like any navigation app).
  useEffect(() => {
    if (locationSource !== 'gps' || useDriveStore.getState().currentLocation !== null) return;
    let cancelled = false;
    void (async () => {
      if (!(await requestLocationPermission())) return;
      const location = await getCurrentLocation();
      if (!cancelled && location !== null) useDriveStore.getState().setCurrentLocation(location);
    })();
    return () => {
      cancelled = true;
    };
  }, [locationSource]);

  // The demo route, a trip queued from Stats & Replay, or a route from the planner.
  const driveRoute = useSyncExternalStore(subscribeDriveRoute, getDriveRoute);
  const showsRoute =
    locationSource === 'demo' || driveRoute !== getDemoRoute() || (isDriving && driveSource === 'demo');
  const routePoints = useMemo(() => (showsRoute ? driveRoute : []), [showsRoute, driveRoute]);

  const idleFitCoords = useMemo(() => {
    if (routePoints.length > 0) return routePoints;
    return currentLocation !== null ? [currentLocation] : driveRoute;
  }, [routePoints, currentLocation, driveRoute]);
  const routeFrame = useMemo(() => fitRouteRegion(idleFitCoords), [idleFitCoords]);

  // Re-evaluated whenever the hazard list changes (e.g. a vote expires one).
  const activeHazards = useMemo(
    () => hazards.filter((hazard) => !isHazardExpired(hazard, new Date())),
    [hazards],
  );
  const travelledIndex = useMemo(
    () => (position === null || routePoints.length === 0 ? -1 : nearestRouteIndex(routePoints, position)),
    [routePoints, position],
  );

  return {
    routePoints,
    routeFrame,
    idleFitCoords,
    currentLocation,
    cameras,
    activeHazards,
    position,
    heading,
    isDriving,
    travelledIndex,
    mapType,
    showTraffic,
    northUp,
  };
}
