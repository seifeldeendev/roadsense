import { act, renderHook } from '@testing-library/react-native';
import { describe, expect, it, jest } from '@jest/globals';
import { useEffect, type ReactNode } from 'react';
import type { Camera, Hazard, Trip } from '@/domain/entities';
import type { CameraRepository, HazardRepository, TripRepository } from '@/domain/repositories';
import { createDependencies, type Dependencies } from '@/data/dependencies';
import { useReportDetailsViewModel } from '@/features/map/viewmodels/useReportDetailsViewModel';
import { useRoutePreviewViewModel } from '@/features/map/viewmodels/useRoutePreviewViewModel';
import { useStatsReplayViewModel } from '@/features/trips/viewmodels/useStatsReplayViewModel';
import { useTripDetailsViewModel } from '@/features/trips/viewmodels/useTripDetailsViewModel';
import { useTripHistoryViewModel } from '@/features/trips/viewmodels/useTripHistoryViewModel';
import { DependenciesProvider, useStores } from '@/stores/DependenciesProvider';

jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const CAMERA: Camera = { id: 'cam-1', lat: 30, lng: 31, heading: null, speedLimitKmh: 60, roadName: 'Fake Road', type: 'fixed' };
const HAZARD: Hazard = {
  id: 'hz-1',
  type: 'pothole',
  lat: 30.0001,
  lng: 31,
  heading: 0,
  reportedBy: 'driver-1',
  createdAt: new Date(Date.now() - 60_000).toISOString(),
  expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
  confirmations: 2,
  denials: 0,
  status: 'active',
};
const TRIP: Trip = {
  id: 'trip-1',
  startedAt: Date.now() - 600_000,
  endedAt: Date.now() - 300_000,
  distanceM: 5000,
  durationS: 300,
  maxSpeedKmh: 80,
  avgSpeedKmh: 60,
  overLimitCount: 0,
  points: [
    { lat: 30, lng: 31, ts: 0, speedKmh: 50, heading: 0, limitKmh: 60 },
    { lat: 30.01, lng: 31, ts: 1000, speedKmh: 55, heading: 0, limitKmh: 60 },
  ],
  alerts: [],
};

// Repositories that answer only when the test says so, to observe loads in flight.
function slowRepositories() {
  let releaseTrips: () => void = () => undefined;
  let releaseCameras: () => void = () => undefined;
  const trips: TripRepository = {
    list: jest.fn(() => new Promise<Trip[]>((resolve) => (releaseTrips = () => resolve([TRIP])))),
    getById: jest.fn(async () => TRIP),
  };
  const cameras: CameraRepository = {
    getAll: jest.fn(() => new Promise<Camera[]>((resolve) => (releaseCameras = () => resolve([CAMERA])))),
  };
  return { trips, cameras, release: () => (releaseTrips(), releaseCameras()) };
}

const fakeHazards = (): HazardRepository => ({
  getActive: jest.fn(async () => [HAZARD]),
  report: jest.fn(async () => HAZARD),
  vote: jest.fn(async (id: string, stillThere: boolean) => ({ ...HAZARD, id, confirmations: HAZARD.confirmations + (stillThere ? 1 : 0) })),
});

const wrapperFor = (dependencies: Dependencies) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return <DependenciesProvider dependencies={dependencies}>{children}</DependenciesProvider>;
  };

// Starts the store's load before the screen under test mounts, so the screen
// sees a load already in flight.
function useLoadStarted(kind: 'trips' | 'cameras') {
  const { useTripStore, useHazardStore } = useStores();
  const loadTrips = useTripStore((s) => s.load);
  const loadPins = useHazardStore((s) => s.load);
  useEffect(() => {
    void (kind === 'trips' ? loadTrips() : loadPins());
  }, [kind, loadTrips, loadPins]);
}

describe('a screen does not start a second fetch while one is in flight', () => {
  it.each([
    ['trip history', () => useTripHistoryViewModel()],
    ['stats & replay', () => useStatsReplayViewModel(undefined)],
    ['trip details', () => useTripDetailsViewModel(TRIP.id)],
  ])('%s: trips', async (_name, useScreen) => {
    const slow = slowRepositories();
    await renderHook(
      () => {
        useLoadStarted('trips');
        useScreen();
      },
      { wrapper: wrapperFor(createDependencies({ trips: slow.trips, cameras: slow.cameras, hazards: fakeHazards() })) },
    );
    expect(slow.trips.list).toHaveBeenCalledTimes(1);
    await act(async () => slow.release());
  });

  it.each([
    ['trip details', () => useTripDetailsViewModel(TRIP.id)],
    ['route preview', () => useRoutePreviewViewModel()],
  ])('%s: cameras and hazards', async (_name, useScreen) => {
    const slow = slowRepositories();
    await renderHook(
      () => {
        useLoadStarted('cameras');
        useScreen();
      },
      { wrapper: wrapperFor(createDependencies({ trips: slow.trips, cameras: slow.cameras, hazards: fakeHazards() })) },
    );
    expect(slow.cameras.getAll).toHaveBeenCalledTimes(1);
    await act(async () => slow.release());
  });
});

describe('view models read their stores through the provider', () => {
  it('trip history lists the trips the injected repository returns', async () => {
    const trips: TripRepository = { list: jest.fn(async () => [TRIP]), getById: jest.fn(async () => TRIP) };
    const { result } = await renderHook(() => useTripHistoryViewModel(), {
      wrapper: wrapperFor(createDependencies({ trips })),
    });
    await act(async () => undefined);
    expect(trips.list).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(false);
    expect(JSON.stringify(result.current)).toContain(TRIP.id);
  });

  it('report details shows the injected hazard and sends a vote to the repository', async () => {
    const hazards = fakeHazards();
    const cameras: CameraRepository = { getAll: jest.fn(async () => [CAMERA]) };
    const { result } = await renderHook(() => useReportDetailsViewModel(HAZARD.id), {
      wrapper: wrapperFor(createDependencies({ hazards, cameras })),
    });
    await act(async () => undefined);
    expect(result.current.hazard?.id).toBe(HAZARD.id);
    expect(result.current.facts.find((fact) => fact.label === 'Location')?.value).toBe('Fake Road');

    await act(async () => result.current.onVote(true));
    expect(hazards.vote).toHaveBeenCalledWith(HAZARD.id, true);
    expect(result.current.hasVoted).toBe(true);
    expect(result.current.confirmations).toBe(3);
  });
});
