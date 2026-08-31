/** Filas por página por defecto en los listados. */
export const DEFAULT_PAGE_SIZE = 10;

/** Valores ofrecidos en el selector de "filas por página". */
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

/** Marca un salto de páginas en la lista de botones ("…"). */
export const ELLIPSIS = 'ellipsis' as const;

export type PageItem = number | typeof ELLIPSIS;

/**
 * Páginas a mostrar en los controles: siempre la primera y la última, las
 * `siblings` vecinas de la actual, y `ELLIPSIS` donde se corta la secuencia.
 *
 * Con `siblings = 1` y 20 páginas, estando en la 9: `1 … 8 9 10 … 20`.
 *
 * Vive fuera del componente para poder probarse aparte y porque exportarla
 * desde el .tsx rompe el fast refresh de Vite.
 */
export function buildPageItems(page: number, totalPages: number, siblings = 1): PageItem[] {
  // Sin cortes: cabe todo (primera + última + actual + vecinas + dos "…").
  if (totalPages <= siblings * 2 + 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const start = Math.max(page - siblings, 1);
  const end = Math.min(page + siblings, totalPages);
  const items: PageItem[] = [];

  // El "…" solo compensa si oculta más de una página; si oculta exactamente
  // una, se muestra esa página y queda más claro.
  if (start > 1) {
    items.push(1);
    if (start > 3) items.push(ELLIPSIS);
    else if (start === 3) items.push(2);
  }

  for (let current = start; current <= end; current += 1) items.push(current);

  if (end < totalPages) {
    if (end < totalPages - 2) items.push(ELLIPSIS);
    else if (end === totalPages - 2) items.push(totalPages - 1);
    items.push(totalPages);
  }

  return items;
}
