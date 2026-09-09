/**
 * Caché en memoria por clave, con deduplicación de peticiones en vuelo: si dos
 * componentes piden la misma clave a la vez, se dispara una sola petición y
 * ambos esperan la misma promesa.
 *
 * Un fallo **no** se cachea, de modo que el reintento vuelve a pedir al
 * backend. Vive durante la sesión: se pierde al recargar la página.
 *
 * Nació en `geografiaCache.ts` (PV-17) y se extrajo aquí porque el catálogo de
 * entidades públicas necesita exactamente el mismo comportamiento.
 */
export class KeyedCache<K, V> {
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
