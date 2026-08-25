/**
 * Tipos del catálogo geográfico de Bolivia (PV-16). Es un catálogo maestro
 * de solo lectura: 9 departamentos, 112 provincias y 340 municipios.
 *
 * Los `id` son enteros autoincrementales y NO son estables entre entornos
 * (los genera el seeder). Nunca deben quemarse en código ni en fixtures.
 * El `nombre` tampoco es clave: "Cercado" se repite en varios departamentos.
 */

import type { DataEnvelope } from './api.types';

export interface Departamento {
  id: number;
  nombre: string;
}

export interface Provincia {
  id: number;
  nombre: string;
  departamentoId: number;
}

export interface Municipio {
  id: number;
  nombre: string;
  provinciaId: number;
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
  departamentoId: number | null;
  provinciaId: number | null;
  municipioId: number | null;
}

/** Errores de validación por campo, para pintarlos bajo cada select. */
export type GeoSelectionErrors = Partial<Record<keyof GeoSelection, string>>;

/** Selección vacía, punto de partida de un formulario nuevo. */
export const emptyGeoSelection: GeoSelection = {
  departamentoId: null,
  provinciaId: null,
  municipioId: null,
};
