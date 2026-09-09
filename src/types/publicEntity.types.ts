/**
 * Catálogo de entidades públicas (PV-19). Solo lectura: el backend expone
 * únicamente GET /public-entities y GET /public-entities/:id.
 *
 * Hoy el catálogo tiene una sola fila sembrada (AEVIVIENDA). El `id` es
 * autoincremental y NO es estable entre entornos; la clave natural es el `taxId`.
 */
export interface PublicEntity {
  id: number;
  /** BIGINT en la base, llega como number. Clave natural y única. */
  taxId: number;
  name: string;
  /** ⚠️ Sin restricción de unicidad: nunca usarla como `key` de React. */
  acronym: string;
}

/**
 * Etiqueta del desplegable: `AEVIVIENDA — Agencia Estatal de Vivienda`.
 * El valor que se persiste es siempre el `id`.
 */
export const publicEntityLabel = (publicEntity: PublicEntity): string =>
  `${publicEntity.acronym} — ${publicEntity.name}`;

/**
 * El NIT se muestra como texto, sin separador de miles: es un identificador,
 * no una cantidad. Si algún día admitiera ceros a la izquierda, este es el
 * único punto a tocar.
 */
export const formatTaxId = (taxId: number): string => String(taxId);
