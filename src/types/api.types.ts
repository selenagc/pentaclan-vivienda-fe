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

/**
 * Envoltorio de los endpoints que responden `{ data }` **sin** `success`:
 * geografía (PV-16), entidades públicas (PV-19) y proyectos (PV-21).
 *
 * No es un capricho: esos controladores escriben el JSON a mano en vez de usar
 * los helpers `ok()/created()/paginated()` que sí usan `/auth` y `/users`, así
 * que `ApiResponse<T>` (que declara `success: true`) describiría una respuesta
 * que el backend no manda. Los **errores** sí traen `success: false` en toda
 * la API, de ahí que `ApiErrorResponse` sirva para ambos grupos.
 */
export interface DataEnvelope<T> {
  data: T;
}

/** Igual que `DataEnvelope`, pero para los listados paginados sin `success`. */
export interface PagedEnvelope<T> {
  data: T[];
  meta: PaginationMeta;
}
