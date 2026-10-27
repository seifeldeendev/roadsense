import { useCallback, useMemo, useState } from 'react';
import { useStores } from '@/stores/DependenciesProvider';
import {
  validateSignUp,
  type FieldErrors,
} from '@/domain/usecases/auth/validateAuthForm';

export type SignUpField = 'name' | 'email' | 'password' | 'confirmPassword';

export type SignUpViewModel = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  setName: (value: string) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  errorFor: (field: SignUpField) => string | undefined;
  formError: string | null;
  submitting: boolean;
  submit: () => void;
};

const GENERIC_SIGN_UP_ERROR = 'Could not create your account — try again';

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }
  return GENERIC_SIGN_UP_ERROR;
}

export function useSignUpViewModel(): SignUpViewModel {
  const { useSessionStore } = useStores();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const signUp = useSessionStore((s) => s.signUp);

  const errors = useMemo<FieldErrors<SignUpField>>(
    () => validateSignUp({ name, email, password, confirmPassword }),
    [name, email, password, confirmPassword],
  );

  const errorFor = useCallback(
    (field: SignUpField) => (submitted ? errors[field] : undefined),
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
    signUp(name, email, password)
      .catch((error: unknown) => {
        setFormError(errorMessage(error));
      })
      .finally(() => {
        setSubmitting(false);
      });
  }, [submitted, errors, signUp, name, email, password]);

  return {
    name,
    email,
    password,
    confirmPassword,
    setName,
    setEmail,
    setPassword,
    setConfirmPassword,
    errorFor,
    formError,
    submitting,
    submit,
  };
}
