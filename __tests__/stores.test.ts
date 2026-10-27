import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { Camera, Destination, GeoBounds, Hazard, PlannedRoute, Trip, User } from '@/domain/entities';
import { driveCoverage } from '@/domain/usecases/cameras/workingSet';
import type {
  AuthRepository,
  CameraRepository,
  HazardRepository,
  ProfileChanges,
  ReportHazardInput,
  RouteRepository,
  TripRepository,
} from '@/domain/repositories';
import { CAMERA_QUERY_TIMEOUT_MS, createCameraStore, retryDelayMs } from '@/stores/useCameraStore';
import { createHazardStore } from '@/stores/useHazardStore';
import { createRouteStore } from '@/stores/useRouteStore';
import { createSessionStore } from '@/stores/useSessionStore';
import { createTripStore } from '@/stores/useTripStore';
import { fakeCameraRepository } from '../test-support/fakeCameraRepository';

jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const CAMERA: Camera = {
  id: 'cam-1',
  lat: 30,
  lng: 31,
  heading: null,
  speedLimitKmh: 60,
  roadName: 'Fake Road',
  type: 'fixed',
};

const HAZARD: Hazard = {
  id: 'hz-1',
  type: 'pothole',
  lat: 30,
  lng: 31,
  heading: 0,
  createdAt: '2026-10-27T08:00:00.000Z',
  expiresAt: '2026-10-28T08:00:00.000Z',
  confirmations: 0,
  denials: 0,
  status: 'active',
  reportedBy: 'driver-1',
};

// A promise the test settles by hand, to observe a store mid-flight.
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}


const fakeHazards = (overrides: Partial<HazardRepository> = {}): HazardRepository => ({
  getActive: jest.fn(async () => [HAZARD]),
  report: jest.fn(async (input: ReportHazardInput) => ({ ...HAZARD, id: 'hz-new', type: input.type, lat: input.lat, lng: input.lng })),
  vote: jest.fn(async (id: string, stillThere: boolean) => ({
    ...HAZARD,
    id,
    confirmations: stillThere ? 1 : 0,
    denials: stillThere ? 0 : 1,
  })),
  ...overrides,
});

describe('hazard store', () => {
  it('loads hazards from its repository', async () => {
    const store = createHazardStore({ hazards: fakeHazards() });
    await store.getState().load();
    expect(store.getState()).toMatchObject({ hazards: [HAZARD], hasLoaded: true, isLoading: false, error: null });
  });

  it('turns a failed load into an error message', async () => {
    const hazards = fakeHazards({ getActive: jest.fn(async () => Promise.reject(new Error('offline'))) });
    const store = createHazardStore({ hazards });
    await store.getState().load();
    expect(store.getState()).toMatchObject({ isLoading: false, error: 'offline', hasLoaded: false });
  });

  it('skips a load when the caller says the state is good enough', async () => {
    const hazards = fakeHazards();
    const store = createHazardStore({ hazards });
    const pending = deferred<Hazard[]>();
    (hazards.getActive as jest.Mock<() => Promise<Hazard[]>>).mockReturnValueOnce(pending.promise);
    const first = store.getState().loadUnless((state) => state.isLoading);
    await store.getState().loadUnless((state) => state.isLoading);
    expect(hazards.getActive).toHaveBeenCalledTimes(1);
    pending.resolve([HAZARD]);
    await first;
  });

  it('adds a reported hazard and applies a vote', async () => {
    const hazards = fakeHazards();
    const store = createHazardStore({ hazards });
    await store.getState().load();
    await store.getState().report('accident', 30.1, 31.1, 90);
    expect(hazards.report).toHaveBeenCalledWith({ type: 'accident', lat: 30.1, lng: 31.1, heading: 90 });
    expect(store.getState().hazards.map((h) => h.id)).toEqual(['hz-1', 'hz-new']);

    await store.getState().vote('hz-1', false);
    expect(store.getState().getById('hz-1')?.denials).toBe(1);
  });
});

