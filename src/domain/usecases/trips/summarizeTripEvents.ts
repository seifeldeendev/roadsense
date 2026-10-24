import type { AlertKind, Trip } from '../../entities';

export type OverLimitEvent = {
  kind: 'over';
  startTs: number;
  endTs: number;
  maxSpeedKmh: number;
  limitKmh: number;
};

export type AlertEventSummary = {
  kind: 'alert';
  ts: number;
  refKind: AlertKind;
  refId: string;
  distanceM: number;
};

export type TripEvent = OverLimitEvent | AlertEventSummary;

// Chronological summary of everything that happened during a trip: stretches
// driven over the limit and the moment each nearby alert was received.
export function summarizeTripEvents(trip: Trip): TripEvent[] {
  const events: TripEvent[] = [];
  let open: OverLimitEvent | null = null;

  for (const point of trip.points) {
    const over = point.speedKmh > point.limitKmh;
    if (!over) {
      if (open !== null) {
        events.push(open);
        open = null;
      }
      continue;
    }
    if (open !== null && open.limitKmh !== point.limitKmh) {
      events.push(open);
      open = null;
    }
    if (open === null) {
      open = {
        kind: 'over',
        startTs: point.ts,
        endTs: point.ts,
        maxSpeedKmh: point.speedKmh,
        limitKmh: point.limitKmh,
      };
    } else {
      open.endTs = point.ts;
      open.maxSpeedKmh = Math.max(open.maxSpeedKmh, point.speedKmh);
    }
  }
  if (open !== null) events.push(open);

  for (const alert of trip.alerts) {
    events.push({
      kind: 'alert',
      ts: alert.ts,
      refKind: alert.kind,
      refId: alert.refId,
      distanceM: alert.distanceM,
    });
  }

  return events.sort((a, b) => eventTs(a) - eventTs(b));
}

function eventTs(event: TripEvent): number {
  return event.kind === 'alert' ? event.ts : event.startTs;
}
