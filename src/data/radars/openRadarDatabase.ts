import { Asset } from 'expo-asset';
import { Directory, File } from 'expo-file-system';
import { defaultDatabaseDirectory, openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { RADAR_SEED_VERSION } from './radarSeedVersion';

export const RADAR_DB_NAME = 'radars_eg.db';

// The prebuilt database, shipped as an asset rather than bundled into the JS.
const RADAR_DB_ASSET: number = require('../../../assets/data/radars_eg.db');

// The reads the camera repository needs, so tests can supply any SQLite.
export interface RadarDatabase {
  getAllAsync<T>(sql: string): Promise<T[]>;
  getFirstAsync<T>(sql: string): Promise<T | null>;
}

// Opens the installed radar database, first copying the bundled one into place
// when it is missing or was seeded from different data.
export async function openRadarDatabase(): Promise<RadarDatabase> {
  const directory = new Directory(fileUri(defaultDatabaseDirectory));
  const installed = new File(directory, RADAR_DB_NAME);
  if (installed.exists) {
    const db = await openDatabaseAsync(RADAR_DB_NAME);
    if ((await seedVersionOf(db)) === RADAR_SEED_VERSION) return db;
    await db.closeAsync();
  }
  directory.create({ intermediates: true, idempotent: true });
  const asset = await Asset.fromModule(RADAR_DB_ASSET).downloadAsync();
  if (asset.localUri === null) throw new Error('The radar database asset is unavailable');
  await new File(asset.localUri).copy(installed, { overwrite: true });
  return openDatabaseAsync(RADAR_DB_NAME);
}

async function seedVersionOf(db: SQLiteDatabase): Promise<string | null> {
  try {
    const row = await db.getFirstAsync<{ value: string }>("SELECT value FROM meta WHERE key = 'seed_version'");
    return row?.value ?? null;
  } catch {
    // An empty or damaged copy has no meta table; it gets replaced.
    return null;
  }
}

// expo-sqlite reports a plain path; expo-file-system wants a file URI.
function fileUri(path: string): string {
  return path.startsWith('file://') ? path : `file://${encodeURI(path)}`;
}
