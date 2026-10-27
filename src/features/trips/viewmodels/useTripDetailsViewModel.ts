import { useCallback, useEffect, useMemo } from 'react';
import { router } from 'expo-router';
import type {
  AlertEvent,
  AlertKind,
  Camera,
  Hazard,
  HazardType,
  Trip,
} from '@/domain/entities';
import { fitRouteRegion, type MapFrame } from '@/domain/usecases/drive/fitRegion';
import { buildSpeedSegments, type SpeedSegment } from '@/domain/usecases/trips/buildSpeedSegments';
import { summarizeTripEvents, type TripEvent } from '@/domain/usecases/trips/summarizeTripEvents';
import { useHazardStore } from '@/stores/useHazardStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useTripStore } from '@/stores/useTripStore';
import { hhmm } from './tripFormat';

export type TripTile = { label: string; value: string };

export type AlertMarkerModel =
  | { id: string; kind: 'camera'; lat: number; lng: number; roadName: string; speedLimitKmh: number }
  | { id: string; kind: 'hazard'; lat: number; lng: number; hazardType: HazardType };

export type TripDetailsViewModel = {
  isLoading: boolean;
  error: string | null;
  retry: () => Promise<void>;
  trip: Trip | null;
  frame: MapFrame;
  segments: SpeedSegment[];
  tiles: TripTile[];
  eventLines: { id: string; text: string }[];
  alertMarkers: AlertMarkerModel[];
  goBack: () => void;
  replayThisTrip: () => void;
};

export function useTripDetailsViewModel(id: string | undefined): TripDetailsViewModel {
  const trips = useTripStore((state) => state.trips);
  const isLoading = useTripStore((state) => state.isLoading);
  const error = useTripStore((state) => state.error);
  const load = useTripStore((state) => state.load);
  const cameras = useHazardStore((state) => state.cameras);
  const hazards = useHazardStore((state) => state.hazards);
  const loadPins = useHazardStore((state) => state.load);
  const amberThresholdPct = useSettingsStore((state) => state.amberThresholdPct);

  useEffect(() => {
    if (useTripStore.getState().trips.length === 0) void load();
    if (useHazardStore.getState().cameras.length === 0) void loadPins();
  }, [load, loadPins]);

  const trip = useMemo(
    () => trips.find((candidate) => candidate.id === id) ?? null,
    [trips, id],
  );

  const frame = useMemo(() => fitRouteRegion(trip?.points ?? []), [trip]);

  const segments = useMemo(
    () => buildSpeedSegments(trip?.points ?? [], amberThresholdPct),
    [trip, amberThresholdPct],
  );

  const alertMarkers = useMemo<AlertMarkerModel[]>(() => {
    if (trip === null) return [];
    return trip.alerts
      .map((alert) => resolveAlert(alert, cameras, hazards))
      .filter((marker): marker is AlertMarkerModel => marker !== null);
  }, [trip, cameras, hazards]);

  const tiles = useMemo<TripTile[]>(() => {
    if (trip === null) return [];
    return [
      { label: 'Distance', value: `${(trip.distanceM / 1000).toFixed(1)} km` },
      { label: 'Duration', value: `${Math.max(1, Math.round(trip.durationS / 60))} min` },
      { label: 'Max speed', value: `${trip.maxSpeedKmh} km/h` },
      { label: 'Avg speed', value: `${trip.avgSpeedKmh} km/h` },
      { label: 'Over-limit points', value: String(trip.overLimitCount) },
      { label: 'Alerts', value: String(trip.alerts.length) },
    ];
  }, [trip]);

  const eventLines = useMemo(() => {
    if (trip === null) return [];
    return summarizeTripEvents(trip).map((event, index) => ({
      id: `event-${index}`,
      text: eventLineText(event),
    }));
  }, [trip]);

  const goBack = useCallback(() => {
    router.back();
  }, []);

  const replayThisTrip = useCallback(() => {
    if (trip === null) return;
    router.push({ pathname: '/stats', params: { replay: trip.id } });
  }, [trip]);

  return {
    isLoading,
    error,
    retry: load,
    trip,
    frame,
    segments,
    tiles,
    eventLines,
    alertMarkers,
    goBack,
    replayThisTrip,
  };
}

function resolveAlert(
  alert: AlertEvent,
  cameras: Camera[],
  hazards: Hazard[],
): AlertMarkerModel | null {
  if (alert.kind === 'camera') {
    const camera = cameras.find((candidate) => candidate.id === alert.refId);
    if (camera === undefined) return null;
    return {
      id: `${alert.refId}-${alert.ts}`,
      kind: 'camera',
      lat: camera.lat,
      lng: camera.lng,
      roadName: camera.roadName,
      speedLimitKmh: camera.speedLimitKmh,
    };
  }
  const hazard = hazards.find((candidate) => candidate.id === alert.refId);
  if (hazard === undefined) return null;
  return {
    id: `${alert.refId}-${alert.ts}`,
    kind: 'hazard',
    lat: hazard.lat,
    lng: hazard.lng,
    hazardType: hazard.type,
  };
}

function eventLineText(event: TripEvent): string {
  if (event.kind === 'over') {
    return `${hhmm(new Date(event.startTs))} · ${Math.round(event.maxSpeedKmh)} km/h in an ${event.limitKmh} zone`;
  }
  const label = alertLabel(event.refKind);
  return `${hhmm(new Date(event.ts))} · ${label} · ${Math.round(event.distanceM)} m`;
}

function alertLabel(kind: AlertKind): string {
  return kind === 'camera' ? 'Speed camera alert' : 'Hazard alert';
}
