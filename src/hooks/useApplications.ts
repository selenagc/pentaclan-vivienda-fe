import { applicationService } from '../services/applicationService';
import { usePaginatedList, type UsePaginatedListResult } from './usePaginatedList';
import type { Application, ListApplicationsParams } from '../types/application.types';

/** Filtros del listado: todo `ListApplicationsParams` salvo la paginación. */
export type ApplicationFilters = Omit<ListApplicationsParams, 'page' | 'limit'>;

export interface UseApplicationsResult
  extends Omit<UsePaginatedListResult<Application>, 'items'> {
  applications: Application[];
}

/**
 * Carga el listado de postulaciones, página a página, y expone su estado.
 *
 * La paginación la lleva `usePaginatedList`: aquí solo se dice qué servicio
 * llamar y qué mensaje mostrar si falla. Al eliminar la última ficha de la
 * última página, el hook retrocede solo a la anterior.
 *
 * Los filtros se pasan como argumento y, al cambiar, devuelven el listado a la
 * primera página. `projectId` es el que usa la pantalla de solicitantes de un
 * proyecto; `status: 'approved'` sería la lista de beneficiarios, que no tiene
 * endpoint propio porque es este mismo listado filtrado.
 */
export const useApplications = (filters: ApplicationFilters = {}): UseApplicationsResult => {
  const { items, ...pagination } = usePaginatedList<Application, ApplicationFilters>({
    fetcher: applicationService.list,
    filters,
    errorMessage: 'No se pudieron cargar los solicitantes.',
  });

  return { applications: items, ...pagination };
};
