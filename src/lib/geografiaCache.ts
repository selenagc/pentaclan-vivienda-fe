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
 */

import type { Departamento, Municipio, Provincia } from '../types/geografia.types';

/**
 * Caché por clave con deduplicación de peticiones en vuelo: si dos componentes
 * piden la misma clave a la vez, se dispara una sola petición y ambos esperan
 * la misma promesa. Un fallo no se cachea, de modo que el reintento vuelve a
 * pedir al backend.
 */
class KeyedCache<K, V> {
  private readonly values = new Map<K, V>();
  private readonly inflight = new Map<K, Promise<V>>();

  async get(key: K, load: () => Promise<V>): Promise<V> {
    const cached = this.values.get(key);
    if (cached !== undefined) return cached;

    const pending = this.inflight.get(key);
    if (pending) return pending;

    const promise = load()
      .then((value) => {
        this.values.set(key, value);
        return value;
      })
      .finally(() => {
        this.inflight.delete(key);
      });

    this.inflight.set(key, promise);
    return promise;
  }

  clear(): void {
    this.values.clear();
    this.inflight.clear();
  }
}

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
