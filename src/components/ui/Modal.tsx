import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  /** Controla la visibilidad. */
  open: boolean;
  /** Se invoca al cerrar (Esc, click en el overlay o botón ✕). */
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  /** Zona de acciones (botones) al pie del modal. */
  footer?: ReactNode;
  /** Ancho máximo del panel. */
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
} as const;

/**
 * Modal genérico y reutilizable: overlay, cierre con Esc / click fuera y
 * bloqueo del scroll del fondo mientras está abierto. Sirve para formularios
 * (crear/editar) y confirmaciones en cualquier módulo.
 */
export const Modal = ({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}: ModalProps) => {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    // Evita que el contenido de fondo se desplace mientras el modal está abierto.
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* `max-h` + columna: la cabecera y el pie quedan fijos y solo el cuerpo
          se desplaza cuando el contenido no cabe (p. ej. un formulario largo). */}
      <div
        className={`relative flex max-h-[90vh] w-full flex-col ${sizeMap[size]} rounded-xl bg-white shadow-xl`}
      >
        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <div className="flex flex-shrink-0 justify-end gap-3 border-t border-gray-200 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
