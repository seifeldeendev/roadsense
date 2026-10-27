import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { KeyValueStorage } from '../domain/repositories';

// AsyncStorage's web build needs window.localStorage, which does not exist when
// Expo renders web routes in Node; persistence is skipped there instead of crashing.
const noopStorage: KeyValueStorage = {
  getItem: async () => null,
  setItem: async () => undefined,
  removeItem: async () => undefined,
};

const hasStorage = Platform.OS !== 'web' || typeof window !== 'undefined';

// The device's key-value storage for saved app state.
export const deviceStorage: KeyValueStorage = hasStorage ? AsyncStorage : noopStorage;
