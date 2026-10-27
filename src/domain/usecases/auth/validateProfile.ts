import { validateEmail, validateName, type FieldErrors } from './validateAuthForm';

export type ProfileFormInput = {
  name: string;
  email: string;
  phone: string;
};

export type ProfileField = keyof ProfileFormInput;

export const PHONE_ERROR = 'Enter a valid phone number';

// Optional; when given: an optional "+", then 7–15 digits (spaces and dashes allowed).
const PHONE_PATTERN = /^\+?\d{7,15}$/;

export function validatePhone(value: string): string | undefined {
  const compact = value.replace(/[\s-]/g, '');
  if (compact.length === 0) return undefined;
  return PHONE_PATTERN.test(compact) ? undefined : PHONE_ERROR;
}

export function validateProfile(input: ProfileFormInput): FieldErrors<ProfileField> {
  const errors: FieldErrors<ProfileField> = {};
  const name = validateName(input.name);
  const email = validateEmail(input.email);
  const phone = validatePhone(input.phone);
  if (name !== undefined) errors.name = name;
  if (email !== undefined) errors.email = email;
  if (phone !== undefined) errors.phone = phone;
  return errors;
}
