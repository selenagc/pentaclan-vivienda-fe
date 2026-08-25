/**
 * Tipos del catálogo geográfico de Bolivia (PV-16). Es un catálogo maestro
 * de solo lectura: 9 departamentos, 112 provincias y 340 municipios.
 *
 * Los `id` son enteros autoincrementales y NO son estables entre entornos
 * (los genera el seeder). Nunca deben quemarse en código ni en fixtures.
 * El `nombre` tampoco es clave: "Cercado" se repite en varios departamentos.
 */

import type { DataEnvelope } from './api.types';

export interface Department {
  id: number;
  name: string;
}

export interface Province {
  id: number;
  name: string;
  departmentId: number;
}

export interface Municipality {
  id: number;
  name: string;
  provinceId: number;
}

/**
 * Envoltorio de los endpoints de geografía: responden `{ data }` **sin**
 * `success`. Es el caso general `DataEnvelope<T[]>` de api.types.ts, que
 * comparten también entidades públicas y proyectos; el alias se conserva
 * porque el servicio de geografía lo nombra en cada llamada.
 */
export type GeoResponse<T> = DataEnvelope<T[]>;

/** Selección de la cascada. `null` = todavía sin elegir. */
export interface GeoSelection {
  departmentId: number | null;
  provinceId: number | null;
  municipalityId: number | null;
}

/** Errores de validación por campo, para pintarlos bajo cada select. */
export type GeoSelectionErrors = Partial<Record<keyof GeoSelection, string>>;

/** Selección vacía, punto de partida de un formulario nuevo. */
export const emptyGeoSelection: GeoSelection = {
  departmentId: null,
  provinceId: null,
  municipalityId: null,
};
