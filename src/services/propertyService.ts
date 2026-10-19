import { api } from '../lib/axios';
import type { PagedEnvelope } from '../types/api.types';
import type { ListPropertiesParams, Property } from '../types/property.types';

/**
 * Servicio del módulo de Viviendas (backend PV-30).
 *
 * **Solo lectura: existe `GET /properties` y nada más.** El alta ocurre dentro
 * del registro de una postulación, en una sola transacción, para que no queden
 * viviendas cargadas sin ficha asociada. Este listado alimenta el buscador del
 * formulario, que es lo que evita cargar dos veces la misma casa.
 */
export const propertyService = {
  /** Listado paginado. Devuelve { data, meta } tal cual el backend. */
  async list(params: ListPropertiesParams = {}): Promise<PagedEnvelope<Property>> {
    const { data } = await api.get<PagedEnvelope<Property>>('/properties', { params });
    return data;
  },
};
