import { projectService } from '../services/projectService';
import { usePaginatedList, type UsePaginatedListResult } from './usePaginatedList';
import type { ListProjectsParams, Project } from '../types/project.types';

/** Filtros del listado: todo `ListProjectsParams` salvo la paginación. */
export type ProjectFilters = Omit<ListProjectsParams, 'page' | 'limit'>;

export interface UseProjectsResult extends Omit<UsePaginatedListResult<Project>, 'items'> {
  projects: Project[];
}

/**
 * Carga el listado de proyectos, página a página, y expone su estado.
 *
 * La paginación la lleva `usePaginatedList`: aquí solo se le dice qué servicio
 * llamar y qué mensaje mostrar si falla. Los filtros (`search`, `sortBy`,
 * `publicEntityId`…) se pasan como argumento y, al cambiar, devuelven el
 * listado a la primera página.
 */
export const useProjects = (filters: ProjectFilters = {}): UseProjectsResult => {
  const { items, ...pagination } = usePaginatedList<Project, ProjectFilters>({
    fetcher: projectService.list,
    filters,
    errorMessage: 'No se pudieron cargar los proyectos.',
  });

  return { projects: items, ...pagination };
};
