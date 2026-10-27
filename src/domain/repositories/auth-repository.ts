import type { User } from '../entities/user';

export type AuthProvider = 'google' | 'apple';

// What the Profile screen can change.
export type ProfileChanges = Pick<User, 'name' | 'email' | 'phone' | 'avatarUri'>;

export interface AuthRepository {
  signIn(email: string, password: string): Promise<User>;
  signUp(name: string, email: string, password: string): Promise<User>;
  signInWithProvider(provider: AuthProvider): Promise<User>;
  updateProfile(user: User, changes: ProfileChanges): Promise<User>;
  signOut(): Promise<void>;
}
