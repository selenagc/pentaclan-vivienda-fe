import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'danger';
  isLoading?: boolean;
  children: ReactNode;
  icon?: ReactNode;
  /** Ocupa todo el ancho disponible. Por defecto true (botones de formulario). */
  fullWidth?: boolean;
}

export const Button = ({
  variant = 'primary',
  isLoading = false,
  children,
  icon,
  className = '',
  fullWidth = true,
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles =
    'flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-60 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-brand-primary hover:bg-brand-primary-dark text-white shadow-sm hover:shadow-md',
    outline:
      'border border-brand-primary/30 hover:border-brand-primary text-brand-primary hover:bg-brand-primary/5 bg-white',
    danger:
      'bg-error hover:bg-error/90 text-white shadow-sm hover:shadow-md focus:ring-error',
  };

  return (
    <button
      className={`${baseStyles} ${fullWidth ? 'w-full' : ''} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
};
