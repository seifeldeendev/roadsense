export type SignInFormInput = {
  email: string;
  password: string;
};

export type SignUpFormInput = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type FieldErrors<Fields extends string> = Partial<Record<Fields, string>>;

export const NAME_ERROR = 'Enter your name';
export const EMAIL_REQUIRED_ERROR = 'Email is required';
export const EMAIL_INVALID_ERROR = 'Enter a valid email address';
export const PASSWORD_REQUIRED_ERROR = 'Password is required';
export const PASSWORD_WEAK_ERROR = 'Use at least 8 characters with a letter and a number';
export const CONFIRM_MISMATCH_ERROR = "Passwords don't match";

// Deliberately simple, RFC-ish shape check: local part, "@", domain with a dot.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateName(value: string): string | undefined {
  if (value.trim().length < 2) {
    return NAME_ERROR;
  }
  return undefined;
}

export function validateEmail(value: string): string | undefined {
  if (value.trim().length === 0) {
    return EMAIL_REQUIRED_ERROR;
  }
  if (!EMAIL_PATTERN.test(value.trim())) {
    return EMAIL_INVALID_ERROR;
  }
  return undefined;
}

export function validatePassword(value: string): string | undefined {
  if (value.length === 0) {
    return PASSWORD_REQUIRED_ERROR;
  }
  const hasLetter = /[A-Za-z]/.test(value);
  const hasNumber = /\d/.test(value);
  if (value.length < 8 || !hasLetter || !hasNumber) {
    return PASSWORD_WEAK_ERROR;
  }
  return undefined;
}

export function validateSignIn(
  input: SignInFormInput,
): FieldErrors<'email' | 'password'> {
  const errors: FieldErrors<'email' | 'password'> = {
    email: validateEmail(input.email),
    password: input.password.length === 0 ? PASSWORD_REQUIRED_ERROR : undefined,
  };
  return compact(errors);
}

export function validateSignUp(
  input: SignUpFormInput,
): FieldErrors<'name' | 'email' | 'password' | 'confirmPassword'> {
  const errors: FieldErrors<'name' | 'email' | 'password' | 'confirmPassword'> = {
    name: validateName(input.name),
    email: validateEmail(input.email),
    password: validatePassword(input.password),
    confirmPassword:
      input.confirmPassword === input.password
        ? undefined
        : CONFIRM_MISMATCH_ERROR,
  };
  return compact(errors);
}

function compact<Fields extends string>(
  errors: Partial<Record<Fields, string | undefined>>,
): FieldErrors<Fields> {
  const result: Record<string, string> = {};
  for (const [field, rawMessage] of Object.entries(errors)) {
    if (typeof rawMessage === 'string') {
      result[field] = rawMessage;
    }
  }
  return result as FieldErrors<Fields>;
}
