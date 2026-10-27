import { act, renderHook } from '@testing-library/react-native';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { useEffect, type ReactNode } from 'react';
import type { Camera, GeoBounds, Hazard, Trip } from '@/domain/entities';
import type { CameraRepository, Geocoder, HazardRepository, LocationSource, TripRepository } from '@/domain/repositories';
import { createDependencies, type Dependencies } from '@/data/dependencies';
import { usePlaceSearch } from '@/features/drive/viewmodels/plannerHooks';
import { useSessionGateViewModel } from '@/features/auth/viewmodels/useSessionGateViewModel';
import { useAlertSettingsViewModel } from '@/features/drive/viewmodels/useAlertSettingsViewModel';
import { CAMERAS_UNAVAILABLE_MESSAGE, useDriveModeViewModel } from '@/features/drive/viewmodels/useDriveModeViewModel';
import { useLiveMapViewModel } from '@/features/map/viewmodels/useLiveMapViewModel';
import { useReportDetailsViewModel } from '@/features/map/viewmodels/useReportDetailsViewModel';
import { useRoutePreviewViewModel } from '@/features/map/viewmodels/useRoutePreviewViewModel';
import { useStatsReplayViewModel } from '@/features/trips/viewmodels/useStatsReplayViewModel';
import { useTripDetailsViewModel } from '@/features/trips/viewmodels/useTripDetailsViewModel';
import { useTripHistoryViewModel } from '@/features/trips/viewmodels/useTripHistoryViewModel';
import { createStores } from '@/stores/createStores';
import { DependenciesProvider, useStores } from '@/stores/DependenciesProvider';
import { fakeCameraRepository } from '../test-support/fakeCameraRepository';

const mockSpeak = jest.fn();
jest.mock('expo-speech', () => ({ speak: (text: string) => mockSpeak(text), stop: () => undefined }));
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
  let releaseHazards: () => void = () => undefined;
  const trips: TripRepository = {
    list: jest.fn(() => new Promise<Trip[]>((resolve) => (releaseTrips = () => resolve([TRIP])))),
    getById: jest.fn(async () => TRIP),
  };
  const hazards: HazardRepository = {
    ...fakeHazards(),
    getActive: jest.fn(() => new Promise<Hazard[]>((resolve) => (releaseHazards = () => resolve([HAZARD])))),
  };
  return { trips, hazards, release: () => (releaseTrips(), releaseHazards()) };
}

const fakeHazards = (): HazardRepository => ({
  getActive: jest.fn(async () => [HAZARD]),
  report: jest.fn(async () => HAZARD),
  vote: jest.fn(async (id: string, stillThere: boolean) => ({ ...HAZARD, id, confirmations: HAZARD.confirmations + (stillThere ? 1 : 0) })),
});

// A test that fails while on fake timers must not leave them (or their
// pending callbacks) to the tests after it.
afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

const wrapperFor = (dependencies: Dependencies) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return <DependenciesProvider dependencies={dependencies}>{children}</DependenciesProvider>;
  };

