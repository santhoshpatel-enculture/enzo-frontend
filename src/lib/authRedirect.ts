import type { UserProfile } from '../services/api';

export function getPostLoginPath(user: UserProfile | null): string {
  if (user?.mustChangePassword) {
    return '/change-password';
  }
  return '/home';
}
