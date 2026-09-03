import { useMemo, useState } from 'react';
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import { RouteTabs, type RouteTab } from '../components/ui/RouteTabs';
import {
  ApplicantInfoCard,
  ApplicantInfoCardSkeleton,
} from '../components/applications/ApplicantInfoCard';
import { ConfirmDeleteApplicationModal } from '../components/applications/ConfirmDeleteApplicationModal';
import type { ApplicationOutletContext } from '../components/applications/applicationOutlet';
import { useResource } from '../hooks/useResource';
import { useAuth } from '../hooks/useAuth';
import { applicationService } from '../services/applicationService';
import { CAN_WRITE_APPLICATIONS } from '../constants/applications';

const BackIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

/**
 * Ficha de un solicitante: `/proyectos/:projectId/solicitantes/:applicationId`.
 *
 * Repite la estructura del detalle del proyecto —tarjeta de cabecera con las
 * acciones, pestañas debajo— porque es el mismo gesto un nivel más abajo: se
 * entra desde el padrón haciendo clic en la fila.
 *
 * Las pestañas son las tres partes de la evaluación: los datos que se
 * capturaron al registrar y los dos diagnósticos, social y técnico, que se
 * levantan después. Los dos últimos se montan vacíos desde ahora para que el
 * sitio quede reservado y su ticket solo tenga que rellenar el panel.
 *
 * La ficha se pide **una vez, aquí**, y baja a las pestañas por el contexto
 * del `<Outlet />`: cambiar de pestaña no repite la petición.
 */
export const ApplicationDetailPage = () => {
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

  const listPath = `/proyectos/${projectId}/solicitantes`;
  const basePath = `${listPath}/${applicationId}`;

  const { data: application, isLoading, error } = useResource(
    applicationService.getById,
    applicationId,
    'No se pudo cargar la ficha.',
  );

  const [isDeleting, setIsDeleting] = useState(false);

  const tabs = useMemo<RouteTab[]>(
    () => [
      { label: 'Datos generales', to: basePath },
      { label: 'Diagnóstico social', to: `${basePath}/diagnostico-social` },
      { label: 'Diagnóstico técnico', to: `${basePath}/diagnostico-tecnico` },
    ],
    [basePath],
  );

  return (
    <div className="space-y-4">
      <Link
        to={listPath}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
      >
        {BackIcon}
        Volver a solicitantes
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
          />

          {/* Aquí sí se espera a la ficha: los tres paneles la necesitan, y
              montarlos antes obligaría a cada uno a manejar el caso nulo. */}
          <RouteTabs tabs={tabs} ariaLabel="Secciones de la ficha" />
          <Outlet context={{ application } satisfies ApplicationOutletContext} />
        </>
      )}

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
