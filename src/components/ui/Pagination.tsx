import { buildPageItems, ELLIPSIS, PAGE_SIZE_OPTIONS } from '../../utils/pagination';

interface PaginationProps {
  /** Página actual (base 1). */
  page: number;
  /** Total de páginas informado por el backend (`meta.totalPages`). */
  totalPages: number;
  /** Total de registros informado por el backend (`meta.total`). */
  total: number;
  /** Filas por página (`meta.limit`). */
  limit: number;
  onPageChange: (page: number) => void;
  /** Si se pasa, se muestra el selector de filas por página. */
  onLimitChange?: (limit: number) => void;
  /** Valores del selector de filas por página. */
  limitOptions?: readonly number[];
  /** Deshabilita los controles mientras se carga la página. */
  isLoading?: boolean;
  /** Nombre del recurso para el resumen: "de 42 proyectos". */
  itemLabel?: { singular: string; plural: string };
  className?: string;
}

const navButton =
  'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-gray-300 px-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40';

/**
 * Controles de paginación reutilizables: resumen de registros, selector de
 * filas por página y navegación numerada.
 *
 * Es puramente presentacional (no sabe de qué recurso se trata ni pide datos),
 * así que sirve para cualquier listado; el estado lo lleva `usePaginatedList`.
 * No se renderiza si no hay registros.
 */
export const Pagination = ({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
  limitOptions = PAGE_SIZE_OPTIONS,
  isLoading = false,
  itemLabel = { singular: 'registro', plural: 'registros' },
  className = '',
}: PaginationProps) => {
  if (total === 0) return null;

  const firstRow = (page - 1) * limit + 1;
  const lastRow = Math.min(page * limit, total);
  const noun = total === 1 ? itemLabel.singular : itemLabel.plural;
  const pageItems = buildPageItems(page, totalPages);

  return (
    <div
      className={`flex flex-col gap-3 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="flex items-center gap-4">
        {/* `aria-live` avisa al lector de pantalla del cambio de página. */}
        <p aria-live="polite">
          Mostrando <span className="font-medium text-gray-900">{firstRow}</span>–
          <span className="font-medium text-gray-900">{lastRow}</span> de{' '}
          <span className="font-medium text-gray-900">{total}</span> {noun}
        </p>

        {onLimitChange && (
          <label className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-gray-500">Filas</span>
            <select
              value={limit}
              disabled={isLoading}
              onChange={(event) => onLimitChange(Number(event.target.value))}
              className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 transition-colors focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30 disabled:opacity-50"
            >
              {limitOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {totalPages > 1 && (
        <nav aria-label="Paginación" className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={isLoading || page <= 1}
            aria-label="Página anterior"
            className={navButton}
          >
            ‹
          </button>

          {pageItems.map((item, index) =>
            item === ELLIPSIS ? (
              <span
                key={`${ELLIPSIS}-${index}`}
                aria-hidden="true"
                className="px-1.5 text-gray-400"
              >
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                disabled={isLoading}
                aria-label={`Página ${item}`}
                aria-current={item === page ? 'page' : undefined}
                className={
                  item === page
                    ? 'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-brand-primary bg-brand-primary px-2.5 text-sm font-medium text-white'
                    : navButton
                }
              >
                {item}
              </button>
            ),
          )}

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={isLoading || page >= totalPages}
            aria-label="Página siguiente"
            className={navButton}
          >
            ›
          </button>
        </nav>
      )}
    </div>
  );
};
