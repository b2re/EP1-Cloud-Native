// App Roles definidos en Microsoft Entra ID (claim "roles" del access token)
export const Roles = {
  ADMIN: 'ROLE_ADMINISTRADOR',
  OPERADOR: 'ROLE_OPERADOR',
  CLIENTE: 'ROLE_CLIENTE',
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];

export const ROLE_LABELS: Record<Role, string> = {
  [Roles.ADMIN]: 'Administrador',
  [Roles.OPERADOR]: 'Operador',
  [Roles.CLIENTE]: 'Cliente',
};
