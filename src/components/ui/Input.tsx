import { useState } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'color' | 'size'> {
  label: string;
  icon?: ReactNode;
  error?: string;
  type?: 'text' | 'email' | 'password';
}

const EyeIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeOffIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
    />
  </svg>
);

/**
 * Campo de texto de la aplicación, sobre el `TextField` de MUI.
 *
 * Mantiene su API previa: `error` es el mensaje (no un booleano) y `type`
 * admite solo los tres tipos que usa la app. Los campos de contraseña siguen
 * trayendo el botón de mostrar/ocultar.
 */
export const Input = ({
  label,
  icon,
  error,
  type = 'text',
  id,
  maxLength,
  ...props
}: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || props.name || label.toLowerCase().replace(/\s+/g, '-');

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <TextField
      id={inputId}
      label={label}
      type={inputType}
      error={Boolean(error)}
      helperText={error}
      slotProps={{
        // La etiqueta se mantiene siempre arriba. MUI solo la sube cuando el
        // campo tiene valor, así que con un `placeholder` visible las dos se
        // pisarían; además deja los formularios como estaban antes de MUI,
        // con la etiqueta encima del campo.
        inputLabel: { shrink: true },
        input: {
          startAdornment: icon ? (
            <InputAdornment position="start">{icon}</InputAdornment>
          ) : undefined,
          endAdornment: isPassword ? (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword((prev) => !prev)}
                edge="end"
                size="small"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? EyeOffIcon : EyeIcon}
              </IconButton>
            </InputAdornment>
          ) : undefined,
        },
        // `maxLength` es un atributo del <input>, no del campo de MUI: si se
        // pasara en la raíz se perdería sin aviso y el límite dejaría de
        // aplicarse.
        htmlInput: { maxLength },
      }}
      {...props}
    />
  );
};
