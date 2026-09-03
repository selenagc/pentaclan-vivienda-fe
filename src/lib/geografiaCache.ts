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
import type { Departamento, Municipio, Provincia } from '../types/geografia.types';

/** Clave única de la caché de departamentos (no depende de ningún padre). */
export const DEPARTAMENTOS_KEY = 'departamentos';

export const geografiaCache = {
  departamentos: new KeyedCache<string, Departamento[]>(),
  /** Provincias indexadas por `departamentoId`. */
  provincias: new KeyedCache<number, Provincia[]>(),
  /** Municipios indexados por `provinciaId`. */
  municipios: new KeyedCache<number, Municipio[]>(),

  /** Vacía todo. Útil al cerrar sesión o si se re-siembra la base. */
  clear(): void {
    this.departamentos.clear();
    this.provincias.clear();
    this.municipios.clear();
  },
};
