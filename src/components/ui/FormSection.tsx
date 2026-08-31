import type { ReactNode } from 'react';

interface FormSectionProps {
  /** Número del paso, tal como se ve en el círculo. */
  stepNumber: number;
  title: string;
  children: ReactNode;
  /** Dibuja la línea divisoria superior. La primera sección no la lleva. */
  withDivider?: boolean;
}

/**
 * Bloque numerado de un formulario largo: círculo con el número, título y
 * contenido. Lo usan el formulario de proyecto (Información, Ubicación,
 * Entidad) y el de solicitante (Titular, Cónyuge, Vivienda, Presentación).
 */
export const FormSection = ({
  stepNumber,
  title,
  children,
  withDivider = true,
}: FormSectionProps) => (
  <section className={withDivider ? 'border-t border-gray-200 pt-6' : ''}>
    <div className="mb-5 flex items-center gap-3">
      <span
        aria-hidden="true"
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-primary text-xs font-semibold text-white"
      >
        {stepNumber}
      </span>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
    </div>
    {children}
  </section>
);
