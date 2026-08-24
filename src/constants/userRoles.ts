import type { UserRole } from '../types/user.types';

/** Etiquetas legibles (español) para cada rol del backend. */
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  social_lead: 'Líder social',
  technical_lead: 'Líder técnico',
  project_supervisor: 'Supervisor de proyecto',
};

/** Opciones para el selector de rol del formulario. */
export const USER_ROLE_OPTIONS = (
  Object.keys(USER_ROLE_LABELS) as UserRole[]
).map((value) => ({ value, label: USER_ROLE_LABELS[value] }));
