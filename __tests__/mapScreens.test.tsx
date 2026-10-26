// The three map screens run in one continuous render, so RNTL must not unmount
// between tests.
import "@testing-library/react-native/dont-cleanup-after-each";
import { act, cleanup, fireEvent, screen } from '@testing-library/react-native';
import { afterAll, beforeAll, expect, jest, test } from '@jest/globals';
import { renderRouter, testRouter } from 'expo-router/testing-library';
import type React from 'react';

jest.mock('expo-router/native-tabs', () => require('../test-support/nativeTabsMock'));
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
    { initialUrl: '/map' },
  );
  await advanceVirtualTime();
});

afterAll(async () => {
  await act(async () => {
    await jest.runOnlyPendingTimersAsync();
  });
  cleanup();
});

test('live map shows the filter chips and the plan-a-route action', () => {
  expect(renderResult.getPathname()).toBe('/map');
  expect(screen.getByText('All')).toBeTruthy();
  expect(screen.getByText('Cameras')).toBeTruthy();
  expect(screen.getByText('Accidents')).toBeTruthy();
  expect(screen.getByText('Potholes')).toBeTruthy();
  expect(screen.getByText('Checkpoints')).toBeTruthy();
  expect(screen.getByText('Flooding')).toBeTruthy();
  expect(screen.getByLabelText('Plan a route')).toBeTruthy();
});

test('a single-kind filter hides cameras and All restores them', async () => {
  await fireEvent.press(screen.getByText('Potholes'));
  expect(screen.getByText(/^0 road alerts · \d+ hazards? nearby$/)).toBeTruthy();
  await fireEvent.press(screen.getByText('All'));
  expect(screen.getByText(/^[1-9]\d* road alerts? · \d+ hazards? nearby$/)).toBeTruthy();
});

test('report details shows the hazard type and voting updates the count', async () => {
  await testRouter.push('/report/hz-salah-salem-accident');
  await advanceVirtualTime();
  expect(screen.getByText('Accident')).toBeTruthy();
  expect(screen.getAllByText('5').length).toBeGreaterThan(0);
  expect(screen.queryByText('Thanks — vote recorded')).toBeNull();
  await fireEvent.press(screen.getByLabelText('Confirm hazard is still there'));
  await advanceVirtualTime();
  expect(screen.getByText('Thanks — vote recorded')).toBeTruthy();
  expect(screen.getAllByText('6').length).toBeGreaterThan(0);
});

test('unknown report id lands on the not-found state', async () => {
  await testRouter.push('/report/hz-does-not-exist');
  await advanceVirtualTime();
  expect(screen.getByText('Report not found')).toBeTruthy();
  expect(screen.getByLabelText('Go back')).toBeTruthy();
});

test('route preview search finds Cairo Festival City and choosing it shows the summary', async () => {
  await testRouter.push('/route-preview');
  await advanceVirtualTime();
  await fireEvent.changeText(screen.getByLabelText('Search destination'), 'fest');
  expect(screen.getByText('Cairo Festival City')).toBeTruthy();
  await fireEvent.press(screen.getByLabelText('Choose Cairo Festival City'));
  await advanceVirtualTime();
  expect(screen.queryByText(/\d+(\.\d+)? km · (\d+ h )?\d+ min/)).not.toBeNull();
  expect(screen.getByLabelText('Start drive')).toBeTruthy();
});
