import { describe, expect, it } from '@jest/globals';
import { MockAuthRepository } from '../src/data/mock/MockAuthRepository';
import { EMAIL_INVALID_ERROR, NAME_ERROR } from '../src/domain/usecases/auth/validateAuthForm';
import { PHONE_ERROR, validatePhone, validateProfile } from '../src/domain/usecases/auth/validateProfile';

describe('validateProfile', () => {
  it('accepts a complete profile', () => {
    expect(validateProfile({ name: 'Seif Saleem', email: 'seif@example.com', phone: '+20 100 123 4567' })).toEqual({});
  });

  it('treats the phone as optional', () => {
    expect(validateProfile({ name: 'Seif', email: 'seif@example.com', phone: '' })).toEqual({});
  });

  it('reports every invalid field', () => {
    expect(validateProfile({ name: 'S', email: 'nope', phone: '12ab' })).toEqual({
      name: NAME_ERROR,
      email: EMAIL_INVALID_ERROR,
      phone: PHONE_ERROR,
    });
  });
});

describe('validatePhone', () => {
  it('allows spaces, dashes and a leading plus', () => {
    expect(validatePhone('+20 100-123-4567')).toBeUndefined();
    expect(validatePhone('01001234567')).toBeUndefined();
  });

  it('rejects too short or non-numeric numbers', () => {
    expect(validatePhone('12345')).toBe(PHONE_ERROR);
    expect(validatePhone('phone')).toBe(PHONE_ERROR);
  });
});

describe('MockAuthRepository.updateProfile', () => {
  const stored = [
    { id: 'u1', name: 'Demo Driver', email: 'demo@roadsense.app', password: 'Drive2026' },
    { id: 'u2', name: 'Other', email: 'other@roadsense.app', password: 'Drive2026' },
  ];

  it('saves the changes so the next sign-in sees them', async () => {
    const repo = new MockAuthRepository(stored);
    const user = await repo.signIn('demo@roadsense.app', 'Drive2026');
    const updated = await repo.updateProfile(user, {
      name: '  Seif  ',
      email: 'Seif@Example.com',
      phone: ' +20 100 123 4567 ',
      avatarUri: 'file:///photo.jpg',
    });
    expect(updated).toEqual({
      id: 'u1',
      name: 'Seif',
      email: 'seif@example.com',
      phone: '+20 100 123 4567',
      avatarUri: 'file:///photo.jpg',
    });
    await expect(repo.signIn('seif@example.com', 'Drive2026')).resolves.toEqual(updated);
  });

  it('clears an emptied phone and photo', async () => {
    const repo = new MockAuthRepository(stored);
    const user = await repo.signIn('demo@roadsense.app', 'Drive2026');
    const updated = await repo.updateProfile(user, { name: 'Demo', email: user.email, phone: '  ', avatarUri: undefined });
    expect(updated.phone).toBeUndefined();
    expect(updated.avatarUri).toBeUndefined();
  });

  it("refuses another account's email", async () => {
    const repo = new MockAuthRepository(stored);
    const user = await repo.signIn('demo@roadsense.app', 'Drive2026');
    await expect(
      repo.updateProfile(user, { name: 'Demo', email: 'other@roadsense.app', phone: undefined, avatarUri: undefined }),
    ).rejects.toThrow('An account with this email already exists');
  });
});