// Starts the store's load before the screen under test mounts, so the screen
// sees a load already in flight.
function useLoadStarted(kind: 'trips' | 'hazards') {
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
      { wrapper: wrapperFor(createDependencies({ trips: slow.trips, hazards: slow.hazards })) },
    );
    expect(slow.trips.list).toHaveBeenCalledTimes(1);
    await act(async () => slow.release());
  });

  it.each([
    ['trip details', () => useTripDetailsViewModel(TRIP.id)],
    ['route preview', () => useRoutePreviewViewModel()],
  ])('%s: hazards', async (_name, useScreen) => {
    const slow = slowRepositories();
    await renderHook(
      () => {
        useLoadStarted('hazards');
        useScreen();
      },
      { wrapper: wrapperFor(createDependencies({ trips: slow.trips, hazards: slow.hazards })) },
    );
    expect(slow.hazards.getActive).toHaveBeenCalledTimes(1);
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
    const cameras: CameraRepository = fakeCameraRepository([CAMERA]);
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

describe('the planner searches through the injected geocoder', () => {
  it('debounces typing and returns the geocoder results', async () => {
    jest.useFakeTimers();
    const place = { id: 'geo-1', name: 'Cairo Tower', area: 'Zamalek', lat: 30.0459, lng: 31.2243 };
    const geocoder: Geocoder = {
      search: jest.fn(async () => [place]),
      describe: jest.fn(async () => null),
    };
    const { result } = await renderHook(() => usePlaceSearch('Cairo Tow'), {
      wrapper: wrapperFor(createDependencies({ geocoder })),
    });
    expect(geocoder.search).not.toHaveBeenCalled();
    await act(async () => {
      jest.advanceTimersByTime(400);
    });
    expect(geocoder.search).toHaveBeenCalledWith('Cairo Tow');
    expect(result.current).toEqual([place]);
  });
});

describe('the session gate', () => {
  it.each([
    [{ hasCompletedOnboarding: false, user: null }, { canOnboard: true, canSignIn: false, canUseApp: false, startHref: '/onboarding' }],
    [{ hasCompletedOnboarding: true, user: null }, { canOnboard: false, canSignIn: true, canUseApp: false, startHref: '/sign-in' }],
    [
      { hasCompletedOnboarding: true, user: { id: 'u1', name: 'Driver', email: 'd@example.com' } },
      { canOnboard: false, canSignIn: false, canUseApp: true, startHref: '/drive' },
    ],
  ])('opens the right route group for %j', async (session, expected) => {
    const dependencies = createDependencies();
    const stores = createStores(dependencies);
    // Persisted stores rehydrate from the shared mock storage; let that finish first.
    await stores.useSessionStore.persist.rehydrate();
    stores.useSessionStore.setState({ ...session, hasHydrated: true });
    const { result } = await renderHook(() => useSessionGateViewModel(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <DependenciesProvider dependencies={dependencies} stores={stores}>
          {children}
        </DependenciesProvider>
      ),
    });
    expect(result.current.hasHydrated).toBe(true);
    expect(result.current).toMatchObject(expected);
  });

});

describe('one-off camera queries', () => {
  const DEST = { id: 'dest-1', name: 'Dest', area: '', lat: 30.02, lng: 31 };
  const ROUTE = {
    destinationId: 'dest-1',
    points: [
      { lat: 30, lng: 31 },
      { lat: 30.02, lng: 31 },
    ],
    distanceM: 2200,
    durationS: 180,
  };
  const ON_ROUTE: Camera = { ...CAMERA, id: 'cam-on-route', lat: 30.01, lng: 31 };
  const FAR: Camera = { ...CAMERA, id: 'cam-far', lat: 31.2, lng: 29.9 };

  it('route preview stays loading until the cameras in the route box arrive, then lists them', async () => {
    let release: () => void = () => undefined;
    const cameras = fakeCameraRepository([ON_ROUTE, FAR], {
      getInBounds: jest.fn(
        () => new Promise<Camera[]>((resolve) => (release = () => resolve([ON_ROUTE]))),
      ),
    });
    const routes = { getDestinations: jest.fn(async () => [DEST]), getRoute: jest.fn(async () => ROUTE) };
    const { result } = await renderHook(() => useRoutePreviewViewModel(), {
      wrapper: wrapperFor(createDependencies({ cameras, routes, hazards: fakeHazards() })),
    });
    await act(async () => undefined);
    await act(async () => result.current.chooseDestination(DEST.id));

    // The route is fetched but its cameras are not: still loading, no summary yet.
    expect(result.current.route).toBeNull();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.countsLine).toBeNull();

    await act(async () => release());
    expect(result.current.route).toEqual(ROUTE);
    expect(result.current.isLoading).toBe(false);
    const cameraAlerts = result.current.alerts.filter((alert) => alert.kind === 'camera');
    expect(cameraAlerts.map((alert) => alert.refId)).toEqual(['cam-on-route']);
  });

  it('trip details resolves its camera markers by id', async () => {
    const trip: Trip = { ...TRIP, alerts: [{ kind: 'camera', refId: ON_ROUTE.id, ts: 500, distanceM: 300 }] };
    const trips: TripRepository = { list: jest.fn(async () => [trip]), getById: jest.fn(async () => trip) };
    const cameras = fakeCameraRepository([ON_ROUTE, FAR]);
    const { result } = await renderHook(() => useTripDetailsViewModel(trip.id), {
      wrapper: wrapperFor(createDependencies({ trips, cameras, hazards: fakeHazards() })),
    });
    await act(async () => undefined);
    expect(cameras.getByIds).toHaveBeenCalledWith([ON_ROUTE.id]);
    expect(result.current.alertMarkers).toMatchObject([{ kind: 'camera', lat: 30.01, lng: 31, roadName: 'Fake Road' }]);
  });

  it('the alert preview uses the first speed camera', async () => {
    const cameras = fakeCameraRepository([{ ...FAR, type: 'police' }, ON_ROUTE]);
    const { result } = await renderHook(() => useAlertSettingsViewModel(), {
      wrapper: wrapperFor(createDependencies({ cameras })),
    });
    await act(async () => undefined);
    expect(cameras.getFirstSpeedCamera).toHaveBeenCalledTimes(1);
    expect(cameras.getInBounds).not.toHaveBeenCalled();
    expect(result.current.message).toBeNull();
  });
});

