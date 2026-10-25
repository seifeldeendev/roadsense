// The Drive screen checks run in one continuous render, so RNTL must not unmount
// between tests.
import "@testing-library/react-native/dont-cleanup-after-each";
import { act, cleanup, fireEvent, screen } from '@testing-library/react-native';
import { afterAll, beforeAll, expect, jest, test } from '@jest/globals';
import { renderRouter, testRouter } from 'expo-router/testing-library';
import type React from 'react';

jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('@expo-google-fonts/inter', () => ({
  Inter_400Regular: 'Inter_400Regular',
  Inter_500Medium: 'Inter_500Medium',
  Inter_700Bold: 'Inter_700Bold',
  useFonts: () => [true, null],
}));
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: async () => undefined,
  hideAsync: async () => undefined,
}));
jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
  useVerticalBarEdgeIOS: () => null,
}));
jest.mock('expo-speech', () => ({
  speak: () => undefined,
  stop: () => undefined,
}));
jest.mock('@expo/vector-icons', () => {
  const NullGlyph = () => null;
  return {
    MaterialCommunityIcons: NullGlyph,
    Ionicons: NullGlyph,
    Feather: NullGlyph,
    AntDesign: NullGlyph,
    EvilIcons: NullGlyph,
    Entypo: NullGlyph,
    SimpleLineIcons: NullGlyph,
    FontAwesome: NullGlyph,
    MaterialIcons: NullGlyph,
    Octicons: NullGlyph,
    Zocial: NullGlyph,
    Foundation: NullGlyph,
    Fontisto: NullGlyph,
  };
});
jest.mock('react-native-maps', () => {
  const React = require('react');
  const RN = require('react-native');
  const make =
    (testID: string) =>
    (props: { children?: React.ReactNode; onPress?: unknown; onCalloutPress?: unknown }) => {
      const pressHandlers: { onPress?: () => void } = {};
      if (typeof props.onPress === 'function') {
        pressHandlers.onPress = props.onPress as () => void;
      } else if (typeof props.onCalloutPress === 'function') {
        pressHandlers.onPress = props.onCalloutPress as () => void;
      }
      return React.createElement(RN.View, { testID, ...pressHandlers }, props.children);
    };
  return {
    __esModule: true,
    default: make('map-view'),
    Marker: make('map-marker'),
    Polyline: make('map-polyline'),
    PROVIDER_GOOGLE: 'google',
    PROVIDER_DEFAULT: undefined,
  };
});
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const RN = require('react-native');
  const INSETS = { top: 0, bottom: 0, left: 0, right: 0 };
  const FRAME = { x: 0, y: 0, width: 390, height: 844 };
  const SafeAreaInsetsContext = React.createContext(INSETS);
  const SafeAreaFrameContext = React.createContext(FRAME);
  return {
    SafeAreaProvider: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(
        SafeAreaFrameContext.Provider,
        { value: FRAME },
        React.createElement(SafeAreaInsetsContext.Provider, { value: INSETS }, children),
      ),
    SafeAreaView: (props: { children?: React.ReactNode; style?: unknown }) =>
      React.createElement(RN.View, { style: props.style }, props.children),
    SafeAreaInsetsContext,
    SafeAreaFrameContext,
    initialWindowMetrics: null,
    useSafeAreaInsets: () => React.useContext(SafeAreaInsetsContext),
    useSafeAreaFrame: () => React.useContext(SafeAreaFrameContext),
  };
});

async function advanceVirtualTime(count = 24, stepMs = 250): Promise<void> {
  for (let index = 0; index < count; index += 1) {
    await act(async () => {
      await jest.advanceTimersByTimeAsync(stepMs);
    });
  }
}

let renderResult: { getPathname: () => string };
beforeAll(async () => {
  // Routing falls back to the mock routes, so tests never call the live routing service.
  globalThis.fetch = jest.fn(() => Promise.reject(new Error('offline in tests'))) as unknown as typeof fetch;
  require('../src/stores/useSessionStore').useSessionStore.setState({
    user: { id: 'driver-demo', name: 'Demo driver', email: 'demo@roadsense.app' },
    hasCompletedOnboarding: true,
    hasHydrated: true,
  });
  renderResult = await renderRouter(
    { appDir: 'src/app', overrides: {} },
    { initialUrl: '/drive' },
  );
  await advanceVirtualTime();
});

