import { useCallback, useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import type { Destination, PlannedRoute } from '@/domain/entities';
import type { RouteAlert } from '@/domain/usecases/routes/getAlertsAlongRoute';
import { describeRouteAlerts, getAlertsAlongRoute, routeAlertBounds } from '@/domain/usecases/routes/getAlertsAlongRoute';
import { bearingDeg } from '@/domain/usecases/drive/geo';
import { isHazardExpired } from '@/domain/usecases/hazards/isHazardExpired';
import { fitRouteRegion, type MapFrame } from '@/domain/usecases/drive/fitRegion';
import { formatDistance, formatDuration } from '@/shared/format';
import { useAsyncResult } from '@/shared/useAsyncResult';
import { useStores } from '@/stores/DependenciesProvider';

const SUGGESTION_LIMIT = 5;
const START_MARKER_MIN_POINTS = 2;

export type RoutePreviewViewModel = {
  isLoading: boolean;
  error: string | null;
  retry: () => void;
  query: string;
  toValue: string;
  suggestions: Destination[];
  selectedDestination: Destination | null;
  route: PlannedRoute | null;
  routeFrame: MapFrame | null;
  startHeading: number;
  startMarkerMinPoints: typeof START_MARKER_MIN_POINTS;
  summaryLine: string | null;
  countsLine: string | null;
  alerts: RouteAlert[];
  alertsEmpty: boolean;
  onQueryChange: (text: string) => void;
  chooseDestination: (id: string) => void;
  startDrive: () => void;
};

export function useRoutePreviewViewModel(): RoutePreviewViewModel {
  const { useCameraStore, useDriveStore, useHazardStore, useNavigationStore, useRouteStore, useSettingsStore } = useStores();
  const findInBounds = useCameraStore((s) => s.findInBounds);
  const destinations = useRouteStore((s) => s.destinations);
  const selected = useRouteStore((s) => s.selected);
  const currentLocation = useDriveStore((s) => s.currentLocation);
  const locationSource = useSettingsStore((s) => s.locationSource);
  const fetchedRoute = useRouteStore((s) => s.route);
  const routeLoading = useRouteStore((s) => s.isLoading);
  const error = useRouteStore((s) => s.error);
  const loadDestinations = useRouteStore((s) => s.loadDestinations);
  const loadDestinationsUnless = useRouteStore((s) => s.loadDestinationsUnless);
  const selectDestination = useRouteStore((s) => s.selectDestination);
  const resetSelection = useRouteStore((s) => s.resetSelection);
  const hazards = useHazardStore((s) => s.hazards);
  const loadHazardsUnless = useHazardStore((s) => s.loadUnless);
  const demoRoute = useNavigationStore((s) => s.demoRoute);
  const showPlannedRoute = useNavigationStore((s) => s.showPlannedRoute);
  const [query, setQuery] = useState('');

  useEffect(() => {
    void loadDestinationsUnless((state) => state.destinations.length > 0 || state.isLoading);
    void loadHazardsUnless((state) => state.hasLoaded || state.hazards.length > 0 || state.isLoading);
  }, [loadDestinationsUnless, loadHazardsUnless]);

  const selectedDestination: Destination | null = selected;
  // Routes start from the real position when known, otherwise the demo start.
  const origin = locationSource === 'gps' && currentLocation !== null ? currentLocation : demoRoute[0];

  const suggestions = useMemo<Destination[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length === 0) return [];
    return destinations
      .filter(
        (item) =>
          item.name.toLowerCase().includes(q) || item.area.toLowerCase().includes(q),
      )
      .slice(0, SUGGESTION_LIMIT);
  }, [destinations, query]);

  const activeHazards = useMemo(
    () => hazards.filter((hazard) => !isHazardExpired(hazard, new Date())),
    [hazards],
  );

  // Only cameras in the route's box can be along it. The route shows once they
  // are known, so the summary never reads "nothing on the way" ahead of them.
  const routeCameras = useAsyncResult(fetchedRoute, (current) =>
    findInBounds(routeAlertBounds(current.points)).catch(() => []),
  );
  const route = routeCameras.value === null ? null : fetchedRoute;
  const isLoading = routeLoading || routeCameras.pending;

  const alerts = useMemo<RouteAlert[]>(
    () =>
      route === null ? [] : getAlertsAlongRoute(route.points, routeCameras.value ?? [], activeHazards),
    [route, routeCameras.value, activeHazards],
  );

  const onQueryChange = useCallback(
    (text: string) => {
      setQuery(text);
      if (selected !== null) {
        resetSelection();
      }
    },
    [selected, resetSelection],
  );

  const chooseDestination = useCallback(
    (id: string) => {
      const destination = destinations.find((item) => item.id === id);
      if (destination === undefined) return;
      setQuery('');
      void selectDestination(destination, origin);
    },
    [destinations, selectDestination, origin],
  );

  const retry = useCallback(() => {
    if (error !== null && selected !== null) {
      void selectDestination(selected, origin);
      return;
    }
    void loadDestinations();
  }, [error, selected, selectDestination, loadDestinations, origin]);

  const startDrive = useCallback(() => {
    // Hand the chosen route to the Drive map before switching to it.
    showPlannedRoute(fetchedRoute?.points ?? null);
    router.navigate('/drive');
  }, [fetchedRoute, showPlannedRoute]);

  const startHeading =
    route !== null && route.points.length >= START_MARKER_MIN_POINTS
      ? bearingDeg(route.points[0], route.points[1])
      : 0;


  return {
    isLoading,
    error,
    retry,
    query,
    toValue: query.length > 0 ? query : (selectedDestination?.name ?? ''),
    suggestions,
    selectedDestination,
    route,
    routeFrame: route === null ? null : fitRouteRegion(route.points),
    startHeading,
    startMarkerMinPoints: START_MARKER_MIN_POINTS,
    summaryLine:
      route === null
        ? null
        : `${formatDistance(route.distanceM)} · ${formatDuration(route.durationS)}${route.estimated === true ? ' · estimated' : ''}`,
    countsLine:
      route === null
        ? null
        : describeRouteAlerts(alerts),
    alerts,
    alertsEmpty: route !== null && !isLoading && error === null && alerts.length === 0,
    onQueryChange,
    chooseDestination,
    startDrive,
  };
}
