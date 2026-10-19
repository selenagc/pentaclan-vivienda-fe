import type { ReactNode } from 'react';

/** Color del panel. Distingue los dos diagnósticos entre sí y del aviso. */
export type DiagnosisTone = 'social' | 'technical' | 'muted';

const toneClass: Record<DiagnosisTone, { panel: string; badge: string }> = {
  social: {
    panel: 'border-brand-teal/30 bg-brand-teal/5',
    badge: 'bg-brand-teal/15 text-brand-teal',
  },
  technical: {
    panel: 'border-brand-olive/40 bg-brand-olive/5',
    badge: 'bg-brand-olive/20 text-brand-olive',
  },
  muted: {
    panel: 'border-gray-300 bg-gray-50',
    badge: 'bg-gray-200 text-gray-500',
  },
};

interface DiagnosisPlaceholderProps {
  tone: DiagnosisTone;
  icon: ReactNode;
  title: string;
  description: string;
  /** Letra pequeña al pie: por qué está vacío o qué falta para llenarlo. */
  note: string;
}

/**
 * Panel de un diagnóstico que todavía no se puede llenar.
 *
 * Cubre los dos motivos por los que puede estar vacío: porque la sección no se
 * ha implementado, o porque la ficha aún no es de un beneficiario. En ambos
 * casos se explica, en vez de dejar un recuadro en blanco que parezca un fallo.
 *
 * El color no es adorno: separa de un vistazo el diagnóstico social del
 * técnico, que son dos formularios distintos levantados por dos personas
 * distintas.
 */
export const DiagnosisPlaceholder = ({
  tone,
  icon,
  title,
  description,
  note,
}: DiagnosisPlaceholderProps) => {
  const colors = toneClass[tone];

  return (
    <div className={`rounded-xl border border-dashed p-10 text-center ${colors.panel}`}>
      <span
        aria-hidden="true"
        className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${colors.badge}`}
      >
        {icon}
      </span>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">{description}</p>
      <p className="mt-4 text-xs text-gray-500">{note}</p>
    </div>
  );
};
