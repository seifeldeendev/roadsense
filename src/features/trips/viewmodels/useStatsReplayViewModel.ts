import { useCallback, useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import type { Trip, TripPoint } from '@/domain/entities';
import { getSpeedStatus, type SpeedStatus } from '@/domain/usecases/drive/getSpeedStatus';
import {
  addDays,
  getWeeklyStats,
  startOfWeek,
  type WeeklyStats,
} from '@/domain/usecases/trips/weeklyStats';
import { formatDayTitle } from '@/domain/usecases/trips/groupTripsByDay';
import { useStores } from '@/stores/DependenciesProvider';
import { useSettingsStore } from '@/stores/useSettingsStore';
import type { ReplayRate } from '@/stores/useTripStore';
import { mmss } from './tripFormat';
import {
  buildTripChips,
  buildWeekBars,
  buildWeekTiles,
  weekRangeLabel,
  type StatsTile,
  type TripChip,
  type WeekBar,
} from './statsReplayFormat';

export type ReplayControls = {
  tripLabel: string | null;
  speedKmh: number;
  status: SpeedStatus;
  limitKmh: number;
  progress: number;
  elapsedLabel: string;
  totalLabel: string;
  isPlaying: boolean;
  togglePlay: () => void;
  rate: ReplayRate;
  setRate: (rate: ReplayRate) => void;
  onSeek: (fraction: number) => void;
  canReplayInDrive: boolean;
  replayInDrive: () => void;
};

export type StatsReplayViewModel = {
  isLoading: boolean;
  error: string | null;
  retry: () => Promise<void>;
  hasTrips: boolean;
  weekLabel: string;
  canGoNext: boolean;
  goPrevWeek: () => void;
  goNextWeek: () => void;
  stats: WeeklyStats;
  bars: WeekBar[];
  tiles: StatsTile[];
  chips: TripChip[];
  selectedTripId: string | null;
  selectTrip: (tripId: string) => void;
  controls: ReplayControls;
};

export function useStatsReplayViewModel(initialTripId: string | undefined): StatsReplayViewModel {
  const { useNavigationStore, useTripStore } = useStores();
  const trips = useTripStore((state) => state.trips);
  const isLoading = useTripStore((state) => state.isLoading);
  const error = useTripStore((state) => state.error);
  const load = useTripStore((state) => state.load);
  const loadUnless = useTripStore((state) => state.loadUnless);
  const play = useTripStore((state) => state.play);
  const pause = useTripStore((state) => state.pause);
  const tick = useTripStore((state) => state.tick);
  const replay = useTripStore((state) => state.replay);
  const selectReplayTrip = useTripStore((state) => state.selectReplayTrip);
  const setRate = useTripStore((state) => state.setRate);
  const setDriveRoutePoints = useNavigationStore((state) => state.setDriveRoutePoints);
  const seek = useTripStore((state) => state.seek);
  const amberThresholdPct = useSettingsStore((state) => state.amberThresholdPct);

  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  // Captured once per mount; "now" for title formatting and week navigation.
  const [today] = useState(() => new Date());

  useEffect(() => {
    void loadUnless((state) => state.trips.length > 0);
  }, [loadUnless]);

  // Preselect a trip when the screen was opened with a `replay` param.
  useEffect(() => {
    if (initialTripId === undefined) return;
    if (trips.some((trip) => trip.id === initialTripId)) {
      selectReplayTrip(initialTripId);
    }
  }, [initialTripId, trips, selectReplayTrip]);

  // The replay timer lives here: 1000/rate ms per tick, cleared on pause and on
  // unmount, stopping on its own when the trip reaches the end.
  const isPlaying = replay.isPlaying;
  const rate = replay.rate;
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      tick();
    }, 1000 / rate);
    return () => clearInterval(timer);
  }, [isPlaying, rate, tick]);

  const stats = useMemo(() => getWeeklyStats(trips, weekStart), [trips, weekStart]);
  const bars = useMemo(() => buildWeekBars(stats), [stats]);
  const tiles = useMemo(() => buildWeekTiles(stats), [stats]);
  const chips = useMemo(() => buildTripChips(trips, today), [trips, today]);

  const selectedTrip = useMemo(
    () =>
      replay.tripId === null
        ? null
        : trips.find((trip) => trip.id === replay.tripId) ?? null,
    [trips, replay.tripId],
  );

  const weekLabel = useMemo(() => weekRangeLabel(weekStart), [weekStart]);
  const canGoNext = weekStart.getTime() < startOfWeek(today).getTime();

  const goPrevWeek = useCallback(() => {
    setWeekStart((current) => addDays(current, -7));
  }, []);

  const goNextWeek = useCallback(() => {
    setWeekStart((current) => {
      const currentWeek = startOfWeek(today);
      return current.getTime() < currentWeek.getTime() ? addDays(current, 7) : current;
    });
  }, [today]);

  const selectTrip = useCallback(
    (tripId: string) => {
      selectReplayTrip(tripId);
    },
    [selectReplayTrip],
  );

  const point = selectedTrip?.points[replay.index] ?? null;
  const status = getSpeedStatus(
    point?.speedKmh ?? 0,
    point?.limitKmh ?? 0,
    amberThresholdPct,
  );

  const togglePlay = useCallback(() => {
    if (replay.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [replay.isPlaying, pause, play]);

  const onSeek = useCallback((fraction: number) => {
    const trip = findReplayTrip(replay.tripId, trips);
    if (trip === null || trip.points.length === 0) return;
    const index = Math.round(clamp(fraction, 0, 1) * (trip.points.length - 1));
    seek(index);
  }, [replay.tripId, trips, seek]);

  const replayInDrive = useCallback(() => {
    if (selectedTrip === null) return;
    setDriveRoutePoints(selectedTrip.points);
    router.navigate('/drive');
  }, [selectedTrip, setDriveRoutePoints]);

  const elapsedLabel = selectedTrip === null
    ? mmss(0)
    : mmss(Math.round((pointTs(selectedTrip, replay.index) - pointTs(selectedTrip, 0)) / 1000));
  const totalLabel = selectedTrip === null
    ? mmss(0)
    : mmss(Math.round((pointTs(selectedTrip, Math.max(0, selectedTrip.points.length - 1)) - pointTs(selectedTrip, 0)) / 1000));

  const controls: ReplayControls = {
    tripLabel: selectedTrip === null ? null : formatDayTitle(new Date(selectedTrip.startedAt), today),
    speedKmh: point === null ? 0 : Math.round(point.speedKmh),
    status,
    limitKmh: point?.limitKmh ?? 0,
    progress: selectedTrip === null || selectedTrip.points.length < 2
      ? 0
      : replay.index / (selectedTrip.points.length - 1),
    elapsedLabel,
    totalLabel,
    isPlaying: replay.isPlaying,
    togglePlay,
    rate: replay.rate,
    setRate,
    onSeek,
    canReplayInDrive: selectedTrip !== null,
    replayInDrive,
  };

  return {
    isLoading,
    error,
    retry: load,
    hasTrips: trips.length > 0,
    weekLabel,
    canGoNext,
    goPrevWeek,
    goNextWeek,
    stats,
    bars,
    tiles,
    chips,
    selectedTripId: replay.tripId,
    selectTrip,
    controls,
  };
}

function findReplayTrip(tripId: string | null, trips: readonly Trip[]): Trip | null {
  if (tripId === null) return null;
  return trips.find((trip) => trip.id === tripId) ?? null;
}

function pointTs(trip: Trip, index: number): number {
  const point: TripPoint | undefined = trip.points[index];
  return point?.ts ?? trip.startedAt;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
