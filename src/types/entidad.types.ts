/**
 * Catálogo de entidades públicas (PV-19). Solo lectura: el backend expone
 * únicamente GET /entidades y GET /entidades/:id.
 *
 * Hoy el catálogo tiene una sola fila sembrada (AEVIVIENDA). El `id` es
 * autoincremental y NO es estable entre entornos; la clave natural es el `nit`.
 */
export interface EntidadPublica {
  id: number;
  /** BIGINT en la base, llega como number. Clave natural y única. */
  nit: number;
  nombre: string;
  /** ⚠️ Sin restricción de unicidad: nunca usarla como `key` de React. */
  sigla: string;
}

/**
 * Etiqueta del desplegable: `AEVIVIENDA — Agencia Estatal de Vivienda`.
 * El valor que se persiste es siempre el `id`.
 */
export const entidadLabel = (entidad: EntidadPublica): string =>
  `${entidad.sigla} — ${entidad.nombre}`;

/**
 * El NIT se muestra como texto, sin separador de miles: es un identificador,
 * no una cantidad. Si algún día admitiera ceros a la izquierda, este es el
 * único punto a tocar.
 */
export const formatNit = (nit: number): string => String(nit);
