import type { Settings } from '../entities';

export interface SettingsRepository {
  load(): Promise<Settings>;
  save(s: Settings): Promise<void>;
}
