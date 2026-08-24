export type AccountRole = 'owner' | 'admin' | 'member' | 'viewer' | 'agent' | string;

export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  VIEWER: 'viewer',
  AGENT: 'agent',
} as const;

export function hasMinRole(userRole: string | undefined, minRole: string): boolean {
  const roleHierarchy: Record<string, number> = {
    viewer: 1,
    agent: 2,
    member: 3,
    admin: 4,
    owner: 5,
  };
  if (!userRole) return false;
  return (roleHierarchy[userRole.toLowerCase()] || 0) >= (roleHierarchy[minRole.toLowerCase()] || 0);
}
