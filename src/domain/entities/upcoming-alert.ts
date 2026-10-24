import type { Camera } from './camera';
import type { AlertKind } from './hazard-type';
import type { Hazard } from './hazard';

export interface UpcomingAlert {
  kind: AlertKind;
  refId: string;
  title: string;
  roadName?: string;
  distanceM: number;
  speedLimitKmh?: number;
  hazard?: Hazard;
  camera?: Camera;
}
