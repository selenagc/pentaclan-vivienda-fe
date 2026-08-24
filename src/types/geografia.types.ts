/**
 * Tipos del catálogo geográfico de Bolivia (PV-16). Es un catálogo maestro
 * de solo lectura: 9 departamentos, 112 provincias y 340 municipios.
 *
 * Los `id` son enteros autoincrementales y NO son estables entre entornos
 * (los genera el seeder). Nunca deben quemarse en código ni en fixtures.
 * El `nombre` tampoco es clave: "Cercado" se repite en varios departamentos.
 */

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
 * Envelope de los endpoints de geografía. A diferencia del resto de la API
 * (`ApiResponse<T>` en api.types.ts), estos responden `{ data }` **sin**
 * `success`, por lo que no se puede reutilizar aquel tipo.
 */
export interface GeoResponse<T> {
  data: T[];
}

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
