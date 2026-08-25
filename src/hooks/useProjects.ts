import { useCallback, useEffect, useState } from 'react';
import { projectService } from '../services/projectService';
import { getFriendlyErrorMessage } from '../constants/apiErrorMessages';
import type { Project } from '../types/project.types';

/**
 * Carga el listado de proyectos y expone su estado.
 *
 * La paginación, el orden y la búsqueda se difieren a su propio ticket: el
 * backend ya los soporta, pero por ahora se pide `limit: 100` (máximo del
 * backend) para mostrar el listado completo, igual que `useUsers`.
 */
export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await projectService.list({ limit: 100 });
      setProjects(data);
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'No se pudieron cargar los proyectos.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Carga inicial. `fetchProyectos` activa el estado de carga de forma
    // síncrona (a propósito, para mostrar el skeleton también al refrescar);
    // ese reset es seguro aquí, de ahí el disable puntual de la regla.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjects();
  }, [fetchProjects]);

  return { projects, isLoading, error, refresh: fetchProjects };
};