describe('route store', () => {
  const DEST_A: Destination = { id: 'a', name: 'A', area: '', lat: 30.1, lng: 31.1 };
  const DEST_B: Destination = { id: 'b', name: 'B', area: '', lat: 30.2, lng: 31.2 };
  const route = (destination: Destination): PlannedRoute => ({
    destinationId: destination.id,
    points: [
      { lat: 30, lng: 31 },
      { lat: destination.lat, lng: destination.lng },
    ],
    distanceM: 1000,
    durationS: 100,
  });

  it('ignores a slower route for a destination the user already changed', async () => {
    const slow = deferred<PlannedRoute>();
    const routes: RouteRepository = {
      getDestinations: jest.fn(async () => [DEST_A, DEST_B]),
      getRoute: jest.fn((destination: Destination) =>
        destination.id === 'a' ? slow.promise : Promise.resolve(route(destination)),
      ),
    };
    const store = createRouteStore({ routes });
    const first = store.getState().selectDestination(DEST_A, { lat: 30, lng: 31 });
    await store.getState().selectDestination(DEST_B, { lat: 30, lng: 31 });
    slow.resolve(route(DEST_A));
    await first;
    expect(store.getState().route?.destinationId).toBe('b');
    expect(store.getState().recent.map((d) => d.id)).toEqual(['b', 'a']);
  });

  it('reports a routing failure for the current destination', async () => {
    const routes: RouteRepository = {
      getDestinations: jest.fn(async () => []),
      getRoute: jest.fn(async () => Promise.reject(new Error('No route found'))),
    };
    const store = createRouteStore({ routes });
    await store.getState().selectDestination(DEST_A, { lat: 30, lng: 31 });
    expect(store.getState()).toMatchObject({ route: null, isLoading: false, error: 'No route found' });
  });
});

describe('trip store', () => {
  const trip = (id: string, pointCount: number): Trip => ({
    id,
    startedAt: 0,
    endedAt: pointCount * 1000,
    distanceM: 0,
    durationS: pointCount,
    maxSpeedKmh: 50,
    avgSpeedKmh: 50,
    overLimitCount: 0,
    points: Array.from({ length: pointCount }, (_, i) => ({
      lat: 30,
      lng: 31 + i / 1000,
      ts: i * 1000,
      speedKmh: 50,
      heading: 90,
      limitKmh: 60,
    })),
    alerts: [],
  });

  it('replays a loaded trip: play, tick, seek within bounds, and restart at the end', async () => {
    const trips: TripRepository = { list: jest.fn(async () => [trip('t1', 3)]), getById: jest.fn(async () => undefined) };
    const store = createTripStore({ trips });
    await store.getState().load();
    store.getState().selectReplayTrip('t1');
    store.getState().play();
    store.getState().tick();
    expect(store.getState().replay).toMatchObject({ isPlaying: true, index: 1 });

    store.getState().seek(99);
    expect(store.getState().replay.index).toBe(2);
    store.getState().pause();
    store.getState().play();
    expect(store.getState().replay).toMatchObject({ isPlaying: true, index: 0 });
  });
});

describe('session store', () => {
  const USER: User = { id: 'u1', name: 'Driver', email: 'driver@example.com' };

  it('signs in, updates the profile through the repository, and signs out', async () => {
    const auth: AuthRepository = {
      signIn: jest.fn(async () => USER),
      signUp: jest.fn(async () => USER),
      signInWithProvider: jest.fn(async () => USER),
      updateProfile: jest.fn(async (user: User, changes: ProfileChanges) => ({ ...user, ...changes })),
      signOut: jest.fn(async () => undefined),
    };
    const store = createSessionStore({ auth });
    await store.getState().signIn('driver@example.com', 'secret');
    expect(store.getState().user).toEqual(USER);

    await store.getState().updateProfile({ name: 'Renamed', email: USER.email });
    expect(auth.updateProfile).toHaveBeenCalledWith(USER, { name: 'Renamed', email: USER.email });
    expect(store.getState().user?.name).toBe('Renamed');

    await store.getState().signOut();
    expect(store.getState().user).toBeNull();
  });
});

