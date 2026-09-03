import { useCallback, useEffect, useState } from 'react';
import { proyectoService } from '../services/proyectoService';
import { getFriendlyErrorMessage } from '../constants/apiErrorMessages';
import type { Proyecto } from '../types/proyecto.types';

/**
 * Carga el listado de proyectos y expone su estado.
 *
 * La paginación, el orden y la búsqueda se difieren a su propio ticket: el
 * backend ya los soporta, pero por ahora se pide `limit: 100` (máximo del
 * backend) para mostrar el listado completo, igual que `useUsers`.
 */
export const useProyectos = () => {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProyectos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await proyectoService.list({ limit: 100 });
      setProyectos(data);
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
    fetchProyectos();
  }, [fetchProyectos]);

  return { proyectos, isLoading, error, refresh: fetchProyectos };
};
