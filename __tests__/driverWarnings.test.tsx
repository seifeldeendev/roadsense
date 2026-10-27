import { act, renderHook } from '@testing-library/react-native';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { ReactNode } from 'react';
import type { Camera, GeoBounds, Hazard, LatLng, TripPoint } from '@/domain/entities';
import type { HazardRepository, LocationSource } from '@/domain/repositories';
import { createDependencies } from '@/data/dependencies';
import {
  CAMERAS_LOADING_MESSAGE,
  CAMERAS_UNAVAILABLE_MESSAGE,
  GPS_LOST_MESSAGE,
  LOCATION_FAILED_MESSAGE,
  useDriveModeViewModel,
  WAITING_FOR_GPS_MESSAGE,
} from '@/features/drive/viewmodels/useDriveModeViewModel';
import { CAMERA_QUERY_TIMEOUT_MS } from '@/stores/useCameraStore';
import { createStores } from '@/stores/createStores';
import { DependenciesProvider } from '@/stores/DependenciesProvider';
import { fakeCameraRepository } from '../test-support/fakeCameraRepository';

const mockSpeak = jest.fn();
jest.mock('expo-speech', () => ({ speak: (text: string) => mockSpeak(text), stop: () => undefined }));
// A camera ahead raises the alert overlay; there is no navigator in a hook test.
jest.mock('expo-router', () => ({ router: { push: () => undefined } }));
jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const START: LatLng = { lat: 30.05, lng: 31.3 };
// North of START by roughly these distances; the set (12 km) covers the drive's
// 2 km alert lookups until the car is 10 km from its centre.
const north = (km: number): LatLng => ({ lat: START.lat + km / 111, lng: START.lng });

const reading = (where: LatLng): TripPoint => ({ ...where, ts: Date.now(), speedKmh: 50, heading: 0, limitKmh: 60 });

// A camera repository whose box queries answer, hang or fail on command.
function cameraRepository() {
  let mode: 'answer' | 'hang' | 'fail' = 'answer';
  const cameras = fakeCameraRepository([], {
    getInBounds: jest.fn((bounds: GeoBounds): Promise<Camera[]> => {
      if (mode === 'hang') return new Promise<Camera[]>(() => undefined);
      if (mode === 'fail') return Promise.reject(new Error('database closed'));
      const centre = { lat: (bounds.minLat + bounds.maxLat) / 2, lng: (bounds.minLng + bounds.maxLng) / 2 };
      return Promise.resolve([{ id: `cam-${centre.lat}`, ...centre, heading: null, speedLimitKmh: 60, roadName: 'R', type: 'fixed' }]);
    }),
  });
  return { cameras, set: (next: typeof mode) => (mode = next) };
}

// A location source the test drives: readings, a start failure, or silence.
function locationSource() {
  let onPoint: ((point: TripPoint) => void) | null = null;
  let onError: ((reason: string) => void) | undefined;
  const source: LocationSource = {
    getCurrent: async () => START,
    watch: (point, error) => {
      onPoint = point;
      onError = error;
      return () => {
        onPoint = null;
      };
    },
  };
  return { source, emit: (where: LatLng) => onPoint?.(reading(where)), fail: (reason: string) => onError?.(reason) };
}

const hazards: HazardRepository = {
  getActive: async () => [] as Hazard[],
  report: () => Promise.reject(new Error('not used')),
  vote: () => Promise.reject(new Error('not used')),
};

// Fresh stores for one test, with the demo source and spoken alerts.
async function storesFor(dependencies: Parameters<typeof createStores>[0]) {
  const stores = createStores(dependencies);
  // Saved settings load asynchronously; let them land before setting the ones under test.
  await stores.useSettingsStore.persist.rehydrate();
  stores.useSettingsStore.setState({ locationSource: 'demo', soundMode: 'all', voiceEnabled: true });
  return stores;
}

async function startDriving(mode: 'answer' | 'hang' | 'fail' = 'answer') {
  const repo = cameraRepository();
  repo.set(mode);
  const location = locationSource();
  const dependencies = createDependencies({
    hazards,
    cameras: repo.cameras,
    location: { ...createDependencies({}).location, demo: () => location.source },
  });
  const stores = await storesFor(dependencies);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <DependenciesProvider dependencies={dependencies} stores={stores}>
      {children}
    </DependenciesProvider>
  );
  const hook = await renderHook(() => useDriveModeViewModel(), { wrapper });
  await act(async () => hook.result.current.start());
  await act(() => jest.advanceTimersByTimeAsync(0));
  return { ...hook, repo, location, stores };
}

// Moves the car and lets any query settle that is going to.
async function driveTo(location: ReturnType<typeof locationSource>, where: LatLng) {
  await act(async () => location.emit(where));
  await act(() => jest.advanceTimersByTimeAsync(0));
}

beforeEach(() => {
  jest.useFakeTimers();
  mockSpeak.mockClear();
});

// Retry and staleness timers must never outlive a test, failed or not.
afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

