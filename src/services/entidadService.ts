import { api } from '../lib/axios';
import { KeyedCache } from '../lib/keyedCache';
import type { DataEnvelope } from '../types/api.types';
import type { EntidadPublica } from '../types/entidad.types';

/** Clave única de la caché del catálogo (no depende de ningún padre). */
const CATALOGO_KEY = 'entidades';

const cache = {
  catalogo: new KeyedCache<string, EntidadPublica[]>(),
  /** Entidades sueltas indexadas por `id`. */
  porId: new KeyedCache<number, EntidadPublica>(),
};

/**
 * Servicio del catálogo de entidades públicas (PV-19). Solo lectura: el
 * backend no expone POST/PUT/PATCH/DELETE (un POST cae en el middleware
 * `notFound` y responde 404 "Route not found", no 405).
 *
 * Endpoints: GET /entidades, GET /entidades/:id. Ambos exigen Bearer y los
 * consume cualquier rol. El listado llega ordenado por `sigla` ASC.
 *
 * Ojo con el desempaquetado: `GET /entidades` devuelve un **array** y
 * `GET /entidades/:id` un **objeto**, ambos bajo `{ data }` sin `success`.
 */
export const entidadService = {
  /** El catálogo completo. Una sola petición por sesión. */
  list(): Promise<EntidadPublica[]> {
    return cache.catalogo.get(CATALOGO_KEY, async () => {
      const { data } = await api.get<DataEnvelope<EntidadPublica[]>>('/entidades');
      return data.data;
    });
  },

  /** Una entidad concreta. 404 si el id no existe. */
  getById(id: number): Promise<EntidadPublica> {
    return cache.porId.get(id, async () => {
      const { data } = await api.get<DataEnvelope<EntidadPublica>>(`/entidades/${id}`);
      return data.data;
    });
  },

  /** Vacía la caché. Útil al cerrar sesión o si se re-siembra la base. */
  clearCache(): void {
    cache.catalogo.clear();
    cache.porId.clear();
  },
};
