import type { User } from '../../domain/entities';
import type { AuthProvider, AuthRepository, ProfileChanges } from '../../domain/repositories';
import { DEMO_CREDENTIALS } from '../../shared/constants';

const AUTH_DELAY_MS = 600;

type StoredUser = User & { password: string };

const DEMO_USER: StoredUser = {
  id: 'user-demo',
  name: 'Demo Driver',
  email: DEMO_CREDENTIALS.email,
  password: DEMO_CREDENTIALS.password,
};

function delay(): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, AUTH_DELAY_MS));
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toUser(user: StoredUser): User {
  return { id: user.id, name: user.name, email: user.email, phone: user.phone, avatarUri: user.avatarUri };
}

export class MockAuthRepository implements AuthRepository {
  private users: StoredUser[];

  constructor(users: StoredUser[] = [DEMO_USER]) {
    this.users = users.map((user) => ({ ...user }));
  }

  async signIn(email: string, password: string): Promise<User> {
    await delay();
    const match = this.users.find(
      (user) =>
        user.email === normalizeEmail(email) && user.password === password,
    );
    if (match === undefined) {
      throw new Error('Incorrect email or password');
    }
    return toUser(match);
  }

  async signUp(name: string, email: string, password: string): Promise<User> {
    await delay();
    const normalized = normalizeEmail(email);
    const exists = this.users.some((user) => user.email === normalized);
    if (exists) {
      throw new Error('An account with this email already exists');
    }
    const created: StoredUser = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: normalized,
      password,
    };
    this.users.push(created);
    return toUser(created);
  }

  async signInWithProvider(provider: AuthProvider): Promise<User> {
    await delay();
    const label = provider === 'google' ? 'Google' : 'Apple';
    return {
      id: `user-${provider}`,
      name: `${label} Driver`,
      email: `${provider}.driver@roadsense.app`,
    };
  }

  async updateProfile(user: User, changes: ProfileChanges): Promise<User> {
    await delay();
    const email = normalizeEmail(changes.email);
    const taken = this.users.some((stored) => stored.email === email && stored.id !== user.id);
    if (taken) {
      throw new Error('An account with this email already exists');
    }
    const phone = changes.phone?.trim();
    const updated: User = {
      ...user,
      name: changes.name.trim(),
      email,
      phone: phone === undefined || phone.length === 0 ? undefined : phone,
      avatarUri: changes.avatarUri,
    };
    // Provider sign-ins are not stored, so only stored accounts are kept in sync.
    const stored = this.users.find((candidate) => candidate.id === user.id);
    if (stored !== undefined) Object.assign(stored, updated);
    return updated;
  }

  async signOut(): Promise<void> {
    await delay();
  }
}
