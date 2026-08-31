import { userService } from '../services/userService';
import { getApiErrorMessage } from '../lib/axios';
import { usePaginatedList, type UsePaginatedListResult } from './usePaginatedList';
import type { ListUsersParams, User } from '../types/user.types';

/** Filtros del listado: todo `ListUsersParams` salvo la paginación. */
export type UserFilters = Omit<ListUsersParams, 'page' | 'limit'>;

export interface UseUsersResult extends Omit<UsePaginatedListResult<User>, 'items'> {
  users: User[];
}

/**
 * Carga el listado de usuarios, página a página, y expone su estado.
 *
 * `refresh()` recarga la página actual, que es lo que necesitan los modales de
 * crear/editar/eliminar. Al borrar el último registro de la última página,
 * `usePaginatedList` retrocede solo a la anterior.
 */
export const useUsers = (filters: UserFilters = {}): UseUsersResult => {
  const { items, ...pagination } = usePaginatedList<User, UserFilters>({
    fetcher: userService.list,
    filters,
    errorMessage: 'No se pudieron cargar los usuarios.',
    // Este módulo ya mostraba el texto crudo del backend; se mantiene.
    getErrorMessage: getApiErrorMessage,
  });

  return { users: items, ...pagination };
};
