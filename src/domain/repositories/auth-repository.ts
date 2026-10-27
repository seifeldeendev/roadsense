import type { User } from '../entities/user';

export type AuthProvider = 'google' | 'apple';

export interface AuthRepository {
  signIn(email: string, password: string): Promise<User>;
  signUp(name: string, email: string, password: string): Promise<User>;
  signInWithProvider(provider: AuthProvider): Promise<User>;
  signOut(): Promise<void>;
}
