import axios, { AxiosError } from 'axios';
import { authStorage } from './authStorage';
import type { ApiErrorResponse } from '../types/api.types';

/**
 * Instancia central de axios. Todas las llamadas al backend pasan por aquí.
 * - baseURL viene de la variable de entorno VITE_API_URL.
 * - El interceptor de petición adjunta el accessToken (Authorization: Bearer ...).
 * - El interceptor de respuesta limpia la sesión ante un 401.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = authStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    // Si el token expiró o es inválido, cerramos la sesión local.
    // (La página protegida redirigirá al login al no haber token.)
    if (error.response?.status === 401) {
      authStorage.clear();
    }
    return Promise.reject(error);
  },
);

/**
 * Extrae un mensaje legible de un error de axios para mostrarlo en la UI.
 */
export function getApiErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado.'): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.error?.message ?? error.message ?? fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
