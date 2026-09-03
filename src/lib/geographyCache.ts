/**
 * Caché en memoria del catálogo geográfico.
 *
 * No es una optimización opcional: el catálogo es inmutable, el backend no
 * envía `ETag` ni `Cache-Control`, y el rate limit (300 req / 15 min por IP)
 * es compartido con el resto de la app. Sin caché, una pantalla que reconstruya
 * varias cadenas geográficas agota la cuota.
 *
 * Vive durante la sesión: se pierde al recargar la página, que es justo lo
 * que se quiere (los datos solo cambian si se re-siembra la base).
 *
 * La mecánica de la caché vive en `lib/keyedCache.ts`: la comparte con el
 * catálogo de entidades públicas.
 */

import { KeyedCache } from './keyedCache';
import type { Department, Municipality, Province } from '../types/geography.types';

/** Clave única de la caché de departamentos (no depende de ningún padre). */
export const DEPARTMENTS_KEY = 'departamentos';

export const geographyCache = {
  departments: new KeyedCache<string, Department[]>(),
  /** Provincias indexadas por `departamentoId`. */
  provinces: new KeyedCache<number, Province[]>(),
  /** Municipios indexados por `provinciaId`. */
  municipalities: new KeyedCache<number, Municipality[]>(),

  /** Vacía todo. Útil al cerrar sesión o si se re-siembra la base. */
  clear(): void {
    this.departments.clear();
    this.provinces.clear();
    this.municipalities.clear();
  },
};
