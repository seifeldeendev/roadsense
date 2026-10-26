import { useCallback, useMemo, useState } from 'react';
import { router } from 'expo-router';
import type { FieldErrors } from '@/domain/usecases/auth/validateAuthForm';
import { validateProfile, type ProfileField } from '@/domain/usecases/auth/validateProfile';
import { pickProfilePhoto, type PhotoSource } from '@/services/imagePicker';
import { useSessionStore } from '@/stores/useSessionStore';
import { initialsOf } from './initials';

export type ProfileViewModel = {
  name: string;
  email: string;
  phone: string;
  avatarUri: string | undefined;
  initials: string;
  setName: (value: string) => void;
  setEmail: (value: string) => void;
  setPhone: (value: string) => void;
  errorFor: (field: ProfileField) => string | undefined;
  photoSheetOpen: boolean;
  openPhotoSheet: () => void;
  closePhotoSheet: () => void;
  choosePhoto: (source: PhotoSource) => void;
  removePhoto: () => void;
  hasChanges: boolean;
  formError: string | null;
  saving: boolean;
  save: () => void;
};

const GENERIC_SAVE_ERROR = 'Could not save your profile — try again';

export function useProfileViewModel(): ProfileViewModel {
  const user = useSessionStore((s) => s.user);
  const updateProfile = useSessionStore((s) => s.updateProfile);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [avatarUri, setAvatarUri] = useState(user?.avatarUri);
  const [photoSheetOpen, setPhotoSheetOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const errors = useMemo<FieldErrors<ProfileField>>(() => validateProfile({ name, email, phone }), [name, email, phone]);

  // Errors appear once the driver has tried to save, like the sign-up form.
  const errorFor = useCallback((field: ProfileField) => (submitted ? errors[field] : undefined), [submitted, errors]);

  const hasChanges =
    name !== (user?.name ?? '') ||
    email !== (user?.email ?? '') ||
    phone !== (user?.phone ?? '') ||
    avatarUri !== user?.avatarUri;

  const choosePhoto = useCallback((source: PhotoSource) => {
    setPhotoSheetOpen(false);
    void pickProfilePhoto(source).then((uri) => {
      if (uri !== null) setAvatarUri(uri);
    });
  }, []);

  const removePhoto = useCallback(() => {
    setPhotoSheetOpen(false);
    setAvatarUri(undefined);
  }, []);

  const save = useCallback(() => {
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;
    setFormError(null);
    setSaving(true);
    updateProfile({ name, email, phone, avatarUri })
      .then(() => router.back())
      .catch((error: unknown) => {
        setFormError(error instanceof Error && error.message.length > 0 ? error.message : GENERIC_SAVE_ERROR);
      })
      .finally(() => setSaving(false));
  }, [errors, updateProfile, name, email, phone, avatarUri]);

  return {
    name,
    email,
    phone,
    avatarUri,
    initials: initialsOf(name.length > 0 ? name : (user?.name ?? '')),
    setName,
    setEmail,
    setPhone,
    errorFor,
    photoSheetOpen,
    openPhotoSheet: () => setPhotoSheetOpen(true),
    closePhotoSheet: () => setPhotoSheetOpen(false),
    choosePhoto,
    removePhoto,
    hasChanges,
    formError,
    saving,
    save,
  };
}
