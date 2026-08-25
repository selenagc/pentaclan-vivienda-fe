import type { ReactNode } from 'react';

interface SeccionFormularioProps {
  /** Número del paso, tal como se ve en el círculo del mockup. */
  numero: number;
  titulo: string;
  children: ReactNode;
  /** Dibuja la línea divisoria superior. La primera sección no la lleva. */
  conSeparador?: boolean;
}

/**
 * Bloque numerado del formulario de proyecto: círculo con el número, título y
 * contenido. Se repite tres veces (Información, Ubicación, Entidad).
 */
export const SeccionFormulario = ({
  numero,
  titulo,
  children,
  conSeparador = true,
}: SeccionFormularioProps) => (
  <section className={conSeparador ? 'border-t border-gray-200 pt-6' : ''}>
    <div className="mb-5 flex items-center gap-3">
      <span
        aria-hidden="true"
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-primary text-xs font-semibold text-white"
      >
        {numero}
      </span>
      <h3 className="text-base font-semibold text-gray-900">{titulo}</h3>
    </div>
    {children}
  </section>
);
