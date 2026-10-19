import { useMemo, useState } from 'react';
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import { RouteTabs, type RouteTab } from '../components/ui/RouteTabs';
import {
  ApplicantInfoCard,
  ApplicantInfoCardSkeleton,
} from '../components/applications/ApplicantInfoCard';
import { ConfirmDeleteApplicationModal } from '../components/applications/ConfirmDeleteApplicationModal';
import { ConfirmApproveApplicationModal } from '../components/applications/ConfirmApproveApplicationModal';
import { RejectApplicationModal } from '../components/applications/RejectApplicationModal';
import type {
  ApplicationOutletContext,
  ProjectSection,
} from '../components/applications/applicationOutlet';
import { useResource } from '../hooks/useResource';
import { useAuth } from '../hooks/useAuth';
import { applicationService } from '../services/applicationService';
import {
  CAN_DECIDE_APPLICATIONS,
  CAN_WRITE_APPLICATIONS,
  DECIDABLE_STATUSES,
} from '../constants/applications';

const BackIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

const SECTION_LABELS: Record<ProjectSection, string> = {
  solicitantes: 'solicitantes',
  beneficiarios: 'beneficiarios',
};

interface ApplicationDetailPageProps {
  /** Pestaña desde la que se entró: fija a dónde vuelve y cuál queda marcada. */
  section: ProjectSection;
}

/**
 * Ficha de una postulación, dentro del contenedor del proyecto.
 *
 * **Las pestañas dependen del estado.** Un solicitante tiene solo sus datos:
 * lo que se capturó al registrarlo. Los dos diagnósticos —social y técnico—
 * son del beneficiario, es decir de la ficha ya aprobada, así que hasta
 * entonces no se muestran: ofrecerlos antes daría a entender que se pueden
 * levantar, y el trámite no funciona así.
 *
 * Con una sola sección tampoco se dibuja la barra de pestañas: una pestaña
 * suelta no navega a ningún sitio y solo añade ruido.
 *
 * La ficha se pide **una vez, aquí**, y baja a las pestañas por el contexto
 * del `<Outlet />`: cambiar de pestaña no repite la petición.
 *
 * Aquí viven también las dos decisiones. Al aprobar, la ficha deja de
 * pertenecer a *solicitantes* y pasa a *beneficiarios*, así que se lleva al
 * usuario a la misma ficha bajo esa otra pestaña: es donde va a encontrarla a
 * partir de ahora, y es lo que hace aparecer los dos diagnósticos. Rechazar no
 * la mueve —un rechazado sigue siendo un solicitante— y solo la recarga.
 */
export const ApplicationDetailPage = ({ section }: ApplicationDetailPageProps) => {
  const { projectId, applicationId } = useParams<{
    projectId: string;
    applicationId: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';
  const canWrite = CAN_WRITE_APPLICATIONS.includes(
    user?.role as (typeof CAN_WRITE_APPLICATIONS)[number],
  );

  const listPath = `/proyectos/${projectId}/${section}`;
  const basePath = `${listPath}/${applicationId}`;

  const { data: application, isLoading, error, refresh } = useResource(
    applicationService.getById,
    applicationId,
    'No se pudo cargar la ficha.',
  );

  const [isDeleting, setIsDeleting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const isBeneficiary = application?.status === 'approved';

  // Decidir necesita el rol **y** que la ficha siga abierta: sobre una ya
  // decidida el backend responde 409, así que ofrecer el botón sería prometer
  // algo que va a fallar.
  const canDecide =
    CAN_DECIDE_APPLICATIONS.includes(user?.role as (typeof CAN_DECIDE_APPLICATIONS)[number]) &&
    Boolean(application && DECIDABLE_STATUSES.includes(application.status));

  const tabs = useMemo<RouteTab[]>(
    () =>
      isBeneficiary
        ? [
            { label: 'Datos generales', to: basePath },
            { label: 'Diagnóstico social', to: `${basePath}/diagnostico-social` },
            { label: 'Diagnóstico técnico', to: `${basePath}/diagnostico-tecnico` },
          ]
        : [],
    [basePath, isBeneficiary],
  );

  return (
    <div className="space-y-4">
      <Link
        to={listPath}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-brand-primary"
      >
        {BackIcon}
        Volver a {SECTION_LABELS[section]}
      </Link>

      {error ? (
        <Alert severity="error">{error}</Alert>
      ) : isLoading || !application ? (
        <ApplicantInfoCardSkeleton />
      ) : (
        <>
          <ApplicantInfoCard
            application={application}
            onEdit={canWrite ? () => navigate(`${basePath}/editar`) : undefined}
            onDelete={isAdmin ? () => setIsDeleting(true) : undefined}
            onApprove={canDecide ? () => setIsApproving(true) : undefined}
            onReject={canDecide ? () => setIsRejecting(true) : undefined}
          />

          {tabs.length > 0 && <RouteTabs tabs={tabs} ariaLabel="Secciones de la ficha" />}

          {/* Aquí sí se espera a la ficha: los paneles la necesitan, y montarlos
              antes obligaría a cada uno a manejar el caso nulo. */}
          <Outlet context={{ application, section } satisfies ApplicationOutletContext} />
        </>
      )}

      <ConfirmApproveApplicationModal
        open={isApproving}
        onClose={() => setIsApproving(false)}
        onSuccess={() => {
          // El `section` es un prop de la ruta, así que cambiar de pestaña no
          // remonta este componente ni vuelve a pedir la ficha por su id: hay
          // que recargarla a mano o la cabecera seguiría diciendo «Pendiente».
          refresh();
          navigate(`/proyectos/${projectId}/beneficiarios/${applicationId}`, { replace: true });
        }}
        application={application}
      />

      <RejectApplicationModal
        open={isRejecting}
        onClose={() => setIsRejecting(false)}
        // Un rechazado sigue en la pestaña de solicitantes: no se mueve, solo
        // cambia de estado y gana su motivo.
        onSuccess={refresh}
        application={application}
      />

      <ConfirmDeleteApplicationModal
        open={isDeleting}
        onClose={() => setIsDeleting(false)}
        // La ficha ya no existe: no hay a dónde volver dentro de ella.
        onSuccess={() => navigate(listPath)}
        application={application}
      />
    </div>
  );
};

export default ApplicationDetailPage;
