import { beforeEach, expect, jest, test } from '@jest/globals';

jest.unmock('../src/data/radars/openRadarDatabase');

type FakeDb = {
  getFirstAsync: jest.Mock<() => Promise<{ value: string } | null>>;
  getAllAsync: jest.Mock<() => Promise<never[]>>;
  closeAsync: jest.Mock<() => Promise<void>>;
};

const mockFs = { installedExists: false, copies: [] as { from: string; to: string; overwrite: boolean }[] };
const mockOpened: FakeDb[] = [];
let mockInstalledVersion: string | null = null;

jest.mock('expo-sqlite', () => ({
  defaultDatabaseDirectory: '/data/app/files/SQLite',
  openDatabaseAsync: jest.fn(async () => {
    const db: FakeDb = {
      getFirstAsync: jest.fn(async () => (mockInstalledVersion === null ? null : { value: mockInstalledVersion })),
      getAllAsync: jest.fn(async () => []),
      closeAsync: jest.fn(async () => undefined),
    };
    mockOpened.push(db);
    return db;
  }),
}));

jest.mock('expo-asset', () => ({
  Asset: { fromModule: () => ({ downloadAsync: async () => ({ localUri: 'file:///bundle/radars_eg.db' }) }) },
}));

jest.mock('expo-file-system', () => {
  class Directory {
    readonly uri: string;
    constructor(path: string) {
      this.uri = path;
    }
    create() {}
  }
  class File {
    readonly uri: string;
    constructor(...parts: (string | { uri: string })[]) {
      this.uri = parts.map((part) => (typeof part === 'string' ? part : part.uri)).join('/');
    }
    get exists() {
      return mockFs.installedExists;
    }
    async copy(to: { uri: string }, options: { overwrite?: boolean } = {}) {
      mockFs.copies.push({ from: this.uri, to: to.uri, overwrite: options.overwrite === true });
    }
  }
  return { Directory, File };
});

jest.mock('../assets/data/radars_eg.db', () => 1, { virtual: true });

// eslint-disable-next-line import/first
import { openRadarDatabase } from '../src/data/radars/openRadarDatabase';
// eslint-disable-next-line import/first
import { RADAR_SEED_VERSION } from '../src/data/radars/radarSeedVersion';

beforeEach(() => {
  mockFs.installedExists = false;
  mockFs.copies = [];
  mockOpened.length = 0;
  mockInstalledVersion = null;
});

test('the first launch copies the bundled database into the SQLite directory', async () => {
  await openRadarDatabase();
  expect(mockFs.copies).toEqual([
    { from: 'file:///bundle/radars_eg.db', to: 'file:///data/app/files/SQLite/radars_eg.db', overwrite: true },
  ]);
});

test('an installed copy with the current seed version is mockOpened without copying', async () => {
  mockFs.installedExists = true;
  mockInstalledVersion = RADAR_SEED_VERSION;
  const db = await openRadarDatabase();
  expect(mockFs.copies).toEqual([]);
  expect(db).toBe(mockOpened[0]);
  expect(mockOpened[0].closeAsync).not.toHaveBeenCalled();
});

test('a copy seeded from older data is closed and replaced', async () => {
  mockFs.installedExists = true;
  mockInstalledVersion = 'older';
  const db = await openRadarDatabase();
  expect(mockOpened[0].closeAsync).toHaveBeenCalledTimes(1);
  expect(mockFs.copies).toHaveLength(1);
  expect(db).toBe(mockOpened[1]);
});