describe('camera working set', () => {
  const HOME = { lat: 30, lng: 31 };
  // ~1.1 km and ~3.3 km north of HOME: inside and beyond the 2 km refetch distance.
  const NEAR = { lat: 30.01, lng: 31 };
  const FAR = { lat: 30.03, lng: 31 };
  const camerasAt = (where: { lat: number; lng: number }): Camera[] => [{ ...CAMERA, id: `cam-${where.lat}`, ...where }];
  // Answers each box with the cameras at its centre, or with the next queued outcome.
  const repository = () => {
    const outcomes: ('fail' | 'ok')[] = [];
    const cameras: CameraRepository = fakeCameraRepository([], {
      getInBounds: jest.fn(async (bounds: GeoBounds) => {
        if (outcomes.shift() === 'fail') throw new Error('database closed');
        return camerasAt({ lat: (bounds.minLat + bounds.maxLat) / 2, lng: (bounds.minLng + bounds.maxLng) / 2 });
      }),
    });
    return { cameras, outcomes };
  };
  const settle = () => jest.advanceTimersByTimeAsync(0);

  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('fetches around the followed position and again only past the refetch distance', async () => {
    const { cameras } = repository();
    const store = createCameraStore({ cameras });
    store.getState().follow(HOME);
    await settle();
    expect(store.getState().workingSet?.centre).toEqual(HOME);
    store.getState().follow(NEAR);
    await settle();
    expect(cameras.getInBounds).toHaveBeenCalledTimes(1);
    store.getState().follow(FAR);
    await settle();
    expect(cameras.getInBounds).toHaveBeenCalledTimes(2);
    expect(store.getState().workingSet?.centre).toEqual(FAR);
  });

  it('keeps the current set through failures and retries with backoff', async () => {
    const { cameras, outcomes } = repository();
    const store = createCameraStore({ cameras });
    store.getState().follow(HOME);
    await settle();
    const homeSet = store.getState().workingSet;

    outcomes.push('fail', 'fail');
    store.getState().follow(FAR);
    await settle();
    expect(store.getState()).toMatchObject({ workingSet: homeSet, fetchFailed: true });
    await jest.advanceTimersByTimeAsync(999);
    expect(cameras.getInBounds).toHaveBeenCalledTimes(2);
    await jest.advanceTimersByTimeAsync(1);
    expect(cameras.getInBounds).toHaveBeenCalledTimes(3);
    // Second failure: the next try waits twice as long.
    expect(store.getState().workingSet).toBe(homeSet);
    await jest.advanceTimersByTimeAsync(1999);
    expect(cameras.getInBounds).toHaveBeenCalledTimes(3);
    await jest.advanceTimersByTimeAsync(1);
    expect(store.getState()).toMatchObject({ fetchFailed: false, workingSet: { centre: FAR } });
    expect(retryDelayMs(1)).toBe(1000);
    expect(retryDelayMs(6)).toBe(30_000);
    expect(retryDelayMs(20)).toBe(30_000);
  });

  it('starts a drive on an idle set centred within the refetch distance, without fetching', async () => {
    const { cameras } = repository();
    const store = createCameraStore({ cameras });
    store.getState().follow(HOME);
    await settle();
    await expect(store.getState().prepareDrive(NEAR)).resolves.toBe(true);
    expect(cameras.getInBounds).toHaveBeenCalledTimes(1);
  });

  it('fetches before a drive that starts away from the idle set, and reports a failure', async () => {
    const { cameras, outcomes } = repository();
    const store = createCameraStore({ cameras });
    store.getState().follow(HOME);
    await settle();
    // A set is present but centred 3.3 km away: not fresh enough, so it is fetched.
    await expect(store.getState().prepareDrive(FAR)).resolves.toBe(true);
    expect(store.getState().workingSet?.centre).toEqual(FAR);

    outcomes.push('fail');
    const drive = store.getState().prepareDrive(HOME);
    await settle();
    await expect(drive).resolves.toBe(false);
    expect(store.getState().workingSet?.centre).toEqual(FAR);
    // The old set (3.3 km away) still covers a 2 km lookup at HOME; with no set, a failure is unavailable.
    expect(driveCoverage(store.getState().workingSet, HOME, store.getState().fetchFailed, 2_000)).toBe('covered');
    expect(driveCoverage(null, HOME, true, 2_000)).toBe('unavailable');
    expect(driveCoverage(null, HOME, false, 2_000)).toBe('refreshing');
  });

  it('a drive start waits at most one query timeout, even behind a hung fetch for elsewhere', async () => {
    let hang = true;
    const cameras: CameraRepository = fakeCameraRepository([], {
      getInBounds: jest.fn((bounds: GeoBounds) =>
        hang
          ? new Promise<Camera[]>(() => undefined)
          : Promise.resolve(camerasAt({ lat: (bounds.minLat + bounds.maxLat) / 2, lng: (bounds.minLng + bounds.maxLng) / 2 })),
      ),
    });
    const store = createCameraStore({ cameras });
    store.getState().follow(HOME);
    // 4 s into a hung idle fetch, the driver presses Start somewhere else.
    await jest.advanceTimersByTimeAsync(CAMERA_QUERY_TIMEOUT_MS - 1_000);
    let ready: boolean | null = null;
    void store.getState().prepareDrive(FAR).then((value) => (ready = value));
    await jest.advanceTimersByTimeAsync(CAMERA_QUERY_TIMEOUT_MS - 1);
    expect(ready).toBeNull();
    await jest.advanceTimersByTimeAsync(1);
    expect(ready).toBe(false);
    hang = false;
  });

  it('stops in the background and trusts no position from before it on return', async () => {
    const { cameras, outcomes } = repository();
    const store = createCameraStore({ cameras });
    store.getState().follow(HOME);
    await settle();
    outcomes.push('fail');
    store.getState().follow(FAR);
    await settle();
    store.getState().suspend();
    await jest.advanceTimersByTimeAsync(60_000);
    expect(cameras.getInBounds).toHaveBeenCalledTimes(2);
    store.getState().follow(FAR);
    expect(cameras.getInBounds).toHaveBeenCalledTimes(2);

    store.getState().resume();
    expect(store.getState().followed).toBeNull();
    store.getState().follow(FAR);
    await settle();
    expect(store.getState().workingSet?.centre).toEqual(FAR);
  });
});
