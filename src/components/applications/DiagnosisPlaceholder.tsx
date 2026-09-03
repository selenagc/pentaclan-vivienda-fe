interface DiagnosisPlaceholderProps {
  title: string;
  /** Quién lo levanta en campo, que es lo que distingue a los dos. */
  description: string;
}

/**
 * Panel de un diagnóstico todavía sin implementar.
 *
 * Las dos pestañas —social y técnico— se montan desde ahora, vacías, en vez de
 * esperar a su ticket: reservan el sitio en la ficha, dejan ver de entrada que
 * la evaluación tiene esas dos mitades, y cuando lleguen los formularios solo
 * hay que rellenar el panel sin volver a mover la navegación.
 */
export const DiagnosisPlaceholder = ({ title, description }: DiagnosisPlaceholderProps) => (
  <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">{description}</p>
    <p className="mt-4 text-xs text-gray-400">
      Esta sección se habilitará en su propio ticket.
    </p>
  </div>
);
