import Box from '@mui/material/Box';
import MuiPagination from '@mui/material/Pagination';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { PAGE_SIZE_OPTIONS } from '../../utils/pagination';

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

/**
 * Etiquetas accesibles en español. MUI las genera en inglés ("Go to page 3"),
 * que es lo que leería el lector de pantalla si no se traducen.
 */
const itemAriaLabel = (type: string, page: number | null, selected: boolean): string => {
  if (type === 'previous') return 'Página anterior';
  if (type === 'next') return 'Página siguiente';
  if (type === 'first') return 'Primera página';
  if (type === 'last') return 'Última página';
  return selected ? `Página ${page}, actual` : `Ir a la página ${page}`;
};

/**
 * Controles de paginación reutilizables: resumen de registros, selector de
 * filas por página y navegación numerada (los saltos con "…" los calcula MUI).
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

  return (
    <Box
      className={className}
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* `aria-live` avisa al lector de pantalla del cambio de página. */}
        <Typography variant="body2" color="text.secondary" aria-live="polite">
          Mostrando {firstRow}–{lastRow} de {total} {noun}
        </Typography>

        {onLimitChange && (
          <TextField
            select
            size="small"
            label="Filas"
            value={limit}
            disabled={isLoading}
            onChange={(event) => onLimitChange(Number(event.target.value))}
            slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
            sx={{ width: 96 }}
          >
            {limitOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </TextField>
        )}
      </Box>

      {totalPages > 1 && (
        <MuiPagination
          count={totalPages}
          page={page}
          onChange={(_, value) => onPageChange(value)}
          color="primary"
          shape="rounded"
          disabled={isLoading}
          getItemAriaLabel={itemAriaLabel}
        />
      )}
    </Box>
  );
};
