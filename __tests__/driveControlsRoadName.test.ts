import { act, renderHook, waitFor } from '@testing-library/react-native';
import { beforeEach, expect, jest, test } from '@jest/globals';
import { createElement, type ReactNode } from 'react';
import type { Camera } from '@/domain/entities';
import { createDependencies } from '@/data/dependencies';
import { useDriveControlsViewModel } from '@/features/drive/viewmodels/useDriveControlsViewModel';
import { createStores } from '@/stores/createStores';
import { DependenciesProvider } from '@/stores/DependenciesProvider';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { fakeCameraRepository } from '../test-support/fakeCameraRepository';

jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const camera = (id: string, lat: number, lng: number, roadName: string): Camera => ({
  id,
  lat,
  lng,
  roadName,
  heading: null,
  speedLimitKmh: 60,
  type: 'fixed',
});

beforeEach(() => {
  useSettingsStore.setState({ locationSource: 'demo', showRoadName: true });
});

test('before a drive, the road name follows the route shown on the drive map', async () => {
  const dependencies = createDependencies({});
  const demoStart = dependencies.location.demoRoute[0];
  const cameras = fakeCameraRepository([
    camera('a', demoStart.lat, demoStart.lng, 'Salah Salem'),
    camera('b', 30.2, 31.5, 'Planned Road'),
  ]);
  const withCameras = { ...dependencies, cameras };
  const stores = createStores(withCameras);
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(DependenciesProvider, { dependencies: withCameras, stores, children });

  const { result } = await renderHook(() => useDriveControlsViewModel(), { wrapper });
  await waitFor(() => expect(result.current.roadName).toBe('Salah Salem'));

  await act(() => {
    stores.useNavigationStore.getState().showPlannedRoute([
      { lat: 30.2, lng: 31.5 },
      { lat: 30.21, lng: 31.5 },
    ]);
  });
  await waitFor(() => expect(result.current.roadName).toBe('Planned Road'));
});
