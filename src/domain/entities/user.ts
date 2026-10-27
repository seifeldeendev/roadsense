export type User = {
  id: string;
  name: string;
  email: string;
  // Optional profile details, edited on the Profile screen.
  phone?: string | undefined;
  // Local image URI of the profile photo.
  avatarUri?: string | undefined;
};
