import axios from 'axios';
import type { ApiErrorResponse } from '../types/api.types';

/**
 * Traducción de los códigos de error del backend a mensajes presentables.
 *
 * El backend devuelve mensajes en inglés y técnicos ("Departamento 999999 not
 * found", "Insufficient role") que no son aptos para el usuario final, así que
 * el mapeo se hace **por `error.code`, nunca por el texto**.
 */
export const API_ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: 'Los datos enviados no son válidos.',
  UNAUTHORIZED: 'Tu sesión expiró. Vuelve a iniciar sesión.',
  FORBIDDEN: 'No tienes permisos para realizar esta acción.',
  NOT_FOUND: 'No se encontró el recurso solicitado.',
  CONFLICT: 'La operación entra en conflicto con datos existentes.',
  RATE_LIMITED: 'Demasiadas peticiones. Espera unos minutos e intenta de nuevo.',
  INTERNAL_ERROR: 'Ocurrió un error en el servidor. Intenta más tarde.',
  NOT_IMPLEMENTED: 'Este módulo todavía no está disponible.',

  // Conflictos del padrón que el operador puede resolver de formas distintas,
  // y por eso el backend les da código propio en vez de un `CONFLICT` genérico.
  APPLICATION_ALREADY_DECIDED:
    'Esta ficha ya fue aprobada o rechazada. Vuelve a cargarla para ver su estado actual.',
  PROPERTY_ALREADY_BENEFITED:
    'Esta vivienda ya tiene un beneficiario aprobado en este proyecto. Solo puede haber uno.',
};

/**
 * Mensaje legible para un error de la API, resuelto por `error.code`.
 *
 * A diferencia de `getApiErrorMessage` (lib/axios.ts), que devuelve el texto
 * crudo del backend, esta función siempre devuelve español. Úsala en la UI y
 * deja la otra para logs o para errores con mensaje ya presentable.
 *
 * Nota: sirve tanto con el formato actual `{ success: false, error }` como con
 * el que traerá PV-21 (`{ error }` sin `success`), porque solo lee `error.code`.
 */
export function getFriendlyErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const code = error.response?.data?.error?.code;
    if (code && code in API_ERROR_MESSAGES) return API_ERROR_MESSAGES[code];
    if (!error.response) return 'No se pudo conectar con el servidor.';
  }
  return fallback;
}
