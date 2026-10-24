import { useCallback, useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import type { Destination, PlannedRoute } from '@/domain/entities';
import type { RouteAlert } from '@/domain/usecases/routes/getAlertsAlongRoute';
import { getAlertsAlongRoute } from '@/domain/usecases/routes/getAlertsAlongRoute';
import { bearingDeg } from '@/domain/usecases/drive/geo';
import { isHazardExpired } from '@/domain/usecases/hazards/isHazardExpired';
import { fitRouteRegion, type MapFrame } from '@/domain/usecases/drive/fitRegion';
import { formatDistance, formatDuration } from '@/shared/format';
import { useHazardStore } from '@/stores/useHazardStore';
import { useRouteStore } from '@/stores/useRouteStore';

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
  const destinations = useRouteStore((s) => s.destinations);
  const selectedDestinationId = useRouteStore((s) => s.selectedDestinationId);
  const route = useRouteStore((s) => s.route);
  const isLoading = useRouteStore((s) => s.isLoading);
  const error = useRouteStore((s) => s.error);
  const loadDestinations = useRouteStore((s) => s.loadDestinations);
  const selectDestination = useRouteStore((s) => s.selectDestination);
  const resetSelection = useRouteStore((s) => s.resetSelection);
  const cameras = useHazardStore((s) => s.cameras);
  const hazards = useHazardStore((s) => s.hazards);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const routeState = useRouteStore.getState();
    if (routeState.destinations.length === 0 && !routeState.isLoading) {
      void routeState.loadDestinations();
    }
    const hazardState = useHazardStore.getState();
    if (hazardState.cameras.length === 0 && hazardState.hazards.length === 0) {
      void hazardState.load();
    }
  }, [loadDestinations]);

  const selectedDestination = useMemo<Destination | null>(
    () => destinations.find((item) => item.id === selectedDestinationId) ?? null,
    [destinations, selectedDestinationId],
  );

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

  const alerts = useMemo<RouteAlert[]>(
    () =>
      route === null ? [] : getAlertsAlongRoute(route.points, cameras, activeHazards),
    [route, cameras, activeHazards],
  );

  const onQueryChange = useCallback(
    (text: string) => {
      setQuery(text);
      if (useRouteStore.getState().selectedDestinationId !== null) {
        resetSelection();
      }
    },
    [resetSelection],
  );

  const chooseDestination = useCallback(
    (id: string) => {
      setQuery('');
      void selectDestination(id);
    },
    [selectDestination],
  );

  const retry = useCallback(() => {
    const state = useRouteStore.getState();
    if (state.error !== null && state.selectedDestinationId !== null) {
      void state.selectDestination(state.selectedDestinationId);
      return;
    }
    void state.loadDestinations();
  }, []);

  const startDrive = useCallback(() => {
    router.navigate('/drive');
  }, []);

  const startHeading =
    route !== null && route.points.length >= START_MARKER_MIN_POINTS
      ? bearingDeg(route.points[0], route.points[1])
      : 0;

  const cameraCount = alerts.filter((alert) => alert.kind === 'camera').length;
  const hazardCount = alerts.length - cameraCount;

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
        : `${formatDistance(route.distanceM)} · ${formatDuration(route.durationS)}`,
    countsLine:
      route === null
        ? null
        : `${cameraCount} camera${cameraCount === 1 ? '' : 's'} · ` +
          `${hazardCount} hazard${hazardCount === 1 ? '' : 's'}`,
    alerts,
    alertsEmpty: route !== null && !isLoading && error === null && alerts.length === 0,
    onQueryChange,
    chooseDestination,
    startDrive,
  };
}
