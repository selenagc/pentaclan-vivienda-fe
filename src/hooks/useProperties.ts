import { propertyService } from '../services/propertyService';
import { usePaginatedList, type UsePaginatedListResult } from './usePaginatedList';
import type { ListPropertiesParams, Property } from '../types/property.types';

/** Filtros del listado: todo `ListPropertiesParams` salvo la paginación. */
export type PropertyFilters = Omit<ListPropertiesParams, 'page' | 'limit'>;

export interface UsePropertiesResult extends Omit<UsePaginatedListResult<Property>, 'items'> {
  properties: Property[];
}

/**
 * Carga el listado de viviendas, página a página, y expone su estado.
 *
 * Su uso principal es el buscador del formulario de solicitante, que filtra
 * por `municipalityId` para ofrecer solo las viviendas del municipio donde se
 * ejecuta el proyecto — que son exactamente las que el backend acepta. De ahí
 * el `initialLimit` corto: es una lista para elegir de un vistazo, no un
 * padrón para recorrer.
 */
export const useProperties = (
  filters: PropertyFilters = {},
  initialLimit = 5,
): UsePropertiesResult => {
  const { items, ...pagination } = usePaginatedList<Property, PropertyFilters>({
    fetcher: propertyService.list,
    filters,
    initialLimit,
    errorMessage: 'No se pudieron cargar las viviendas.',
  });

  return { properties: items, ...pagination };
};
