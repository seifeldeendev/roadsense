import type { Camera, CameraType, GeoBounds } from '../../domain/entities';
import type { CameraRepository } from '../../domain/repositories';
import { SPEED_CAMERA_TYPES } from '../../domain/usecases/drive/fixedPoints';
import { openRadarDatabase, type RadarDatabase } from './openRadarDatabase';

type CameraRow = {
  id: string;
  lat: number;
  lng: number;
  speedLimitKmh: number;
  roadName: string;
  type: CameraType;
};

// Rows keep the order of the source export, matching what the JSON feed produced.
const SELECT = 'SELECT id, lat, lng, speed_limit_kmh AS speedLimitKmh, road_name AS roadName, type FROM cameras';
const IN_ORDER = 'ORDER BY rowid';

const toCamera = (row: CameraRow): Camera => ({ ...row, heading: null });
const placeholders = (count: number) => Array.from({ length: count }, () => '?').join(', ');

// The Egypt road database (radars, police, speed bumps) from the seeded SQLite copy.
export class SqliteRadarCameraRepository implements CameraRepository {
  private database: Promise<RadarDatabase> | null = null;

  constructor(private readonly open: () => Promise<RadarDatabase> = openRadarDatabase) {}

  // Served by the cameras_lat_lng index.
  async getInBounds(bounds: GeoBounds): Promise<Camera[]> {
    const rows = await (await this.db()).getAllAsync<CameraRow>(
      `${SELECT} WHERE lat BETWEEN ? AND ? AND lng BETWEEN ? AND ? ${IN_ORDER}`,
      bounds.minLat,
      bounds.maxLat,
      bounds.minLng,
      bounds.maxLng,
    );
    return rows.map(toCamera);
  }

  async getByIds(ids: readonly string[]): Promise<Camera[]> {
    if (ids.length === 0) return [];
    const rows = await (await this.db()).getAllAsync<CameraRow>(
      `${SELECT} WHERE id IN (${placeholders(ids.length)}) ${IN_ORDER}`,
      ...ids,
    );
    return rows.map(toCamera);
  }

  async getFirstSpeedCamera(): Promise<Camera | null> {
    const row = await (await this.db()).getFirstAsync<CameraRow>(
      `${SELECT} WHERE type IN (${placeholders(SPEED_CAMERA_TYPES.length)}) ${IN_ORDER} LIMIT 1`,
      ...SPEED_CAMERA_TYPES,
    );
    return row === null ? null : toCamera(row);
  }

  // Concurrent first calls share one open (and one copy); a failed open can be retried.
  private db(): Promise<RadarDatabase> {
    this.database ??= this.open().catch((err: unknown) => {
      this.database = null;
      throw err;
    });
    return this.database;
  }
}
