// The journey runs in one continuous render, so RNTL must not unmount it between tests.
import "@testing-library/react-native/dont-cleanup-after-each";
import { act, cleanup, fireEvent, screen } from '@testing-library/react-native';
import { afterAll, beforeAll, expect, jest, test } from '@jest/globals';
import { renderRouter, testRouter, type RenderRouterResult } from 'expo-router/testing-library';
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

async function advanceVirtualTime(count = 24, stepMs = 250): Promise<void> {
  for (let index = 0; index < count; index += 1) {
    await act(async () => {
      await jest.advanceTimersByTimeAsync(stepMs);
    });
  }
}

let renderResult: RenderRouterResult;

beforeAll(async () => {
  require('../src/stores/useSessionStore').useSessionStore.setState({
    user: null,
    hasCompletedOnboarding: false,
    hasHydrated: true,
  });
  renderResult = await renderRouter(
    { appDir: 'src/app', overrides: {} },
    { initialUrl: '/' },
  );
  await advanceVirtualTime();
});

afterAll(async () => {
  await act(async () => {
    await jest.runOnlyPendingTimersAsync();
  });
  cleanup();
});

test('fresh launch shows the onboarding flow', () => {
  expect(renderResult.getPathname()).toBe('/onboarding');
  expect(screen.queryByText('Know what\u2019s ahead')).not.toBeNull();
});

test('skip lands on sign-in', async () => {
  await fireEvent.press(screen.getByLabelText('Skip onboarding'));
  await advanceVirtualTime();
  expect(renderResult.getPathname()).toBe('/sign-in');
  expect(screen.queryByText('Welcome back')).not.toBeNull();
});

test('demo sign-in lands on the drive tab', async () => {
  await fireEvent.changeText(screen.getByPlaceholderText('you@example.com'), 'demo@roadsense.app');
  await fireEvent.changeText(screen.getByPlaceholderText('Your password'), 'Drive2026');
  await fireEvent.press(screen.getByLabelText('Sign in'));
  await advanceVirtualTime();
  expect(renderResult.getPathname()).toBe('/drive');
});

test('sign out from the Account tab lands back on sign-in with no history back', async () => {
  await testRouter.push('/account');
  await advanceVirtualTime();
  await fireEvent.press(screen.getByLabelText('Sign out'));
  await advanceVirtualTime();
  expect(renderResult.getPathname()).toBe('/sign-in');
  expect(screen.queryByText('Welcome back')).not.toBeNull();
  expect(await testRouter.canGoBack()).toBe(false);
});

test('continue with Google from sign-in lands on the drive tab', async () => {
  await fireEvent.press(screen.getByLabelText('Continue with Google'));
  await advanceVirtualTime();
  expect(renderResult.getPathname()).toBe('/drive');
});
