import { act, renderHook } from '@testing-library/react-native';
import { expect, jest, test } from '@jest/globals';
import type { ReactNode } from 'react';
import type { Camera, Hazard, LatLng, TripPoint } from '@/domain/entities';
import type { DemoPlayback, LocationSource, LocationSources } from '@/domain/repositories';
import { createDependencies } from '@/data/dependencies';
import { useDriveModeViewModel } from '@/features/drive/viewmodels/useDriveModeViewModel';
import { DependenciesProvider } from '@/stores/DependenciesProvider';
import { useDriveStore } from '@/stores/useDriveStore';
import { createHazardStore } from '@/stores/useHazardStore';
import { useSettingsStore } from '@/stores/useSettingsStore';

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

const fakeCameras = { getAll: () => Promise.resolve([CAMERA]) };
const fakeHazards = {
  getActive: () => Promise.resolve([] as Hazard[]),
  report: () => Promise.reject(new Error('not used')),
  vote: () => Promise.reject(new Error('not used')),
};

test('a store built from fake dependencies loads from them', async () => {
  const useHazards = createHazardStore({ cameras: fakeCameras, hazards: fakeHazards });
  await useHazards.getState().load();
  expect(useHazards.getState().cameras).toEqual([CAMERA]);

  await useHazards.getState().loadUnless((state) => state.cameras.length > 0);
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
    device: () => source,
    demo: (playback: DemoPlayback, _limitFor: (position: LatLng) => number) => {
      playbacks.push(playback);
      return source;
    },
  };
  const dependencies = createDependencies({ cameras: fakeCameras, hazards: fakeHazards, location });
  useSettingsStore.setState({ locationSource: 'demo' });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <DependenciesProvider dependencies={dependencies}>{children}</DependenciesProvider>
  );

  const { result } = await renderHook(() => useDriveModeViewModel(), { wrapper });
  await act(async () => {
    result.current.start();
  });
  expect(playbacks).toEqual([{ kind: 'demo' }]);

  await act(async () => {
    emit?.({ lat: 31.2, lng: 29.9, ts: 0, speedKmh: 42, heading: 0, limitKmh: 60 });
  });
  expect(useDriveStore.getState().speedKmh).toBe(42);
  expect(result.current.speedKmh).toBe(42);

  await act(async () => {
    result.current.stop();
  });
  expect(unwatch).toHaveBeenCalledTimes(1);
});
