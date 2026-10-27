import type { AlertKind } from './hazard-type';

export interface AlertEvent {
  ts: number;
  kind: AlertKind;
  refId: string;
  distanceM: number;
}
