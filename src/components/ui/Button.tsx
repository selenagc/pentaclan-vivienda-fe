import MuiButton, { type ButtonProps as MuiButtonProps } from '@mui/material/Button';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

// Se descarta `color`: es el atributo HTML heredado (y sin efecto en <button>),
// y su tipo `string` chocaría con la paleta tipada de MUI al reenviar props.
interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  variant?: 'primary' | 'outline' | 'danger';
  isLoading?: boolean;
  children: ReactNode;
  icon?: ReactNode;
  /** Ocupa todo el ancho disponible. Por defecto true (botones de formulario). */
  fullWidth?: boolean;
}

/** Traducción de las variantes de la app a las de MUI. */
const variantProps: Record<
  NonNullable<ButtonProps['variant']>,
  Pick<MuiButtonProps, 'variant' | 'color'>
> = {
  primary: { variant: 'contained', color: 'primary' },
  outline: { variant: 'outlined', color: 'primary' },
  danger: { variant: 'contained', color: 'error' },
};

/**
 * Botón de la aplicación, sobre el de MUI.
 *
 * Conserva su API previa (`variant`, `isLoading`, `icon`) en vez de exponer la
 * de MUI: así las tres variantes siguen significando lo mismo en toda la app y
 * cambiar de librería no obliga a repasar cada llamada.
 */
export const Button = ({
  variant = 'primary',
  isLoading = false,
  children,
  icon,
  fullWidth = true,
  disabled,
  ...props
}: ButtonProps) => (
  <MuiButton
    {...variantProps[variant]}
    fullWidth={fullWidth}
    // MUI ya sustituye el icono por el spinner y bloquea el botón mientras
    // carga, así que no hace falta deshabilitarlo a mano.
    loading={isLoading}
    startIcon={icon}
    disabled={disabled}
    {...props}
  >
    {children}
  </MuiButton>
);
