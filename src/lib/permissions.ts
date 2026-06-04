import type { UserProfile } from '../services/api';

export function canViewReportees(user: UserProfile | null): boolean {
  if (!user) return false;
  const role = (user.role || 'Employee').toLowerCase();
  return user.isAdmin || ['manager', 'lead', 'team lead', 'admin', 'hr'].includes(role);
}

export function canViewTenantOrg(user: UserProfile | null): boolean {
  if (!user) return false;
  return Boolean(user.isAdmin) || ['admin', 'hr', 'administrator'].includes((user.role || '').toLowerCase());
}
