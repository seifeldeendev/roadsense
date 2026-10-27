import { act, renderHook } from '@testing-library/react-native';
import { expect, jest, test } from '@jest/globals';
import type { ReactNode } from 'react';
import type { Camera, Hazard, LatLng, TripPoint } from '@/domain/entities';
import type { DemoPlayback, LocationSource, LocationSources } from '@/domain/repositories';
import { createDependencies } from '@/data/dependencies';
import { fakeCameraRepository } from '../test-support/fakeCameraRepository';
import { useDriveModeViewModel } from '@/features/drive/viewmodels/useDriveModeViewModel';
import { createStores } from '@/stores/createStores';
import { AppDependenciesProvider } from '@/composition/AppDependenciesProvider';
import { useDriveStore as productionDriveStore } from '@/composition/stores';
import { DependenciesProvider, useStores } from '@/stores/DependenciesProvider';
import { createCameraStore } from '@/stores/useCameraStore';
import { createHazardStore } from '@/stores/useHazardStore';

jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const CAMERA: Camera = {
  id: 'cam-1',
  lat: 30.05,
  lng: 31.3,
  heading: null,
  speedLimitKmh: 60,
  roadName: 'Fake Road',
  type: 'fixed',
};

const fakeCameras = fakeCameraRepository([CAMERA]);
const fakeHazards = {
  getActive: () => Promise.resolve([] as Hazard[]),
  report: () => Promise.reject(new Error('not used')),
  vote: () => Promise.reject(new Error('not used')),
};

test('a store built from fake dependencies loads from them', async () => {
  const useCameras = createCameraStore({ cameras: fakeCameras });
  expect(await useCameras.getState().findInBounds({ minLat: 29, maxLat: 31, minLng: 30, maxLng: 32 })).toEqual([CAMERA]);

  const useHazards = createHazardStore({ hazards: fakeHazards });
  await useHazards.getState().load();
  expect(useHazards.getState().hasLoaded).toBe(true);
  await useHazards.getState().loadUnless((state) => state.hasLoaded);
  expect(useHazards.getState().isLoading).toBe(false);
});

test('Drive Mode plays the location source it is given', async () => {
  let emit: ((point: TripPoint) => void) | null = null;
  const unwatch = jest.fn();
  const source: LocationSource = {
    getCurrent: () => Promise.resolve(null),
    watch: (onPoint) => {
      emit = onPoint;
      return unwatch;
    },
  };
  const playbacks: DemoPlayback[] = [];
  const location: LocationSources = {
    demoRoute: [{ lat: 30.05, lng: 31.3 }],
    requestPermission: async () => true,
    currentPosition: async () => null,
    device: () => source,
    demo: (playback: DemoPlayback, _limitFor: (position: LatLng) => number) => {
      playbacks.push(playback);
      return source;
    },
  };
  const dependencies = createDependencies({ cameras: fakeCameras, hazards: fakeHazards, location });
  const stores = createStores(dependencies);
  // Saved settings load asynchronously; let them land before choosing the demo source.
  await stores.useSettingsStore.persist.rehydrate();
  stores.useSettingsStore.setState({ locationSource: 'demo' });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <DependenciesProvider dependencies={dependencies} stores={stores}>
      {children}
    </DependenciesProvider>
  );

  const { result } = await renderHook(() => useDriveModeViewModel(), { wrapper });
  await act(async () => {
    result.current.start();
  });
  expect(playbacks).toEqual([{ kind: 'demo' }]);

  await act(async () => {
    emit?.({ lat: 31.2, lng: 29.9, ts: 0, speedKmh: 42, heading: 0, limitKmh: 60 });
  });
  expect(stores.useDriveStore.getState().speedKmh).toBe(42);
  expect(result.current.speedKmh).toBe(42);

  await act(async () => {
    result.current.stop();
  });
  expect(unwatch).toHaveBeenCalledTimes(1);
});

// A drive outlives every render, so the store it runs on must be the same object
// for the provider's lifetime, as the module singleton was.
test('the provider builds its stores once: a drive keeps one drive store across re-renders', async () => {
  const dependencies = createDependencies({ cameras: fakeCameras, hazards: fakeHazards });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <DependenciesProvider dependencies={dependencies}>{children}</DependenciesProvider>
  );
  const { result, rerender } = await renderHook(() => useStores(), { wrapper });
  const first = result.current;
  await act(async () => first.useDriveStore.getState().startDrive('demo'));
  await rerender({});
  await rerender({});
  expect(result.current).toBe(first);
  expect(result.current.useDriveStore).toBe(first.useDriveStore);
  expect(result.current.useDriveStore.getState().isDriving).toBe(true);
  await act(async () => first.useDriveStore.getState().stopDrive());
});

test('the app provider hands out the composition root instances', async () => {
  const { result } = await renderHook(() => useStores(), { wrapper: AppDependenciesProvider });
  expect(result.current.useDriveStore).toBe(productionDriveStore);
});
