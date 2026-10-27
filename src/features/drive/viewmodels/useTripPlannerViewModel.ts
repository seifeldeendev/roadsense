import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Destination, LatLng, PlannedRoute } from '@/domain/entities';
import { haversineDistanceM } from '@/domain/usecases/drive/geo';
import {
  describeRouteAlerts,
  getAlertsAlongRoute,
  routeAlertBounds,
  type RouteAlert,
} from '@/domain/usecases/routes/getAlertsAlongRoute';
import { formatDistance, formatDuration } from '@/shared/format';
import { useAsyncResult } from '@/shared/useAsyncResult';
import { useDriveStore } from '@/stores/useDriveStore';
import { useDependencies, useStores } from '@/stores/DependenciesProvider';
import { usePlaceSearch, usePinLabel } from './plannerHooks';

export type PlannerMode = 'idle' | 'search' | 'pin' | 'route';
export type PlaceItem = Destination & { distanceLabel: string };
export type PlaceSection = { title: string; kind: 'recent' | 'place'; data: PlaceItem[] };

export type TripPlannerViewModel = {
  mode: PlannerMode;
  query: string;
  setQuery: (text: string) => void;
  originLabel: string;
  sections: PlaceSection[];
  // A few one-tap destinations for the home screen: recent first, then nearest.
  quickPlaces: PlaceItem[];
  pinLabel: string;
  isRouting: boolean;
  routeError: string | null;
  destination: Destination | null;
  route: PlannedRoute | null;
  durationLabel: string;
  detailLabel: string;
  alerts: RouteAlert[];
  openSearch: () => void;
  openPin: () => void;
  onPinMove: (center: LatLng) => void;
  confirmPin: () => void;
  choose: (place: Destination) => void;
  back: () => void;
  close: () => void;
};

const SUGGESTION_COUNT = 6;
const QUICK_PLACE_COUNT = 3;

