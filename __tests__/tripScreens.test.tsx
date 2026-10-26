// The journey runs in one continuous render, so RNTL must not unmount it between tests.
import '@testing-library/react-native/dont-cleanup-after-each';
import { act, cleanup, fireEvent, screen } from '@testing-library/react-native';
import { afterAll, beforeAll, expect, jest, test } from '@jest/globals';
import { renderRouter, testRouter, type RenderRouterResult } from 'expo-router/testing-library';

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
  const makeNative =
    (testID: string) =>
    (props: { children?: React.ReactNode }) =>
      React.createElement(RN.View, { testID }, props.children);
  return {
    __esModule: true,
    default: makeNative('map-view'),
    Marker: makeNative('map-marker'),
    Polyline: makeNative('map-polyline'),
    PROVIDER_GOOGLE: 'google',
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

const { DEMO_TRIP, MOCK_TRIPS } = require('../src/data/mock/trips');
const { useTripStore } = require('../src/stores/useTripStore');

function clockHHMM(ms: number): string {
  const date = new Date(ms);
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function timeRangeOf(trip: { startedAt: number; endedAt: number }): string {
  return `${clockHHMM(trip.startedAt)} – ${clockHHMM(trip.endedAt)}`;
}

async function advanceVirtualTime(count = 30, stepMs = 200): Promise<void> {
  for (let index = 0; index < count; index += 1) {
    await act(async () => {
      await jest.advanceTimersByTimeAsync(stepMs);
    });
  }
}

let renderResult: RenderRouterResult;

beforeAll(async () => {
  require('../src/stores/useSessionStore').useSessionStore.setState({
    user: { id: 'demo', name: 'Demo', email: 'demo@roadsense.app' },
    hasCompletedOnboarding: true,
    hasHydrated: true,
  });
  renderResult = await renderRouter(
    { appDir: 'src/app', overrides: {} },
    { initialUrl: '/trips' },
  );
  await advanceVirtualTime();
});

afterAll(async () => {
  cleanup();
  await act(async () => {
    await jest.runOnlyPendingTimersAsync();
  });
});

test('the trips tab lists the demo trip and history headline', () => {
  expect(renderResult.getPathname()).toBe('/trips');
  expect(screen.getAllByText('Trips').length).toBeGreaterThan(0);
  expect(screen.getByText('7 drives in the last 14 days')).not.toBeNull();
  expect(screen.getByText(timeRangeOf(DEMO_TRIP))).not.toBeNull();
  expect(screen.getByLabelText(`Open trip ${timeRangeOf(DEMO_TRIP)}, ${(DEMO_TRIP.distanceM / 1000).toFixed(1)} km, ${DEMO_TRIP.overLimitCount} over limit`)).not.toBeNull();
});

test('the over-limit filter narrows the list', async () => {
  expect(screen.getByLabelText(`Open trip ${timeRangeOf(MOCK_TRIPS[2])}, ${(MOCK_TRIPS[2].distanceM / 1000).toFixed(1)} km, within limit`)).not.toBeNull();
  await fireEvent.press(screen.getByLabelText('With over-limit'));
  expect(
    screen.queryByLabelText(/Open trip .*within limit/),
  ).toBeNull();
  await fireEvent.press(screen.getByLabelText('All'));
  expect(screen.getByText(timeRangeOf(MOCK_TRIPS[2]))).not.toBeNull();
});

test('pressing a trip opens its details screen', async () => {
  const overTrip = MOCK_TRIPS[1];
  const card = screen.getByLabelText(
    `Open trip ${timeRangeOf(overTrip)}, ${(overTrip.distanceM / 1000).toFixed(1)} km, ${overTrip.overLimitCount} over limit`,
  );
  await fireEvent.press(card);
  await advanceVirtualTime();
  expect(renderResult.getPathname()).toBe(`/trip/${overTrip.id}`);
  expect(screen.getByLabelText('Replay this trip')).not.toBeNull();
  expect(screen.getByText(`${(overTrip.distanceM / 1000).toFixed(1)} km`)).not.toBeNull();
});

test('the stats tab preselects a replay param and play advances the index', async () => {
  const replayTrip = MOCK_TRIPS[3];
  await testRouter.push(`/stats?replay=${replayTrip.id}`);
  await advanceVirtualTime();
  expect(renderResult.getPathname().split('?')[0]).toBe('/stats');
  expect(useTripStore.getState().replay.tripId).toBe(replayTrip.id);

  const before = useTripStore.getState().replay.index;
  await fireEvent.press(screen.getByLabelText('Play replay'));
  await act(async () => {
    await jest.advanceTimersByTimeAsync(2000);
  });
  expect(useTripStore.getState().replay.index).toBe(before + 2);
  await fireEvent.press(screen.getByLabelText('Pause replay'));
});
