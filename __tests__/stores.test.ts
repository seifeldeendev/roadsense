import { describe, expect, it, jest } from '@jest/globals';
import type { Camera, Destination, Hazard, PlannedRoute, Trip, User } from '@/domain/entities';
import type {
  AuthRepository,
  CameraRepository,
  HazardRepository,
  ProfileChanges,
  ReportHazardInput,
  RouteRepository,
  TripRepository,
} from '@/domain/repositories';
import { createHazardStore } from '@/stores/useHazardStore';
import { createRouteStore } from '@/stores/useRouteStore';
import { createSessionStore } from '@/stores/useSessionStore';
import { createTripStore } from '@/stores/useTripStore';

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

const fakeCameras = (cameras: Camera[] = [CAMERA]): CameraRepository => ({ getAll: jest.fn(async () => cameras) });

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
  it('loads cameras and hazards from its repositories', async () => {
    const store = createHazardStore({ cameras: fakeCameras(), hazards: fakeHazards() });
    await store.getState().load();
    expect(store.getState()).toMatchObject({ cameras: [CAMERA], hazards: [HAZARD], isLoading: false, error: null });
  });

  it('turns a failed load into an error message', async () => {
    const hazards = fakeHazards({ getActive: jest.fn(async () => Promise.reject(new Error('offline'))) });
    const store = createHazardStore({ cameras: fakeCameras(), hazards });
    await store.getState().load();
    expect(store.getState()).toMatchObject({ isLoading: false, error: 'offline', cameras: [] });
  });

  it('skips a load when the caller says the state is good enough', async () => {
    const cameras = fakeCameras();
    const store = createHazardStore({ cameras, hazards: fakeHazards() });
    const pending = deferred<Camera[]>();
    (cameras.getAll as jest.Mock<() => Promise<Camera[]>>).mockReturnValueOnce(pending.promise);
    const first = store.getState().loadUnless((state) => state.isLoading);
    await store.getState().loadUnless((state) => state.isLoading);
    expect(cameras.getAll).toHaveBeenCalledTimes(1);
    pending.resolve([CAMERA]);
    await first;
  });

  it('adds a reported hazard and applies a vote', async () => {
    const hazards = fakeHazards();
    const store = createHazardStore({ cameras: fakeCameras(), hazards });
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
