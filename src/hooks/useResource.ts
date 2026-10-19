import { useCallback, useEffect, useRef, useState } from 'react';
import { getFriendlyErrorMessage } from '../constants/apiErrorMessages';

export interface UseResourceResult<T> {
  /** El recurso, o `null` mientras carga o si la petición falló. */
  data: T | null;
  isLoading: boolean;
  error: string | null;
  /** Vuelve a pedirlo (tras guardar, o al reintentar después de un error). */
  refresh: () => void;
}

/**
 * Carga **un** recurso por id y expone su estado. Es el equivalente de
 * `usePaginatedList` para el detalle: mismo criterio de descartar respuestas
 * atrasadas, misma traducción de errores al español.
 *
 * Existe porque las pantallas que abren un formulario por URL
 * (`/proyectos/:id/solicitantes/:aid/editar`) no llegan con la fila ya cargada
 * como sí llegan los modales del listado: hay que pedirla, y un recargado de
 * página o un enlace pegado tienen que funcionar igual.
 *
 * `id` nulo significa "todavía no hay nada que pedir" (una ruta de creación,
 * por ejemplo): no lanza petición y deja de cargar.
 *
 * @example
 * const { data: project, isLoading } = useResource(
 *   projectService.getById,
 *   projectId,
 *   'No se pudo cargar el proyecto.',
 * );
 */
export const useResource = <T>(
  fetcher: (id: string) => Promise<T>,
  id: string | null | undefined,
  errorMessage: string,
): UseResourceResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);
  /** Se incrementa en cada `refresh()` para volver a disparar el efecto. */
  const [reloadToken, setReloadToken] = useState(0);

  const fetcherRef = useRef(fetcher);
  /** Identifica la petición en curso; descarta las respuestas atrasadas. */
  const requestIdRef = useRef(0);

  // La función suele redefinirse en cada render de quien usa el hook, así que
  // se sincroniza en un efecto (React 19 prohíbe escribir refs en el render) y
  // antes del efecto que pide los datos, que es quien la lee.
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    if (!id) {
      // El estado se ajusta de forma síncrona a propósito, igual que en
      // `usePaginatedList`: sin esto el esqueleto de carga se quedaría puesto
      // en una ruta que no tiene nada que pedir. De ahí el disable puntual,
      // que la regla solo marca en el primer setState del efecto.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData(null);
      setIsLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);

    const run = async () => {
      try {
        const result = await fetcherRef.current(id);
        // Llegó tarde: ya hay una petición más nueva en curso.
        if (requestId !== requestIdRef.current) return;
        setData(result);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setError(getFriendlyErrorMessage(err, errorMessage));
        setData(null);
      } finally {
        if (requestId === requestIdRef.current) setIsLoading(false);
      }
    };

    void run();
  }, [id, reloadToken, errorMessage]);

  const refresh = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  return { data, isLoading, error, refresh };
};
