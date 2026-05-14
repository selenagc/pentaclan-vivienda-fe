import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
  isLoading?: boolean;
  children: ReactNode;
  icon?: ReactNode;
}

export const Button = ({
  variant = 'primary',
  isLoading = false,
  children,
  icon,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles =
    'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-60 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-brand-primary hover:bg-brand-primary-dark text-white shadow-sm hover:shadow-md',
    outline:
      'border border-brand-primary/30 hover:border-brand-primary text-brand-primary hover:bg-brand-primary/5 bg-white',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
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
