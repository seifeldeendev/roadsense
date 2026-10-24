import { useCallback, useMemo, useState } from 'react';
import { useSessionStore } from '@/stores/useSessionStore';
import {
  validateSignIn,
  type FieldErrors,
} from '@/domain/usecases/auth/validateAuthForm';

export type SignInField = 'email' | 'password';

export type SignInViewModel = {
  email: string;
  password: string;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  errorFor: (field: SignInField) => string | undefined;
  formError: string | null;
  submitting: boolean;
  submit: () => void;
};

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }
  return 'Could not sign in — try again';
}

export function useSignInViewModel(): SignInViewModel {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const signIn = useSessionStore((s) => s.signIn);

  const errors = useMemo<FieldErrors<SignInField>>(
    () => validateSignIn({ email, password }),
    [email, password],
  );

  const errorFor = useCallback(
    (field: SignInField) => (submitted ? errors[field] : undefined),
    [submitted, errors],
  );

  const submit = useCallback(() => {
    if (!submitted) {
      setSubmitted(true);
    }
    if (Object.keys(errors).length > 0) {
      return;
    }
    setFormError(null);
    setSubmitting(true);
    signIn(email, password)
      .catch((error: unknown) => {
        setFormError(errorMessage(error));
      })
      .finally(() => {
        setSubmitting(false);
      });
  }, [submitted, errors, signIn, email, password]);

  return {
    email,
    password,
    setEmail,
    setPassword,
    errorFor,
    formError,
    submitting,
    submit,
  };
}
