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

const alignMap = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const;

/**
 * Tabla genérica y reutilizable. La presentación (columnas, render de celdas,
 * estados de carga y vacío) se controla por props para que el mismo componente
 * sirva en Proyectos, Beneficiarios, Reportes, etc.
 *
 * El ordenamiento y la paginación se incorporarán en sus propios tickets.
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
    <div
      className={`overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}
    >
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-4 py-3 font-medium text-gray-600 ${
                  alignMap[column.align ?? 'left']
                } ${column.className ?? ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            <TableSkeleton columns={columns} />
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => {
              const clickable = Boolean(onRowClick);
              return (
                <tr
                  key={resolveRowKey(row, index)}
                  onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                  className={`border-b border-gray-100 last:border-0 transition-colors ${
                    clickable
                      ? 'cursor-pointer hover:bg-brand-primary/5'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-3 text-gray-700 ${
                        alignMap[column.align ?? 'left']
                      } ${column.className ?? ''}`}
                    >
                      {resolveCell(column, row, index)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

interface TableSkeletonProps<T> {
  columns: Column<T>[];
}

/** Filas de esqueleto mostradas mientras `isLoading` es verdadero. */
function TableSkeleton<T>({ columns }: TableSkeletonProps<T>) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-gray-100 last:border-0">
          {columns.map((column) => (
            <td key={column.key} className="px-4 py-3">
              <div className="h-4 w-full max-w-[160px] animate-pulse rounded bg-gray-200" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
