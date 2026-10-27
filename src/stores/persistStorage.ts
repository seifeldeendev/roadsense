import { createJSONStorage } from 'zustand/middleware';
import type { KeyValueStorage } from '../domain/repositories';

// The JSON layer persisted stores write through, over the storage they are given.
export function persistStorageFor(storage: KeyValueStorage) {
  return createJSONStorage(() => storage);
}
