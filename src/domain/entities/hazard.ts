import type { HazardType } from './hazard-type';
import type { LatLng } from './latlng';

export interface Hazard extends LatLng {
  id: string;
  type: HazardType;
  heading: number | null;
  reportedBy: string;
  createdAt: string;
  expiresAt: string;
  confirmations: number;
  denials: number;
  status: 'active' | 'expired';
}
