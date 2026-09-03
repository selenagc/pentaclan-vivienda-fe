import { useCallback, useEffect, useState } from 'react';
import { geographyService } from '../services/geographyService';
import { getFriendlyErrorMessage } from '../constants/apiErrorMessages';
import type {
  Department,
  GeoSelection,
  Municipality,
  Province,
} from '../types/geography.types';

/** Estado de carga de uno de los tres niveles de la cascada. */
export interface GeoLevel<T> {
  items: T[];
  isLoading: boolean;
  /** Mensaje ya traducido, o `null` si no hubo error. */
  error: string | null;
  /** Vuelve a pedir el nivel al backend (la caché no guarda fallos). */
  retry: () => void;
  /** `true` cuando cargó bien y el backend devolvió una lista vacía. */
  isEmpty: boolean;
}

export interface UseGeographyResult {
  departments: GeoLevel<Department>;
  provinces: GeoLevel<Province>;
  municipalities: GeoLevel<Municipality>;
}

/**
 * Resultado de la última petición resuelta. `key` identifica a qué petición
 * corresponde: mientras no coincida con la actual, el nivel está cargando.
 */
interface LevelResult<T> {
  key: string | null;
  items: T[];
  error: string | null;
}

const emptyResult = { key: null, items: [], error: null };

/**
 * Carga un nivel de la cascada.
 *
 * `parentId` es la clave de la que depende el nivel: `null` significa "todavía
 * no hay padre elegido" y deja el nivel vacío sin pedir nada.
 *
 * El estado de carga se **deriva** comparando la petición vigente con la
 * última resuelta, en lugar de escribirse con un `setState` dentro del efecto.
 * Así el efecto solo actualiza estado desde sus callbacks asíncronos, que es
 * el uso que React recomienda.
 */
const useGeoLevel = <T,>(
  parentId: number | null,
  load: (parentId: number) => Promise<T[]>,
  fallbackMessage: string,
): GeoLevel<T> => {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<LevelResult<T>>(emptyResult);

  // Identifica la petición vigente. Incluye `attempt` para que un reintento
  // cuente como petición nueva aunque el padre no haya cambiado.
  const requestKey = parentId === null ? null : `${parentId}:${attempt}`;

  useEffect(() => {
    if (parentId === null) return;

    let cancelled = false;

    load(parentId)
      .then((items) => {
        if (!cancelled) setResult({ key: requestKey, items, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setResult({
            key: requestKey,
            items: [],
            error: getFriendlyErrorMessage(err, fallbackMessage),
          });
        }
      });

    // Descarta la respuesta si el padre cambió mientras la petición estaba en
    // vuelo, para que no pise a la del padre nuevo.
    return () => {
      cancelled = true;
    };
    // `load` y `fallbackMessage` se omiten a propósito: cambian de identidad en
    // cada render y `requestKey` ya representa la petición real (padre + intento).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  const retry = useCallback(() => setAttempt((prev) => prev + 1), []);

  // Solo se muestran los datos si corresponden a la petición vigente; si no,
  // el nivel sigue cargando (o está inactivo por no tener padre).
  const isResolved = result.key === requestKey;
  const items = isResolved ? result.items : [];
  const error = isResolved ? result.error : null;
  const isLoading = parentId !== null && !isResolved;

  return {
    items,
    isLoading,
    error,
    retry,
    isEmpty: !isLoading && error === null && items.length === 0,
  };
};

/** Clave fija de los departamentos: no dependen de ningún padre. */
const NO_PARENT = 0;

/**
 * Carga los tres niveles del catálogo geográfico en función de la selección
 * actual. No es dueño de la selección (eso lo lleva el componente que lo usa):
 * solo reacciona a ella pidiendo lo que corresponde.
 *
 * Cada nivel se pide una sola vez por padre gracias a la caché del servicio,
 * aunque el hook se monte varias veces.
 */
export const useGeography = (selection: GeoSelection): UseGeographyResult => {
  const departments = useGeoLevel<Department>(
    NO_PARENT,
    () => geographyService.listDepartments(),
    'No se pudieron cargar los departamentos.',
  );

  const provinces = useGeoLevel<Province>(
    selection.departmentId,
    (id) => geographyService.listProvinces(id),
    'No se pudieron cargar las provincias.',
  );

  const municipalities = useGeoLevel<Municipality>(
    selection.provinceId,
    (id) => geographyService.listMunicipalities(id),
    'No se pudieron cargar los municipios.',
  );

  return { departments, provinces, municipalities };
};
