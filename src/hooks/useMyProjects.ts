import { useCallback, useEffect, useRef, useState } from 'react';
import { projectService } from '../services/projectService';
import { getFriendlyErrorMessage } from '../constants/apiErrorMessages';
import type { Project } from '../types/project.types';

export interface UseMyProjectsResult {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Carga los proyectos asignados al usuario autenticado (PV-35).
 * Maneja estados de carga, errores y descarte de peticiones obsoletas.
 */
export const useMyProjects = (): UseMyProjectsResult => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const requestIdRef = useRef(0);

  const refetch = useCallback(() => {
    setReloadToken((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);

    projectService
      .getMyProjects()
      .then((data) => {
        if (requestId !== requestIdRef.current) return;
        setProjects(data ?? []);
      })
      .catch((err) => {
        if (requestId !== requestIdRef.current) return;
        setError(getFriendlyErrorMessage(err, 'No se pudieron cargar los proyectos asignados.'));
      })
      .finally(() => {
        if (requestId !== requestIdRef.current) return;
        setIsLoading(false);
      });
  }, [reloadToken]);

  return { projects, isLoading, error, refetch };
};
