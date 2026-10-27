import { describe, expect, it } from '@jest/globals';
import {
  CONFIRM_MISMATCH_ERROR,
  EMAIL_INVALID_ERROR,
  EMAIL_REQUIRED_ERROR,
  NAME_ERROR,
  PASSWORD_REQUIRED_ERROR,
  PASSWORD_WEAK_ERROR,
  validateSignIn,
  validateSignUp,
} from '../src/domain/usecases/auth/validateAuthForm';

describe('validateSignIn', () => {
  it('requires an email', () => {
    expect(validateSignIn({ email: '', password: 'Drive2026' })).toEqual({
      email: EMAIL_REQUIRED_ERROR,
    });
  });

  it('rejects malformed emails', () => {
    expect(validateSignIn({ email: 'demo@roadsense', password: 'x' })).toEqual({
      email: EMAIL_INVALID_ERROR,
    });
    expect(
      validateSignIn({ email: 'demo roadsense.app', password: 'x' }),
    ).toEqual({ email: EMAIL_INVALID_ERROR });
  });

  it('requires a password', () => {
    expect(validateSignIn({ email: 'demo@roadsense.app', password: '' })).toEqual({
      password: PASSWORD_REQUIRED_ERROR,
    });
  });

  it('accepts a well-formed sign-in form', () => {
    expect(
      validateSignIn({ email: 'demo@roadsense.app', password: 'Drive2026' }),
    ).toEqual({});
  });
});

describe('validateName (via validateSignUp)', () => {
  it('rejects names shorter than two characters', () => {
    const errors = validateSignUp({
      name: ' J ',
      email: 'a@b.c',
      password: 'Drive2026',
      confirmPassword: 'Drive2026',
    });
    expect(errors).toEqual({ name: NAME_ERROR });
  });

  it('accepts names of at least two trimmed characters', () => {
    const errors = validateSignUp({
      name: 'Demo Driver',
      email: 'a@b.c',
      password: 'Drive2026',
      confirmPassword: 'Drive2026',
    });
    expect(errors.name).toBeUndefined();
    expect(errors).toEqual({});
  });
});

describe('validateSignUp', () => {
  it('flags every invalid field at once', () => {
    const errors = validateSignUp({
      name: '',
      email: 'nope',
      password: 'short',
      confirmPassword: '',
    });
    expect(errors.name).toBe(NAME_ERROR);
    expect(errors.email).toBe(EMAIL_INVALID_ERROR);
    expect(errors.password).toBe(PASSWORD_WEAK_ERROR);
  });

  it('rejects passwords shorter than eight characters', () => {
    expect(
      validateSignUp({
        name: 'Demo Driver',
        email: 'a@b.c',
        password: 'Dri2026',
        confirmPassword: 'Dri2026',
      }).password,
    ).toBe(PASSWORD_WEAK_ERROR);
  });

  it('rejects passwords without a number', () => {
    expect(
      validateSignUp({
        name: 'Demo Driver',
        email: 'a@b.c',
        password: 'Passwword',
        confirmPassword: 'Passwword',
      }).password,
    ).toBe(PASSWORD_WEAK_ERROR);
  });

  it('rejects passwords without a letter', () => {
    expect(
      validateSignUp({
        name: 'Demo Driver',
        email: 'a@b.c',
        password: '12345678',
        confirmPassword: '12345678',
      }).password,
    ).toBe(PASSWORD_WEAK_ERROR);
  });

  it('accepts passwords with a letter and a number at eight characters', () => {
    expect(
      validateSignUp({
        name: 'Demo Driver',
        email: 'a@b.c',
        password: 'Drive2026',
        confirmPassword: 'Drive2026',
      }).password,
    ).toBeUndefined();
  });

  it('rejects mismatched confirmation on its own', () => {
    const errors = validateSignUp({
      name: 'Demo Driver',
      email: 'a@b.c',
      password: 'Drive2026',
      confirmPassword: 'Drive2016',
    });
    expect(errors).toEqual({ confirmPassword: CONFIRM_MISMATCH_ERROR });
  });

  it('accepts a complete valid form', () => {
    expect(
      validateSignUp({
        name: 'Demo Driver',
        email: 'driver@roadsense.app',
        password: 'Drive2026',
        confirmPassword: 'Drive2026',
      }),
    ).toEqual({});
  });
});
