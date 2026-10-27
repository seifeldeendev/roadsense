import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Camera, Hazard, LatLng, MapType } from '@/domain/entities';
import { fitRouteRegion, type MapFrame } from '@/domain/usecases/drive/fitRegion';
import { DRIVING_MAP_RADIUS_M } from '@/domain/usecases/cameras/cameraRadii';
import { isMinorRegionChange, nearestPoints, pointsInView, regionCenter, viewRadiusM } from '@/domain/usecases/drive/fixedPoints';
import { visibleOnMap } from '@/domain/usecases/drive/mapLayers';
import { nearestRouteIndex } from '@/domain/usecases/drive/nearestRouteIndex';
import { isHazardExpired } from '@/domain/usecases/hazards/isHazardExpired';
import { splitRoute } from '@/domain/usecases/routes/splitRoute';
import { useCamerasAround } from '@/stores/cameraHooks';
import { useDriveStore } from '@/stores/useDriveStore';
import { useDependencies, useStores } from '@/stores/DependenciesProvider';
import { useLatest } from '@/shared/useLatest';

// The road database covers all of Egypt; the map draws only nearby points.
const MAX_MAP_POINTS = 150;
const MAX_IDLE_RADIUS_M = 30_000;
const METRES_PER_DEGREE = 111_000;

export type DriveMapViewModel = {
  // The first cameras for the map are still being looked up.
  isLoading: boolean;
  // The route split at the driver's progress (all of it ahead when not driving);
  // both empty when no route applies (a GPS drive with nothing planned).
  drivenRoute: LatLng[];
  remainingRoute: LatLng[];
  routeFrame: MapFrame;
  // What the map frames while not driving: the route, or the driver's real position.
  idleFitCoords: LatLng[];
  currentLocation: LatLng | null;
  cameras: Camera[];
  activeHazards: Hazard[];
  position: LatLng | null;
  heading: number;
  isDriving: boolean;
  mapType: MapType;
  showTraffic: boolean;
  northUp: boolean;
  // Viewport updates after the user pans or zooms the idle map; driving ignores them.
  onRegionChange: (region: MapFrame) => void;
};

export function useDriveMapViewModel(): DriveMapViewModel {
  const { useHazardStore, useNavigationStore, useSettingsStore } = useStores();
  const { location } = useDependencies();
  const isDriving = useDriveStore((s) => s.isDriving);
  const position = useDriveStore((s) => s.position);
  const heading = useDriveStore((s) => s.heading);
  const driveSource = useDriveStore((s) => s.driveSource);
  const currentLocation = useDriveStore((s) => s.currentLocation);
  const setCurrentLocation = useDriveStore((s) => s.setCurrentLocation);
  const hazards = useHazardStore((s) => s.hazards);
  const mapType = useSettingsStore((s) => s.mapType);
  const showTraffic = useSettingsStore((s) => s.showTraffic);
  const northUp = useSettingsStore((s) => s.northUp);
  const locationSource = useSettingsStore((s) => s.locationSource);
  const hiddenOnMap = useSettingsStore((s) => s.hiddenOnMap);

  // Where the driver really is, so the idle map opens there (like any navigation app).
  useEffect(() => {
    if (locationSource !== 'gps' || currentLocation !== null) return;
    let cancelled = false;
    void (async () => {
      if (!(await location.requestPermission())) return;
      const fix = await location.currentPosition();
      if (!cancelled && fix !== null) setCurrentLocation(fix);
    })();
    return () => {
      cancelled = true;
    };
  }, [locationSource, currentLocation, setCurrentLocation, location]);

  // The demo route, a trip queued from Stats & Replay, or a route from the planner.
  const driveRoute = useNavigationStore((s) => s.driveRoute);
  const demoRoute = useNavigationStore((s) => s.demoRoute);
  const showsRoute =
    locationSource === 'demo' || driveRoute !== demoRoute || (isDriving && driveSource === 'demo');
  const routePoints = useMemo(() => (showsRoute ? driveRoute : []), [showsRoute, driveRoute]);

  const idleFitCoords = useMemo(() => {
    if (routePoints.length > 0) return routePoints;
    return currentLocation !== null ? [currentLocation] : driveRoute;
  }, [routePoints, currentLocation, driveRoute]);
  const routeFrame = useMemo(() => fitRouteRegion(idleFitCoords), [idleFitCoords]);

  // What the idle map is looking at since the last pan/zoom, if the user moved it.
  const [viewport, setViewport] = useState<MapFrame | null>(null);

  // Viewport only shapes the idle map; while driving the vehicle is the centre.
  const onRegionChange = useCallback(
    (region: MapFrame) => {
      if (isDriving) return;
      setViewport((prev) => (isMinorRegionChange(prev, region) ? prev : region));
    },
    [isDriving],
  );

  // Driving: around the vehicle. Idle: whatever the map is framing (panned viewport,
  // or the route/position the map was fitted to).
  const shownArea = useMemo(() => {
    if (isDriving && position !== null) return { center: position, radiusM: DRIVING_MAP_RADIUS_M, viewport: null };
    if (!isDriving && viewport !== null) return { center: regionCenter(viewport), radiusM: viewRadiusM(viewport), viewport };
    const radiusM = Math.min(
      MAX_IDLE_RADIUS_M,
      Math.max(DRIVING_MAP_RADIUS_M, (Math.max(routeFrame.latitudeDelta, routeFrame.longitudeDelta) * METRES_PER_DEGREE) / 2),
    );
    return { center: regionCenter(routeFrame), radiusM, viewport: null };
  }, [isDriving, position, routeFrame, viewport]);
  // The working set around the driver, or a query of a panned or route-framed view.
  const around = useCamerasAround(shownArea.center, shownArea.radiusM);
  const cameras = around.cameras;
  const freshCameras = useMemo(() => {
    if (cameras === null) return null;
    const shown = visibleOnMap(cameras, hiddenOnMap);
    return shownArea.viewport !== null
      ? pointsInView(shown, shownArea.viewport, MAX_MAP_POINTS)
      : nearestPoints(shown, shownArea.center, MAX_MAP_POINTS, shownArea.radiusM);
  }, [cameras, hiddenOnMap, shownArea]);
  // The markers already drawn stay until the new area's cameras arrive.
  const visibleCameras = useLatest(freshCameras);

  // Re-evaluated whenever the hazard list changes (e.g. a vote expires one).
  const activeHazards = useMemo(
    () => visibleOnMap(hazards, hiddenOnMap).filter((hazard) => !isHazardExpired(hazard, new Date())),
    [hazards, hiddenOnMap],
  );
  const travelledIndex = useMemo(
    () => (position === null || routePoints.length === 0 ? -1 : nearestRouteIndex(routePoints, position)),
    [routePoints, position],
  );
  const { travelled: drivenRoute, ahead: remainingRoute } = useMemo(
    () => splitRoute(routePoints, isDriving ? travelledIndex : undefined),
    [routePoints, isDriving, travelledIndex],
  );

  return {
    isLoading: visibleCameras === null && !around.failed,
    drivenRoute,
    remainingRoute,
    routeFrame,
    idleFitCoords,
    currentLocation,
    cameras: visibleCameras ?? [],
    activeHazards,
    position,
    heading,
    isDriving,
    mapType,
    showTraffic,
    northUp,
    onRegionChange,
  };
}
