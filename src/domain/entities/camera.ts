import type { CameraType } from './hazard-type';
import type { LatLng } from './latlng';

export interface Camera extends LatLng {
  id: string;
  heading: number | null;
  speedLimitKmh: number;
  roadName: string;
  type: CameraType;
}
