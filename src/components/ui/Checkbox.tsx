import type { InputHTMLAttributes } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export const Checkbox = ({ label, id, ...props }: CheckboxProps) => {
  const inputId = id || props.name || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <label htmlFor={inputId} className="inline-flex items-center cursor-pointer select-none">
      <input
        id={inputId}
        type="checkbox"
        className="
          w-4 h-4 rounded border-gray-300 text-brand-primary
          focus:ring-brand-primary/30 focus:ring-2 focus:ring-offset-0
          cursor-pointer
        "
        {...props}
      />
      <span className="ml-2 text-sm text-gray-700">{label}</span>
    </label>
  );
};
