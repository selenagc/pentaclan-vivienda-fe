import MuiTable from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import type { ReactNode } from 'react';

/**
 * Definición de una columna de la tabla.
 *
 * @template T Tipo de cada fila de datos.
 */
export interface Column<T> {
  /** Clave única de la columna (se usa como `key` de React). */
  key: string;
  /** Texto del encabezado. */
  header: ReactNode;
  /**
   * Cómo renderizar la celda. Recibe la fila completa y su índice.
   * Si se omite y `key` coincide con una propiedad de la fila, se muestra
   * directamente ese valor.
   */
  render?: (row: T, index: number) => ReactNode;
  /** Alineación del contenido de la columna. Por defecto `left`. */
  align?: 'left' | 'center' | 'right';
  /** Clases extra para las celdas de esta columna (encabezado y cuerpo). */
  className?: string;
}

interface TableProps<T> {
  /** Definición de columnas, en orden de aparición. */
  columns: Column<T>[];
  /** Filas a mostrar. */
  data: T[];
  /**
   * Identificador único de cada fila. Puede ser una clave de `T` o una
   * función que lo derive. Evita usar el índice como `key` de React.
   */
  rowKey: keyof T | ((row: T, index: number) => string | number);
  /** Muestra el esqueleto de carga en lugar de los datos. */
  isLoading?: boolean;
  /** Mensaje a mostrar cuando no hay filas. */
  emptyMessage?: ReactNode;
  /** Callback al hacer clic en una fila (la vuelve interactiva). */
  onRowClick?: (row: T, index: number) => void;
  /** Clases extra para el contenedor externo. */
  className?: string;
}

/** Filas de esqueleto mostradas mientras `isLoading` es verdadero. */
function TableSkeleton<T>({ columns }: { columns: Column<T>[] }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {columns.map((column) => (
            <TableCell key={column.key}>
              <Skeleton variant="text" width="60%" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

/**
 * Tabla genérica y reutilizable, sobre la de MUI. La presentación (columnas,
 * render de celdas, estados de carga y vacío) se controla por props para que
 * el mismo componente sirva en Proyectos, Beneficiarios, Reportes, etc.
 *
 * No pagina por sí misma: los controles viven en `<Pagination>`, que se coloca
 * debajo y se alimenta de `usePaginatedList`. El ordenamiento se incorporará
 * en su propio ticket.
 */
export function Table<T>({
  columns,
  data,
  rowKey,
  isLoading = false,
  emptyMessage = 'No hay datos para mostrar.',
  onRowClick,
  className = '',
}: TableProps<T>) {
  const resolveRowKey = (row: T, index: number): string | number =>
    typeof rowKey === 'function'
      ? rowKey(row, index)
      : (row[rowKey] as unknown as string | number);

  const resolveCell = (column: Column<T>, row: T, index: number): ReactNode => {
    if (column.render) return column.render(row, index);
    // Si la clave coincide con una propiedad de la fila, la mostramos tal cual.
    const value = (row as Record<string, unknown>)[column.key];
    return value as ReactNode;
  };

  return (
    <TableContainer component={Paper} variant="outlined" className={className}>
      <MuiTable size="small">
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.key}
                align={column.align ?? 'left'}
                className={column.className}
              >
                {column.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {isLoading ? (
            <TableSkeleton columns={columns} />
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow
                key={resolveRowKey(row, index)}
                hover
                onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                sx={onRowClick ? { cursor: 'pointer' } : undefined}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    align={column.align ?? 'left'}
                    className={column.className}
                  >
                    {resolveCell(column, row, index)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </MuiTable>
    </TableContainer>
  );
}
