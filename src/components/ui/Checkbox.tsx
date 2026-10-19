import MuiCheckbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import type { ChangeEvent } from 'react';

/** Props explícitas: la raíz de MUI es un `<label>`, no el `<input>`. */
interface CheckboxProps {
  label: string;
  id?: string;
  name?: string;
  checked?: boolean;
  disabled?: boolean;
  required?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

/** Casilla de verificación con su etiqueta, sobre la de MUI. */
export const Checkbox = ({ label, id, ...props }: CheckboxProps) => {
  const inputId = id || props.name || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <FormControlLabel
      control={<MuiCheckbox id={inputId} size="small" {...props} />}
      label={label}
      slotProps={{ typography: { variant: 'body2' } }}
    />
  );
};