describe('cameras around the driver (working set) and around a panned view (query)', () => {
  const withStores = (dependencies: Dependencies) => {
    const stores = createStores(dependencies);
    const wrapper = ({ children }: { children: ReactNode }) => (
      <DependenciesProvider dependencies={dependencies} stores={stores}>
        {children}
      </DependenciesProvider>
    );
    return { stores, wrapper };
  };

  it('a pan away from the working set queries the view and keeps the old markers until it answers', async () => {
    const dependencies = createDependencies({ hazards: fakeHazards() });
    const start = dependencies.location.demoRoute[0];
    const HERE: Camera = { ...CAMERA, id: 'cam-here', lat: start.lat, lng: start.lng };
    // ~55 km north: outside the 12 km working set.
    const THERE: Camera = { ...CAMERA, id: 'cam-there', lat: start.lat + 0.5, lng: start.lng };
    let releasePan: () => void = () => undefined;
    const answer = fakeCameraRepository([HERE, THERE]).getInBounds;
    const cameras = fakeCameraRepository([HERE, THERE], {
      getInBounds: jest.fn((bounds: GeoBounds) =>
        bounds.minLat > start.lat
          ? new Promise<Camera[]>((resolve) => (releasePan = () => void answer(bounds).then(resolve)))
          : answer(bounds),
      ),
    });
    const { wrapper } = withStores({ ...dependencies, cameras });
    const { result } = await renderHook(() => useLiveMapViewModel(), { wrapper });
    await act(async () => undefined);
    expect(result.current.visibleCameras.map((camera) => camera.id)).toEqual(['cam-here']);
    // The working set answered the default view: one fetch, no view query.
    expect(cameras.getInBounds).toHaveBeenCalledTimes(1);

    await act(async () => {
      result.current.onRegionChange({ latitude: THERE.lat, longitude: THERE.lng, latitudeDelta: 0.05, longitudeDelta: 0.05 });
    });
    expect(cameras.getInBounds).toHaveBeenCalledTimes(2);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.visibleCameras.map((camera) => camera.id)).toEqual(['cam-here']);

    await act(async () => releasePan());
    expect(result.current.visibleCameras.map((camera) => camera.id)).toEqual(['cam-there']);
  });
});
