// Account -> Profile -> save runs as one continuous render, so RNTL must not
// unmount between tests.
import "@testing-library/react-native/dont-cleanup-after-each";
import { act, cleanup, fireEvent, screen } from '@testing-library/react-native';
import { afterAll, beforeAll, expect, jest, test } from '@jest/globals';
import { renderRouter } from 'expo-router/testing-library';
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
  };
});
jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: async () => ({ granted: true }),
  requestMediaLibraryPermissionsAsync: async () => ({ granted: true }),
  launchCameraAsync: async () => ({ canceled: true, assets: null }),
  launchImageLibraryAsync: async () => ({ canceled: false, assets: [{ uri: 'file:///picked.jpg' }] }),
}));
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

beforeAll(async () => {
  require('../src/stores/useSessionStore').useSessionStore.setState({
    user: { id: 'user-demo', name: 'Demo Driver', email: 'demo@roadsense.app' },
    hasCompletedOnboarding: true,
    hasHydrated: true,
  });
  await renderRouter({ appDir: 'src/app', overrides: {} }, { initialUrl: '/account' });
  await advanceVirtualTime();
});

afterAll(async () => {
  await act(async () => {
    await jest.runOnlyPendingTimersAsync();
  });
  cleanup();
});

test('the account header opens the profile with the current details', async () => {
  await fireEvent.press(screen.getByLabelText('Edit profile, Demo Driver'));
  await advanceVirtualTime();
  expect(screen.getByDisplayValue('Demo Driver')).toBeTruthy();
  expect(screen.getByDisplayValue('demo@roadsense.app')).toBeTruthy();
});

test('invalid details show errors and are not saved', async () => {
  await fireEvent.changeText(screen.getByDisplayValue('demo@roadsense.app'), 'not-an-email');
  await fireEvent.press(screen.getByLabelText('Save changes'));
  await advanceVirtualTime();
  expect(screen.getByText('Enter a valid email address')).toBeTruthy();
  await fireEvent.changeText(screen.getByDisplayValue('not-an-email'), 'demo@roadsense.app');
});

test('a new photo and name are saved and shown on the account tab', async () => {
  await fireEvent.press(screen.getByLabelText('Change photo'));
  await fireEvent.press(screen.getByLabelText('Choose from library'));
  await advanceVirtualTime();
  await fireEvent.changeText(screen.getByDisplayValue('Demo Driver'), 'Seif Saleem');
  await fireEvent.press(screen.getByLabelText('Save changes'));
  await advanceVirtualTime();
  const { useSessionStore } = require('../src/stores/useSessionStore');
  expect(useSessionStore.getState().user).toMatchObject({ name: 'Seif Saleem', avatarUri: 'file:///picked.jpg' });
  expect(screen.getByLabelText('Edit profile, Seif Saleem')).toBeTruthy();
});
