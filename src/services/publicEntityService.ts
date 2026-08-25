import { api } from '../lib/axios';
import { KeyedCache } from '../lib/keyedCache';
import type { DataEnvelope } from '../types/api.types';
import type { PublicEntity } from '../types/publicEntity.types';

/** Clave única de la caché del catálogo (no depende de ningún padre). */
const CATALOGO_KEY = 'entidades';

const cache = {
  catalogo: new KeyedCache<string, PublicEntity[]>(),
  /** Entidades sueltas indexadas por `id`. */
  porId: new KeyedCache<number, PublicEntity>(),
};

/**
 * Servicio del catálogo de entidades públicas (PV-19). Solo lectura: el
 * backend no expone POST/PUT/PATCH/DELETE (un POST cae en el middleware
 * `notFound` y responde 404 "Route not found", no 405).
 *
 * Endpoints: GET /public-entities, GET /public-entities/:id. Ambos exigen Bearer y los
 * consume cualquier rol. El listado llega ordenado por `sigla` ASC.
 *
 * Ojo con el desempaquetado: `GET /public-entities` devuelve un **array** y
 * `GET /public-entities/:id` un **objeto**, ambos bajo `{ data }` sin `success`.
 */
export const publicEntityService = {
  /** El catálogo completo. Una sola petición por sesión. */
  list(): Promise<PublicEntity[]> {
    return cache.catalogo.get(CATALOGO_KEY, async () => {
      const { data } = await api.get<DataEnvelope<PublicEntity[]>>('/public-entities');
      return data.data;
    });
  },

  /** Una entidad concreta. 404 si el id no existe. */
  getById(id: number): Promise<PublicEntity> {
    return cache.porId.get(id, async () => {
      const { data } = await api.get<DataEnvelope<PublicEntity>>(`/public-entities/${id}`);
      return data.data;
    });
  },

  /** Vacía la caché. Útil al cerrar sesión o si se re-siembra la base. */
  clearCache(): void {
    cache.catalogo.clear();
    cache.porId.clear();
  },
};
