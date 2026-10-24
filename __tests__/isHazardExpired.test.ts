import { describe, expect, it } from '@jest/globals';
import type { Hazard } from '../src/domain/entities';
import { isHazardExpired } from '../src/domain/usecases/hazards/isHazardExpired';

const ACTIVE_TTL_MS = 3_600_000;
const now = Date.now();

function hazard(overrides: Partial<Hazard>): Hazard {
  return {
    id: 'hz-test',
    type: 'pothole',
    lat: 30.07,
    lng: 31.338,
    heading: 0,
    reportedBy: 'driver-test',
    createdAt: new Date(now - ACTIVE_TTL_MS).toISOString(),
    expiresAt: new Date(now + ACTIVE_TTL_MS).toISOString(),
    confirmations: 0,
    denials: 0,
    status: 'active',
    ...overrides,
  };
}

describe('isHazardExpired', () => {
  it('is false for an active fresh hazard', () => {
    expect(isHazardExpired(hazard({}), new Date(now))).toBe(false);
  });

  it('is true once the denial limit is reached', () => {
    expect(isHazardExpired(hazard({ denials: 3 }), new Date(now))).toBe(true);
    expect(isHazardExpired(hazard({ denials: 2 }), new Date(now))).toBe(false);
  });

  it('is true once the ttl has passed', () => {
    const expiring = hazard({ expiresAt: new Date(now - 1).toISOString() });
    expect(isHazardExpired(expiring, new Date(now))).toBe(true);
    const almost = hazard({ expiresAt: new Date(now + 1).toISOString() });
    expect(isHazardExpired(almost, new Date(now))).toBe(false);
  });

  it('is true when explicitly marked expired', () => {
    expect(isHazardExpired(hazard({ status: 'expired' }), new Date(now))).toBe(true);
  });
});
