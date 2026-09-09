import { DiagnosisPlaceholder } from '../components/applications/DiagnosisPlaceholder';
import { useApplicationOutlet } from '../components/applications/applicationOutlet';

const iconClass = 'h-7 w-7';

const SocialIcon = (
  <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72M18 18.72a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
  </svg>
);

const TechnicalIcon = (
  <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
  </svg>
);

const COPY = {
  social: {
    title: 'Diagnóstico social',
    icon: SocialIcon,
    description:
      'La evaluación socioeconómica del hogar: composición familiar, ingresos y condiciones de habitabilidad. La levanta el líder social.',
  },
  technical: {
    title: 'Diagnóstico técnico',
    icon: TechnicalIcon,
    description:
      'El estado constructivo de la vivienda: materiales, instalaciones y las mejoras que requiere. La levanta el líder técnico.',
  },
} as const;

interface ApplicationDiagnosisPageProps {
  kind: keyof typeof COPY;
}

/**
 * Una de las dos fichas de diagnóstico de un beneficiario.
 *
 * Todavía no tiene formulario, pero la pestaña se monta desde ahora para
 * reservar el sitio: su ticket rellenará este panel sin volver a mover la
 * navegación.
 *
 * También cubre el caso de llegar aquí con una ficha que aún no es de un
 * beneficiario —una dirección guardada o escrita a mano—: la barra de pestañas
 * ni siquiera se dibuja para un solicitante, así que en vez de una página rota
 * se explica que los diagnósticos llegan con la aprobación.
 */
export const ApplicationDiagnosisPage = ({ kind }: ApplicationDiagnosisPageProps) => {
  const { application } = useApplicationOutlet();
  const copy = COPY[kind];

  if (application.status !== 'approved') {
    return (
      <DiagnosisPlaceholder
        tone="muted"
        icon={copy.icon}
        title={`${copy.title}: todavía no corresponde`}
        description="Los dos diagnósticos son del beneficiario. Esta ficha sigue en el padrón de solicitantes, así que aún no se puede levantar."
        note="Se habilitan cuando la ficha se aprueba y pasa a beneficiarios."
      />
    );
  }

  return (
    <DiagnosisPlaceholder
      tone={kind}
      icon={copy.icon}
      title={copy.title}
      description={copy.description}
      note="Esta sección se habilitará en su propio ticket."
    />
  );
};

export default ApplicationDiagnosisPage;
