import { api } from '../lib/axios';
import type { ApiResponse, PaginatedResponse } from '../types/api.types';
import type {
  CreateUserInput,
  ListUsersParams,
  UpdateUserInput,
  User,
} from '../types/user.types';

/**
 * Servicio del CRUD de usuarios. Todas las rutas requieren rol admin.
 * Endpoints: GET/POST /users, GET/PUT/DELETE /users/:id.
 */
export const userService = {
  /** Listado paginado. Devuelve { data, meta } tal cual el backend. */
  async list(params: ListUsersParams = {}): Promise<PaginatedResponse<User>> {
    const { data } = await api.get<PaginatedResponse<User>>('/users', { params });
    return data;
  },

  async getById(id: string): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>(`/users/${id}`);
    return data.data;
  },

  async create(input: CreateUserInput): Promise<User> {
    const { data } = await api.post<ApiResponse<User>>('/users', input);
    return data.data;
  },

  async update(id: string, input: UpdateUserInput): Promise<User> {
    const { data } = await api.put<ApiResponse<User>>(`/users/${id}`, input);
    return data.data;
  },

  /** DELETE /users/:id responde 204 sin cuerpo. */
  async remove(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};
