/**
 * Tipos del dominio de usuarios. El backend nunca devuelve el password:
 * la entidad pública es `User` (equivale a PublicUser del backend).
 */

export type UserRole =
  | 'admin'
  | 'social_lead'
  | 'technical_lead'
  | 'project_supervisor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

/** Body de POST /users. */
export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

/** Body de PUT /users/:id: cualquier subset (mín. 1 campo, se valida en el form). */
export type UpdateUserInput = Partial<CreateUserInput>;

/** Query params de GET /users. */
export interface ListUsersParams {
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'email' | 'role' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  role?: UserRole;
}

/** Errores por campo del formulario (alineados con `error.details[]` del backend). */
export interface UserFormErrors {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  general?: string;
}
