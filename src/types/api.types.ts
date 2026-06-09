/**
 * Formas de respuesta del backend (envoltura estándar).
 * El backend responde siempre con { success, ... }.
 *
 *  - Éxito simple:    { success: true, data, message? }
 *  - Éxito paginado:  { success: true, data, meta, message? }
 *  - Error:           { success: false, error: { code, message, details? } }
 */

export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: PaginationMeta;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