describe('a camera query that hangs is a failure the driver hears about (F12)', () => {
  it('drive start never waits past the query timeout, and the drive starts warned', async () => {
    const repo = cameraRepository();
    repo.set('hang');
    const location = locationSource();
    const dependencies = createDependencies({
      hazards,
      cameras: repo.cameras,
      location: { ...createDependencies({}).location, demo: () => location.source },
    });
    const stores = await storesFor(dependencies);
    const wrapper = ({ children }: { children: ReactNode }) => (
      <DependenciesProvider dependencies={dependencies} stores={stores}>
        {children}
      </DependenciesProvider>
    );
    const { result } = await renderHook(() => useDriveModeViewModel(), { wrapper });
    await act(async () => result.current.start());
    await act(() => jest.advanceTimersByTimeAsync(CAMERA_QUERY_TIMEOUT_MS - 1));
    expect(result.current.isDriving).toBe(false);

    await act(() => jest.advanceTimersByTimeAsync(1));
    expect(result.current.isDriving).toBe(true);
    expect(result.current.driverWarning).toBe(CAMERAS_UNAVAILABLE_MESSAGE);
    expect(mockSpeak).toHaveBeenCalledWith(CAMERAS_UNAVAILABLE_MESSAGE);
  });

  it('a refetch that hangs mid-drive warns once the car is past what the old set covers', async () => {
    const { result, repo, location } = await startDriving('answer');
    await driveTo(location, START);
    expect(result.current.driverWarning).toBeNull();

    // 3 km on: a refetch starts and hangs; the old set still covers the alerts.
    repo.set('hang');
    await driveTo(location, north(3));
    expect(result.current.driverWarning).toBeNull();
    // It times out into a failure; still covered, so still quiet.
    await act(() => jest.advanceTimersByTimeAsync(CAMERA_QUERY_TIMEOUT_MS));
    await driveTo(location, north(4));
    expect(result.current.driverWarning).toBeNull();

    // 11 km on: past the set, with only failed requests behind it.
    await driveTo(location, north(11));
    expect(result.current.driverWarning).toBe(CAMERAS_UNAVAILABLE_MESSAGE);
    expect(mockSpeak).toHaveBeenCalledWith(CAMERAS_UNAVAILABLE_MESSAGE);
  });

  it('a car that leaves the set while its request is outstanding is warned at once, then told it failed', async () => {
    const { result, repo, location } = await startDriving('answer');
    await driveTo(location, START);
    repo.set('hang');

    await driveTo(location, north(11));
    expect(result.current.driverWarning).toBe(CAMERAS_LOADING_MESSAGE);

    await act(() => jest.advanceTimersByTimeAsync(CAMERA_QUERY_TIMEOUT_MS));
    await driveTo(location, north(11.01));
    expect(result.current.driverWarning).toBe(CAMERAS_UNAVAILABLE_MESSAGE);
    expect(mockSpeak).toHaveBeenCalledWith(CAMERAS_UNAVAILABLE_MESSAGE);
  });

  it('warns the moment the drive starts when the pre-drive fetch fails outright', async () => {
    const { result } = await startDriving('fail');
    expect(result.current.isDriving).toBe(true);
    expect(result.current.driverWarning).toBe(CAMERAS_UNAVAILABLE_MESSAGE);
  });
});

describe('a location feed that fails or stops is never shown as live (F13)', () => {
  it('a watch that fails to start warns and shows no speed', async () => {
    const { result, location } = await startDriving();
    await act(async () => location.fail('Location services are off'));
    expect(result.current.driverWarning).toBe(LOCATION_FAILED_MESSAGE);
    expect(mockSpeak).toHaveBeenCalledWith(LOCATION_FAILED_MESSAGE);
    expect(result.current.speedKmh).toBeNull();
  });

  it('readings that stop turn the speed into a dash and warn the driver', async () => {
    const { result, location } = await startDriving();
    await driveTo(location, START);
    expect(result.current.speedKmh).toBe(50);
    expect(result.current.hasLimit).toBe(true);

    await act(() => jest.advanceTimersByTimeAsync(4_000));
    expect(result.current.driverWarning).toBeNull();
    await act(() => jest.advanceTimersByTimeAsync(2_000));
    expect(result.current.driverWarning).toBe(GPS_LOST_MESSAGE);
    expect(mockSpeak).toHaveBeenCalledWith(GPS_LOST_MESSAGE);
    expect(result.current.speedKmh).toBeNull();
    expect(result.current.hasLimit).toBe(false);

    // A new reading makes it live again.
    await driveTo(location, north(0.1));
    expect(result.current.driverWarning).toBeNull();
    expect(result.current.speedKmh).toBe(50);
  });

  it('a drive that never gets a first reading says it is waiting for GPS', async () => {
    const { result } = await startDriving();
    await act(() => jest.advanceTimersByTimeAsync(6_000));
    expect(result.current.driverWarning).toBe(WAITING_FOR_GPS_MESSAGE);
    expect(result.current.speedKmh).toBeNull();
  });
});
