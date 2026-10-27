import type { KeyValueStorage } from '../src/domain/repositories';

// A KeyValueStorage held in memory, so a test can see and seed what a store saves.
export function memoryStorage(initial: Record<string, string> = {}): KeyValueStorage & { saved: Map<string, string> } {
  const saved = new Map(Object.entries(initial));
  return {
    saved,
    getItem: async (key) => saved.get(key) ?? null,
    setItem: async (key, value) => {
      saved.set(key, value);
    },
    removeItem: async (key) => {
      saved.delete(key);
    },
  };
}
