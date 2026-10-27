import type { Hazard, HazardType } from '../entities';

export interface ReportHazardInput {
  type: HazardType;
  lat: number;
  lng: number;
  heading: number;
}

export interface HazardRepository {
  getActive(): Promise<Hazard[]>;
  report(input: ReportHazardInput): Promise<Hazard>;
  vote(hazardId: string, stillThere: boolean): Promise<Hazard>;
}