afterAll(async () => {
  await act(async () => {
    await jest.runOnlyPendingTimersAsync();
  });
  cleanup();
});

test('the drive tab is a full-screen map with the drive CTA and floating controls', () => {
  expect(renderResult.getPathname()).toBe('/drive');
  expect(screen.getByLabelText('Start drive')).toBeTruthy();
  expect(screen.getByLabelText('Where to?')).toBeTruthy();
  expect(screen.getByLabelText('Recentre map')).toBeTruthy();
  expect(screen.getByLabelText('Speed 0 kilometres per hour')).toBeTruthy();
});

test('"New alert" opens the report sheet with the four hazard types', async () => {
  await fireEvent.press(screen.getByLabelText('New alert'));
  for (const label of ['Accident', 'Pothole', 'Checkpoint', 'Flooding']) {
    expect(screen.getByLabelText(`Report ${label}`)).toBeTruthy();
  }
  await fireEvent.press(screen.getByLabelText('Close New alert'));
  expect(screen.queryByLabelText('Report Pothole')).toBeNull();
});

test('choosing "Muted" in the sound menu updates the sound mode', async () => {
  const { useSettingsStore } = require('../src/stores/useSettingsStore');
  expect(useSettingsStore.getState().soundMode).toBe('all');
  await fireEvent.press(screen.getByLabelText('Sound'));
  await fireEvent.press(screen.getByLabelText('Muted'));
  expect(useSettingsStore.getState().soundMode).toBe('muted');
});

test('"Other options" toggles satellite view', async () => {
  const { useSettingsStore } = require('../src/stores/useSettingsStore');
  await fireEvent.press(screen.getByLabelText('Other options'));
  await fireEvent.press(screen.getAllByLabelText('Satellite view')[0]);
  expect(useSettingsStore.getState().mapType).toBe('satellite');
  await fireEvent.press(screen.getByLabelText('Close Map options'));
});

test('"Where to?" plans a route on the same screen, ride-hailing style', async () => {
  await fireEvent.press(screen.getByLabelText('Where to?'));
  expect(screen.getByText('Plan your drive')).toBeTruthy();
  expect(renderResult.getPathname()).toBe('/drive');
  await fireEvent.changeText(screen.getByLabelText('Search destination'), 'fest');
  await fireEvent.press(screen.getByLabelText('Choose Cairo Festival City'));
  await advanceVirtualTime();
  expect(renderResult.getPathname()).toBe('/drive');
  expect(screen.getByText('To Cairo Festival City')).toBeTruthy();
  expect(screen.getByLabelText('Start drive')).toBeTruthy();
  await fireEvent.press(screen.getByLabelText('Clear route'));
  expect(screen.queryByText('To Cairo Festival City')).toBeNull();
});

test('alert settings expose map display and the speed alarm', async () => {
  const { useSettingsStore } = require('../src/stores/useSettingsStore');
  await testRouter.push('/settings/alerts');
  await advanceVirtualTime();
  expect(screen.getByText('Map display')).toBeTruthy();
  await fireEvent.press(screen.getAllByLabelText('Show road name')[0]);
  expect(useSettingsStore.getState().showRoadName).toBe(false);
  await fireEvent.press(screen.getByLabelText('100'));
  expect(useSettingsStore.getState().speedAlarmKmh).toBe(100);
});

test('the alert panel shows the countdown distance and warning progress', async () => {
  const { useDriveStore } = require('../src/stores/useDriveStore');
  useDriveStore.setState({
    activeAlert: {
      kind: 'camera',
      refId: 'cam-test',
      title: 'Speed camera ahead',
      roadName: 'Salah Salem',
      distanceM: 150,
      speedLimitKmh: 80,
    },
  });
  await testRouter.push('/alert');
  await advanceVirtualTime(4);
  expect(screen.getByText('Speed camera ahead')).toBeTruthy();
  expect(screen.getByText('150 m')).toBeTruthy();
  expect(screen.getByLabelText('Warning progress')).toBeTruthy();
});
