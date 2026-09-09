import TextField from '@mui/material/TextField';
import type { ChangeEvent } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

/**
 * Props declaradas una a una en vez de heredar `SelectHTMLAttributes`: MUI
 * tipa los manejadores de su raíz contra un `<div>`, así que reenviar el bag
 * de atributos de un `<select>` choca en cada evento del DOM.
 */
interface SelectProps {
  label: string;
  options: SelectOption[];
  error?: string;
  /** Texto de la opción inicial deshabilitada (placeholder). */
  placeholder?: string;
  id?: string;
  name?: string;
  value?: string;
  disabled?: boolean;
  required?: boolean;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
  /** Marca el campo como ocupado mientras se cargan sus opciones. */
  'aria-busy'?: boolean;
  className?: string;
}

/**
 * Desplegable de la aplicación, sobre el `TextField` de MUI en modo `select`.
 *
 * Usa el `<select>` **nativo** (`native: true`) a propósito: el desplegable
 * propio de MUI emite un evento sintético con otra forma, y la cascada
 * geográfica y los formularios leen `event.target.value` de un evento nativo.
 * Además, en móvil el nativo abre el selector del sistema.
 */
export const Select = ({
  label,
  options,
  error,
  placeholder,
  id,
  onChange,
  ...props
}: SelectProps) => {
  const selectId = id || props.name || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <TextField
      select
      id={selectId}
      label={label}
      error={Boolean(error)}
      helperText={error}
      slotProps={{
        select: { native: true },
        // Imprescindible con `select` nativo: sin esto la etiqueta se quedaría
        // abajo, encima de la opción visible.
        inputLabel: { shrink: true },
      }}
      // Con `native` el evento procede de un <select> real, así que el destino
      // es un HTMLSelectElement aunque MUI lo tipe como input.
      onChange={(event) => onChange?.(event as unknown as ChangeEvent<HTMLSelectElement>)}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </TextField>
  );
};
