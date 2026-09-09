import type { SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
  /** Texto de la opción inicial deshabilitada (placeholder). */
  placeholder?: string;
}

/**
 * Select estilizado, consistente con el componente Input. La opción
 * placeholder queda deshabilitada para forzar una selección explícita.
 */
export const Select = ({
  label,
  options,
  error,
  placeholder,
  id,
  className = '',
  ...props
}: SelectProps) => {
  const selectId = id || props.name || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      <label
        htmlFor={selectId}
        className="block text-sm font-medium text-gray-700 mb-1.5"
      >
        {label}
        {/* El asterisco es solo visual; la obligatoriedad la marca `required`. */}
        {props.required && <span className="text-error"> *</span>}
      </label>
      <select
        id={selectId}
        className={`
          w-full px-3 py-2.5 rounded-lg border bg-white text-gray-900 text-sm
          focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary
          transition-colors
          ${error ? 'border-error focus:border-error focus:ring-error/20' : 'border-gray-300'}
          ${className}
        `}
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
      </select>
      {error && <p className="mt-1.5 text-xs text-error">{error}</p>}
    </div>
  );
};
