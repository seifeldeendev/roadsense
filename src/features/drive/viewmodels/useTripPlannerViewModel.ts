import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Destination, LatLng, PlannedRoute } from '@/domain/entities';
import { haversineDistanceM } from '@/domain/usecases/drive/geo';
import { describeRouteAlerts, getAlertsAlongRoute, type RouteAlert } from '@/domain/usecases/routes/getAlertsAlongRoute';
import { formatDistance, formatDuration } from '@/shared/format';
import { getCurrentLocation, requestLocationPermission } from '@/services/gps';
import { getDemoRoute, showPlannedRoute } from '@/services/location';
import { useDriveStore } from '@/stores/useDriveStore';
import { useHazardStore } from '@/stores/useHazardStore';
import { useRouteStore } from '@/stores/useRouteStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
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
  const [mode, setMode] = useState<PlannerMode>('idle');
  const [query, setQuery] = useState('');
  const [pinCenter, setPinCenter] = useState<LatLng | null>(null);
  const currentLocation = useDriveStore((s) => s.currentLocation);
  const locationSource = useSettingsStore((s) => s.locationSource);
  const { destinations, recent, selected, route, isLoading, error } = useRouteStore();
  const cameras = useHazardStore((s) => s.cameras);
  const hazards = useHazardStore((s) => s.hazards);

  // Real position when known; the demo start otherwise (demo mode or no fix yet).
  const origin: LatLng = locationSource === 'gps' && currentLocation !== null ? currentLocation : getDemoRoute()[0];
  const originLabel = locationSource === 'gps' && currentLocation !== null ? 'Current location' : 'Demo start · Salah Salem';
  const geoResults = usePlaceSearch(query);
  const pinLabel = usePinLabel(mode === 'pin' ? pinCenter : null);

  useEffect(() => {
    if (useRouteStore.getState().destinations.length === 0) void useRouteStore.getState().loadDestinations();
  }, []);

  // Only a route chosen here is drawn on the Drive map (Route Preview shares the
  // store), and only real changes count, so mounting doesn't wipe a queued replay.
  const shownRoute = useRef<PlannedRoute | null>(null);
  useEffect(() => {
    const own = mode === 'route' ? route : null;
    if (own === shownRoute.current) return;
    shownRoute.current = own;
    showPlannedRoute(own?.points ?? null);
  }, [mode, route]);

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
        if (locationSource === 'gps' && useDriveStore.getState().currentLocation === null) {
          const fix = (await requestLocationPermission()) ? await getCurrentLocation() : null;
          if (fix !== null) {
            useDriveStore.getState().setCurrentLocation(fix);
            from = fix;
          }
        }
        await useRouteStore.getState().selectDestination(place, from);
      })();
    },
    [origin, locationSource],
  );

  const confirmPin = useCallback(() => {
    const center = pinCenter ?? origin;
    const [name, area] = pinLabel.includes(' · ') ? pinLabel.split(' · ') : [pinLabel, ''];
    choose({ id: `pin-${center.lat.toFixed(5)},${center.lng.toFixed(5)}`, name, area, ...center });
  }, [pinCenter, pinLabel, origin, choose]);

  const close = useCallback(() => {
    setMode('idle');
    setQuery('');
    useRouteStore.getState().resetSelection();
  }, []);

  const alerts = useMemo(
    () => (route === null ? [] : getAlertsAlongRoute(route.points, cameras, hazards)),
    [route, cameras, hazards],
  );

  return {
    mode,
    query,
    setQuery,
    originLabel,
    sections,
    quickPlaces,
    pinLabel,
    isRouting: isLoading && selected !== null && route === null,
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
