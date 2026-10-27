import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { createJSONStorage, type StateStorage } from 'zustand/middleware';

// AsyncStorage's web build needs window.localStorage, which does not exist when
// Expo renders web routes in Node; persistence is skipped there instead of crashing.
const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

const hasStorage = Platform.OS !== 'web' || typeof window !== 'undefined';

export const persistStorage = createJSONStorage(() => (hasStorage ? AsyncStorage : noopStorage));
