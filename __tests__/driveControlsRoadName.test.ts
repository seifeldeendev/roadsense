import { act, renderHook } from '@testing-library/react-native';
import { beforeEach, expect, jest, test } from '@jest/globals';
import type { Camera } from '@/domain/entities';
import { useDriveControlsViewModel } from '@/features/drive/viewmodels/useDriveControlsViewModel';
import { AppDependenciesProvider } from '@/composition/AppDependenciesProvider';
import { useHazardStore, useNavigationStore } from '@/composition/stores';
import { useSettingsStore } from '@/stores/useSettingsStore';

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
  useNavigationStore.getState().reset();
  useSettingsStore.setState({ locationSource: 'demo', showRoadName: true });
});

test('before a drive, the road name follows the route shown on the drive map', async () => {
  const demoStart = useNavigationStore.getState().demoRoute[0];
  useHazardStore.setState({
    cameras: [camera('a', demoStart.lat, demoStart.lng, 'Salah Salem'), camera('b', 30.2, 31.5, 'Planned Road')],
  });
  const { result } = await renderHook(() => useDriveControlsViewModel(), { wrapper: AppDependenciesProvider });
  expect(result.current.roadName).toBe('Salah Salem');

  await act(() => {
    useNavigationStore.getState().showPlannedRoute([
      { lat: 30.2, lng: 31.5 },
      { lat: 30.21, lng: 31.5 },
    ]);
  });
  expect(result.current.roadName).toBe('Planned Road');
});
