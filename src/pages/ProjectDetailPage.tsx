import { useMemo, useState } from 'react';
import { Link, Outlet, useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import { RouteTabs, type RouteTab } from '../components/ui/RouteTabs';
import {
  ProjectInfoCard,
  ProjectInfoCardSkeleton,
} from '../components/projects/ProjectInfoCard';
import { ProjectFormModal } from '../components/projects/ProjectFormModal';
import type { ProjectOutletContext } from '../components/projects/projectOutlet';
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
 * Es la pantalla contenedora de todo el módulo: la tarjeta con los datos del
 * proyecto arriba, la barra de pestañas debajo, y en el `<Outlet />` lo que
 * toque —una lista, una ficha o un formulario—. Nada de eso se lleva al
 * usuario fuera: registrar un solicitante abre una pantalla *dentro* de esta,
 * con su propio «volver», y la cabecera sigue diciendo en qué proyecto está.
 *
 * Cada pestaña es una ruta hija, no un `useState`: así la dirección de la
 * pestaña se puede compartir y recargar, el botón *atrás* funciona, y
 * `/proyectos/:id/solicitantes` sigue siendo la misma URL que ya existía.
 *
 * El proyecto se pide **una vez, aquí**, y baja por el contexto del `<Outlet />`
 * a quien lo necesite (el formulario). Cambiar de pestaña no lo repite.
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

  // Las pestañas del proyecto: los evaluadores solo ven Solicitantes y Beneficiarios;
  // los administradores tienen además la gestión de 'Equipo Asignado'.
  const tabs = useMemo<RouteTab[]>(() => {
    const list: RouteTab[] = [
      { label: 'Solicitantes', to: `/proyectos/${projectId}/solicitantes` },
      { label: 'Beneficiarios', to: `/proyectos/${projectId}/beneficiarios` },
    ];
    if (isAdmin) {
      list.push({ label: 'Equipo Asignado', to: `/proyectos/${projectId}/equipo` });
    }
    return list;
  }, [projectId, isAdmin]);

  const backLink = isAdmin ? '/proyectos' : '/inicio';
  const backText = isAdmin ? 'Volver a proyectos' : 'Volver a mis proyectos';

  const outletContext: ProjectOutletContext = { project, isLoadingProject: isLoading };

  return (
    <div className="space-y-4">
      <Link
        to={backLink}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-brand-primary"
      >
        {BackIcon}
        {backText}
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
          <Outlet context={outletContext} />
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
