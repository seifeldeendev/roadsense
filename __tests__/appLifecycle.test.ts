import { act, renderHook } from '@testing-library/react-native';
import { expect, jest, test } from '@jest/globals';
import { createElement, type ReactNode } from 'react';
import type { AppActivity, AppLifecycle } from '@/domain/repositories';
import { createDependencies } from '@/data/dependencies';
import { useCamerasAround } from '@/stores/cameraHooks';
import { createStores } from '@/stores/createStores';
import { DependenciesProvider } from '@/stores/DependenciesProvider';
import { fakeCameraRepository } from '../test-support/fakeCameraRepository';

jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// The app lifecycle, driven by the test through the Dependencies seam.
function fakeLifecycle() {
  const listeners = new Set<(activity: AppActivity) => void>();
  const lifecycle: AppLifecycle = {
    subscribe: (onChange) => {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
  };
  const emit = (activity: AppActivity) => listeners.forEach((listener) => listener(activity));
  return { lifecycle, emit, listening: () => listeners.size };
}

// ~3.3 km north of the demo start: past the 2 km refetch distance.
const AWAY = (from: { lat: number; lng: number }) => ({ lat: from.lat + 0.03, lng: from.lng });

function setup() {
  const fake = fakeLifecycle();
  const cameras = fakeCameraRepository([]);
  const dependencies = createDependencies({ cameras, lifecycle: fake.lifecycle });
  const stores = createStores(dependencies);
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(DependenciesProvider, { dependencies, stores, children });
  return { ...fake, cameras, stores, wrapper, demoStart: dependencies.location.demoRoute[0] };
}

test('the working set stops following in the background and refetches for where the phone is on return', async () => {
  const { emit, listening, cameras, stores, wrapper, demoStart } = setup();
  const { unmount } = await renderHook(() => useCamerasAround(demoStart, 1_000), { wrapper });
  await act(async () => undefined);
  expect(listening()).toBe(1);
  expect(cameras.getInBounds).toHaveBeenCalledTimes(1);
  expect(stores.useCameraStore.getState().workingSet?.centre).toEqual(demoStart);

  // In the background a new fix arrives: nothing is fetched for it.
  await act(async () => emit('background'));
  await act(async () => stores.useDriveStore.setState({ currentLocation: AWAY(demoStart) }));
  expect(cameras.getInBounds).toHaveBeenCalledTimes(1);

  // Back in the foreground the old position is dropped and the current one is followed.
  await act(async () => emit('active'));
  await act(async () => undefined);
  expect(cameras.getInBounds).toHaveBeenCalledTimes(2);
  expect(stores.useCameraStore.getState().workingSet?.centre).toEqual(AWAY(demoStart));

  await unmount();
  expect(listening()).toBe(0);
});

test('a drive resumed from the background trusts no position until its next reading', async () => {
  const { emit, stores, wrapper, demoStart } = setup();
  await renderHook(() => useCamerasAround(demoStart, 1_000), { wrapper });
  await act(async () => undefined);
  await act(async () => stores.useDriveStore.setState({ isDriving: true, position: demoStart }));
  expect(stores.useCameraStore.getState().followed).toEqual(demoStart);

  await act(async () => emit('background'));
  await act(async () => emit('active'));
  expect(stores.useCameraStore.getState().followed).toBeNull();

  // The next reading is judged by the 2 km rule like any other.
  await act(async () => stores.useDriveStore.setState({ position: AWAY(demoStart) }));
  await act(async () => undefined);
  expect(stores.useCameraStore.getState().followed).toEqual(AWAY(demoStart));
  expect(stores.useCameraStore.getState().workingSet?.centre).toEqual(AWAY(demoStart));
});
