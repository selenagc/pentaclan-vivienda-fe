import { useMemo, useState } from 'react';
import { Link, Outlet, useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import { RouteTabs, type RouteTab } from '../components/ui/RouteTabs';
import {
  ProjectInfoCard,
  ProjectInfoCardSkeleton,
} from '../components/projects/ProjectInfoCard';
import { ProjectFormModal } from '../components/projects/ProjectFormModal';
import { useResource } from '../hooks/useResource';
import { useAuth } from '../hooks/useAuth';
import { projectService } from '../services/projectService';

const BackIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

/**
 * Detalle de un proyecto: `/proyectos/:projectId`.
 *
 * Es el marco de todo lo que cuelga del proyecto —la tarjeta con sus datos
 * arriba y una barra de pestañas debajo— y el panel de la pestaña activa se
 * pinta en el `<Outlet />`. Sustituye a los tres botones que tenía cada fila
 * del listado (ver, editar y solicitantes) por uno solo: *Ver* trae aquí.
 *
 * Cada pestaña es una ruta hija, no un `useState`: así la dirección de la
 * pestaña se puede compartir y recargar, el botón *atrás* funciona, y
 * `/proyectos/:id/solicitantes` sigue siendo la misma URL que ya existía.
 *
 * El proyecto se pide **una vez, aquí**. Los paneles solo necesitan el
 * `projectId` de la URL, así que cambiar de pestaña no repite la petición.
 */
export const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const {
    data: project,
    isLoading,
    error,
    refresh,
  } = useResource(projectService.getById, projectId, 'No se pudo cargar el proyecto.');

  const [isEditing, setIsEditing] = useState(false);

  // Las pestañas pendientes (documentos, seguimiento…) se añaden a esta lista
  // y no hace falta tocar nada más aquí: su ruta hija vive en `App.tsx`.
  const tabs = useMemo<RouteTab[]>(
    () => [
      { label: 'Solicitantes', to: `/proyectos/${projectId}/solicitantes` },
      { label: 'Beneficiarios', to: `/proyectos/${projectId}/beneficiarios` },
    ],
    [projectId],
  );

  return (
    <div className="space-y-4">
      <Link
        to="/proyectos"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
      >
        {BackIcon}
        Volver a proyectos
      </Link>

      {error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          {isLoading || !project ? (
            <ProjectInfoCardSkeleton />
          ) : (
            <ProjectInfoCard
              project={project}
              onEdit={isAdmin ? () => setIsEditing(true) : undefined}
            />
          )}

          {/* Las pestañas no esperan al proyecto: sus paneles se alimentan del
              `projectId` de la URL, así que la tabla carga en paralelo con la
              tarjeta en vez de después de ella. */}
          <RouteTabs tabs={tabs} ariaLabel="Secciones del proyecto" />
          <Outlet />
        </>
      )}

      {/* Montado solo mientras se edita: cada apertura arranca de los datos
          actuales y no de lo que se escribió y se descartó la vez anterior. */}
      {isEditing && project && (
        <ProjectFormModal
          project={project}
          onClose={() => setIsEditing(false)}
          onSuccess={refresh}
        />
      )}
    </div>
  );
};

export default ProjectDetailPage;
