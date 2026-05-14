import type { LoginCredentials, LoginResponse } from '../types/auth.types';

/**
 * Servicio de autenticación.
 * TODO: Reemplazar la simulación con la llamada real usando axios desde lib/.
 *
 * Ejemplo con axios:
 *   import { api } from '../lib/axios';
 *   const { data } = await api.post<LoginResponse>('/auth/login', credentials);
 *   return data;
 */
export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Simulación de delay de red
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock: en producción esto vendría de tu backend
    if (credentials.email && credentials.password.length >= 6) {
      return {
        user: {
          id: '1',
          email: credentials.email,
          name: 'María Gutiérrez',
          role: 'admin',
        },
        token: 'mock-jwt-token',
      };
    }

    throw new Error('Credenciales inválidas');
  },

  async loginWithInstitutional(): Promise<LoginResponse> {
    // Redirección a SSO institucional
    throw new Error('No implementado todavía');
  },
};
