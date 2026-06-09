import { api } from '../lib/axios';
import type { ApiResponse } from '../types/api.types';
import type { LoginCredentials, LoginResponse, User } from '../types/auth.types';

/**
 * Servicio de autenticación. Llama al backend real (Node/Express).
 * Endpoints: POST /auth/login, GET /auth/me.
 */
export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await api.post<ApiResponse<LoginResponse>>('/auth/login', {
      email: credentials.email,
      password: credentials.password,
    });
    return data.data;
  },

  async me(): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>('/auth/me');
    return data.data;
  },
};