export function useTripPlannerViewModel(): TripPlannerViewModel {
  const { useCameraStore, useHazardStore, useNavigationStore, useRouteStore, useSettingsStore } = useStores();
  const { location } = useDependencies();
  const [mode, setMode] = useState<PlannerMode>('idle');
  const [query, setQuery] = useState('');
  const [pinCenter, setPinCenter] = useState<LatLng | null>(null);
  const currentLocation = useDriveStore((s) => s.currentLocation);
  const setCurrentLocation = useDriveStore((s) => s.setCurrentLocation);
  const locationSource = useSettingsStore((s) => s.locationSource);
  const { destinations, recent, selected, route: fetchedRoute, isLoading, error } = useRouteStore();
  const loadDestinationsUnless = useRouteStore((s) => s.loadDestinationsUnless);
  const selectDestination = useRouteStore((s) => s.selectDestination);
  const resetSelection = useRouteStore((s) => s.resetSelection);
  const findInBounds = useCameraStore((s) => s.findInBounds);
  // Only cameras in the route's box can be along it. The summary waits for them,
  // so it never reads "nothing on the way" ahead of them.
  const routeCameras = useAsyncResult(fetchedRoute, (current) =>
    findInBounds(routeAlertBounds(current.points)).catch(() => []),
  );
  const route = routeCameras.value === null ? null : fetchedRoute;
  const demoRoute = useNavigationStore((s) => s.demoRoute);
  const showPlannedRoute = useNavigationStore((s) => s.showPlannedRoute);
  const hazards = useHazardStore((s) => s.hazards);

  // Real position when known; the demo start otherwise (demo mode or no fix yet).
  const origin: LatLng = locationSource === 'gps' && currentLocation !== null ? currentLocation : demoRoute[0];
  const originLabel = locationSource === 'gps' && currentLocation !== null ? 'Current location' : 'Demo start · Salah Salem';
  const geoResults = usePlaceSearch(query);
  const pinLabel = usePinLabel(mode === 'pin' ? pinCenter : null);

  useEffect(() => {
    void loadDestinationsUnless((state) => state.destinations.length > 0);
  }, [loadDestinationsUnless]);

  // Only a route chosen here is drawn on the Drive map (Route Preview shares the
  // store), and only real changes count, so mounting doesn't wipe a queued replay.
  const shownRoute = useRef<PlannedRoute | null>(null);
  useEffect(() => {
    const own = mode === 'route' ? fetchedRoute : null;
    if (own === shownRoute.current) return;
    shownRoute.current = own;
    showPlannedRoute(own?.points ?? null);
  }, [mode, fetchedRoute, showPlannedRoute]);

  const sections = useMemo<PlaceSection[]>(() => {
    const withDistance = (place: Destination): PlaceItem => ({
      ...place,
      distanceLabel: formatDistance(haversineDistanceM(origin, place)),
    });
    const q = query.trim().toLowerCase();
    if (q.length === 0) {
      const nearest = [...destinations]
        .sort((a, b) => haversineDistanceM(origin, a) - haversineDistanceM(origin, b))
        .slice(0, SUGGESTION_COUNT);
      return [
        { title: 'Recent', kind: 'recent' as const, data: recent.map(withDistance) },
        { title: 'Suggestions', kind: 'place' as const, data: nearest.map(withDistance) },
      ].filter((section) => section.data.length > 0);
    }
    const matches = destinations.filter(
      (place) => place.name.toLowerCase().includes(q) || place.area.toLowerCase().includes(q),
    );
    return [{ title: 'Results', kind: 'place' as const, data: [...matches, ...geoResults].map(withDistance) }];
  }, [query, destinations, recent, geoResults, origin]);

  const quickPlaces = useMemo<PlaceItem[]>(() => {
    const nearest = [...destinations].sort((a, b) => haversineDistanceM(origin, a) - haversineDistanceM(origin, b));
    const picks = [...recent, ...nearest.filter((place) => !recent.some((r) => r.id === place.id))];
    return picks
      .slice(0, QUICK_PLACE_COUNT)
      .map((place) => ({ ...place, distanceLabel: formatDistance(haversineDistanceM(origin, place)) }));
  }, [destinations, recent, origin]);

  const choose = useCallback(
    (place: Destination) => {
      setQuery('');
      setMode('route');
      void (async () => {
        // A route must start where the driver is: fetch a fix if none has arrived yet.
        let from = origin;
        if (locationSource === 'gps' && currentLocation === null) {
          const fix = (await location.requestPermission()) ? await location.currentPosition() : null;
          if (fix !== null) {
            setCurrentLocation(fix);
            from = fix;
          }
        }
        await selectDestination(place, from);
      })();
    },
    [origin, locationSource, currentLocation, setCurrentLocation, selectDestination, location],
  );

  const confirmPin = useCallback(() => {
    const center = pinCenter ?? origin;
    const [name, area] = pinLabel.includes(' · ') ? pinLabel.split(' · ') : [pinLabel, ''];
    choose({ id: `pin-${center.lat.toFixed(5)},${center.lng.toFixed(5)}`, name, area, ...center });
  }, [pinCenter, pinLabel, origin, choose]);

  const close = useCallback(() => {
    setMode('idle');
    setQuery('');
    resetSelection();
  }, [resetSelection]);

  const alerts = useMemo(
    () => (route === null ? [] : getAlertsAlongRoute(route.points, routeCameras.value ?? [], hazards)),
    [route, routeCameras.value, hazards],
  );

  return {
    mode,
    query,
    setQuery,
    originLabel,
    sections,
    quickPlaces,
    pinLabel,
    isRouting: (isLoading || routeCameras.pending) && selected !== null && route === null,
    routeError: error,
    destination: selected,
    route,
    durationLabel: route === null ? '' : formatDuration(route.durationS),
    detailLabel:
      route === null
        ? ''
        : `${route.estimated === true ? 'Estimated · ' : ''}${formatDistance(route.distanceM)} · ${describeRouteAlerts(alerts)}`,
    alerts,
    openSearch: () => setMode('search'),
    openPin: () => {
      setPinCenter(origin);
      setMode('pin');
    },
    onPinMove: setPinCenter,
    confirmPin,
    choose,
    back: () => setMode((current) => (current === 'pin' ? 'search' : 'idle')),
    close,
  };
}
