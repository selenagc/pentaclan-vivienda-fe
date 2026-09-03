import { useCallback, useEffect, useState } from 'react';
import { publicEntityService } from '../services/publicEntityService';
import { getFriendlyErrorMessage } from '../constants/apiErrorMessages';
import type { PublicEntity } from '../types/publicEntity.types';

export interface UsePublicEntitiesResult {
  publicEntities: PublicEntity[];
  isLoading: boolean;
  /** Mensaje ya traducido al español, o `null` si no hubo error. */
  error: string | null;
  /** Vuelve a pedir el catálogo (la caché no guarda fallos). */
  retry: () => void;
  /** `true` cuando cargó bien y el backend devolvió una lista vacía. */
  isEmpty: boolean;
}

/**
 * Carga el catálogo de entidades públicas.
 *
 * El catálogo es pequeño e inmutable durante la sesión, así que se pide entero
 * de una vez y la caché del servicio evita repetir la petición aunque el hook
 * se monte varias veces.
 *
 * Un catálogo vacío (`data: []`) es un estado legítimo —significa que no se ha
 * sembrado—, no un error: por eso `isEmpty` va aparte de `error`.
 */
export const usePublicEntities = (): UsePublicEntitiesResult => {
  const [publicEntities, setPublicEntities] = useState<PublicEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    publicEntityService
      .list()
      .then((items) => {
        if (cancelled) return;
        setPublicEntities(items);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setPublicEntities([]);
        setError(getFriendlyErrorMessage(err, 'No se pudieron cargar las entidades públicas.'));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // `attempt` es la dependencia real: cambiarlo es lo que dispara el reintento.
  }, [attempt]);

  const retry = useCallback(() => {
    setIsLoading(true);
    setAttempt((prev) => prev + 1);
  }, []);

  return {
    publicEntities,
    isLoading,
    error,
    retry,
    isEmpty: !isLoading && error === null && publicEntities.length === 0,
  };
};
