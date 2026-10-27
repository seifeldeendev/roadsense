import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  Camera,
  Hazard,
  Settings,
  Trip,
} from '../../domain/entities';
import type {
  CameraRepository,
  HazardRepository,
  ReportHazardInput,
  SettingsRepository,
  TripRepository,
} from '../../domain/repositories';
import { applyVote } from '../../domain/usecases/hazards/applyVote';
import { DEFAULT_SETTINGS, HAZARD_TTL_MS } from '../../shared/constants';
import { MOCK_CAMERAS } from './cameras';
import { MOCK_HAZARDS } from './hazards';
import { DEMO_TRIP } from './trips';

const REPO_DELAY_MS = 400;
const SETTINGS_KEY = 'roadsense.settings';

const delay = (): Promise<void> =>
  new Promise<void>((resolve) => setTimeout(resolve, REPO_DELAY_MS));

export class MockCameraRepository implements CameraRepository {
  async getAll(): Promise<Camera[]> {
    await delay();
    return MOCK_CAMERAS.map((camera) => ({ ...camera }));
  }
}

export class MockHazardRepository implements HazardRepository {
  private items: Hazard[];

  constructor(initial: Hazard[] = MOCK_HAZARDS) {
    this.items = initial.map((hazard) => ({ ...hazard }));
  }

  async getActive(): Promise<Hazard[]> {
    await delay();
    return this.items
      .filter((hazard) => hazard.status === 'active')
      .map((hazard) => ({ ...hazard }));
  }

  async report(input: ReportHazardInput): Promise<Hazard> {
    await delay();
    const now = new Date();
    const hazard: Hazard = {
      id: `hz-${input.type}-${now.getTime()}`,
      type: input.type,
      lat: input.lat,
      lng: input.lng,
      heading: input.heading,
      reportedBy: 'driver',
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + HAZARD_TTL_MS[input.type]).toISOString(),
      confirmations: 0,
      denials: 0,
      status: 'active',
    };
    this.items.push(hazard);
    return { ...hazard };
  }

  async vote(hazardId: string, stillThere: boolean): Promise<Hazard> {
    await delay();
    const index = this.items.findIndex((hazard) => hazard.id === hazardId);
    if (index === -1) {
      throw new Error(`Hazard ${hazardId} not found`);
    }
    this.items[index] = applyVote(this.items[index], stillThere, new Date());
    return { ...this.items[index] };
  }
}

export class MockTripRepository implements TripRepository {
  async list(): Promise<Trip[]> {
    await delay();
    return [{ ...DEMO_TRIP, points: [...DEMO_TRIP.points] }];
  }

  async getById(id: string): Promise<Trip | undefined> {
    await delay();
    return DEMO_TRIP.id === id
      ? { ...DEMO_TRIP, points: [...DEMO_TRIP.points] }
      : undefined;
  }
}

export class MockSettingsRepository implements SettingsRepository {
  async load(): Promise<Settings> {
    await delay();
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (raw === null) return DEFAULT_SETTINGS;
    try {
      const parsed = JSON.parse(raw) as Partial<Settings>;
      return { ...DEFAULT_SETTINGS, ...parsed } as Settings;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  async save(s: Settings): Promise<void> {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  }
}
