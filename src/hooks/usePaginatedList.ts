import { useCallback, useEffect, useRef, useState } from 'react';
import { getFriendlyErrorMessage } from '../constants/apiErrorMessages';
import { DEFAULT_PAGE_SIZE } from '../utils/pagination';
import type { PaginationMeta } from '../types/api.types';

/**
 * Respuesta mínima que debe devolver el servicio: las filas y los metadatos.
 *
 * Encaja tanto con `PagedEnvelope` (proyectos, geografía, entidades) como con
 * `PaginatedResponse` (usuarios, auth), porque ambos exponen `data` y `meta`;
 * el `success` extra del segundo sobra pero no estorba.
 */
export interface PagedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

/** Parámetros que el hook inyecta al servicio en cada petición. */
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface UsePaginatedListOptions<T, F extends object = object> {
  /** Función del servicio que hace la petición, p. ej. `projectService.list`. */
  fetcher: (params: F & PaginationParams) => Promise<PagedResult<T>>;
  /**
   * Filtros del listado (search, sortBy, role…). Se comparan por su forma
   * serializada, así que puedes pasar un objeto literal en línea sin provocar
   * un bucle de peticiones. Cambiarlos devuelve el listado a la página 1.
   */
  filters?: F;
  initialPage?: number;
  initialLimit?: number;
  /** Mensaje mostrado si la petición falla y el error no tiene código conocido. */
  errorMessage?: string;
  /**
   * Traductor del error a texto presentable. Por defecto
   * `getFriendlyErrorMessage`, que siempre responde en español.
   */
  getErrorMessage?: (error: unknown, fallback: string) => string;
}

export interface UsePaginatedListResult<T> {
  items: T[];
  /** Metadatos de la última respuesta. `null` hasta que llega la primera. */
  meta: PaginationMeta | null;
  page: number;
  limit: number;
  isLoading: boolean;
  error: string | null;
  /** Navega a una página. Se acota al rango válido conocido. */
  goToPage: (page: number) => void;
  /** Cambia las filas por página y vuelve a la página 1. */
  changeLimit: (limit: number) => void;
  /** Recarga la página actual (tras crear, editar o eliminar). */
  refresh: () => void;
}

/**
 * Estado de un listado paginado en servidor: pide la página al backend, guarda
 * su `meta` y expone la navegación. Es agnóstico del recurso, así que sirve
 * para proyectos, usuarios, beneficiarios o cualquier endpoint que responda
 * `{ data, meta }`.
 *
 * Resuelve tres cosas que se rompen si cada módulo lo escribe a mano:
 *
 *  - **Respuestas fuera de orden.** Al pulsar rápido varias páginas, la más
 *    lenta puede llegar la última y pintar datos viejos; solo se acepta la
 *    respuesta de la petición más reciente.
 *  - **Páginas que dejan de existir.** Si borras el último registro de la
 *    última página, el backend responde vacío; aquí se retrocede solo a la
 *    última página con datos.
 *  - **Filtros y paginación descoordinados.** Buscar estando en la página 7
 *    devolvería vacío; cambiar los filtros vuelve a la 1 sin pedir la 7 antes.
 *
 * @example
 * const { items, meta, page, goToPage } = usePaginatedList({
 *   fetcher: projectService.list,
 *   filters: { search },
 * });
 */
export const usePaginatedList = <T, F extends object = object>({
  fetcher,
  filters,
  initialPage = 1,
  initialLimit = DEFAULT_PAGE_SIZE,
  errorMessage = 'No se pudo cargar el listado.',
  getErrorMessage = getFriendlyErrorMessage,
}: UsePaginatedListOptions<T, F>): UsePaginatedListResult<T> => {
  const [items, setItems] = useState<T[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** Se incrementa en cada `refresh()` para volver a disparar el efecto. */
  const [reloadToken, setReloadToken] = useState(0);

  // Los filtros se comparan serializados: así el efecto no depende de la
  // identidad del objeto, que cambia en cada render del componente que lo usa.
  const filtersKey = JSON.stringify(filters ?? {});

  const fetcherRef = useRef(fetcher);
  const getErrorMessageRef = useRef(getErrorMessage);
  const metaRef = useRef<PaginationMeta | null>(null);
  /** Identifica la petición en curso; descarta las respuestas atrasadas. */
  const requestIdRef = useRef(0);

  // Las funciones que llegan por opciones suelen redefinirse en cada render, y
  // `meta` lo necesita `goToPage` sin depender de él. Se sincronizan aquí, en
  // un efecto (React 19 prohíbe escribir refs durante el render) y antes del
  // efecto que pide los datos, que es quien las lee.
  useEffect(() => {
    fetcherRef.current = fetcher;
    getErrorMessageRef.current = getErrorMessage;
    metaRef.current = meta;
  });

  // Los filtros cambiaron: la página actual ya no tiene sentido y el listado
  // vuelve a la 1. Se ajusta durante el render (el patrón que recomienda React
  // para derivar estado de las props) en vez de dentro del efecto: así React
  // descarta este render y solo se pide una página, la 1, en vez de pedir
  // primero la vieja y luego la nueva.
  const [lastFiltersKey, setLastFiltersKey] = useState(filtersKey);
  if (lastFiltersKey !== filtersKey) {
    setLastFiltersKey(filtersKey);
    setPage(1);
  }

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    // El estado de carga se activa de forma síncrona a propósito, para que el
    // esqueleto de la tabla aparezca también al cambiar de página; de ahí el
    // disable puntual de la regla (mismo criterio que el resto de los hooks).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError(null);

    const run = async () => {
      try {
        const params = {
          ...(JSON.parse(filtersKey) as F),
          page,
          limit,
        } as F & PaginationParams;
        const result = await fetcherRef.current(params);
        // Llegó tarde: ya hay una petición más nueva en curso.
        if (requestId !== requestIdRef.current) return;

        setItems(result.data);
        setMeta(result.meta);
        metaRef.current = result.meta;

        // La página pedida quedó fuera de rango (típico al eliminar el último
        // registro de la última página): se retrocede y el efecto reintenta,
        // por eso aquí no se apaga el estado de carga.
        if (result.meta.totalPages > 0 && page > result.meta.totalPages) {
          setPage(result.meta.totalPages);
          return;
        }
        setIsLoading(false);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setError(getErrorMessageRef.current(err, errorMessage));
        setItems([]);
        setIsLoading(false);
      }
    };

    void run();
  }, [page, limit, filtersKey, reloadToken, errorMessage]);

  const goToPage = useCallback((next: number) => {
    // Sin `meta` todavía no se conoce el máximo; se acepta lo pedido.
    const max = metaRef.current?.totalPages ?? next;
    setPage(Math.min(Math.max(next, 1), Math.max(max, 1)));
  }, []);

  const changeLimit = useCallback((next: number) => {
    setLimit(next);
    setPage(1);
  }, []);

  const refresh = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  return { items, meta, page, limit, isLoading, error, goToPage, changeLimit, refresh };
};
