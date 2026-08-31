import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import MuiButton from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { Table, type Column } from '../components/ui/Table';
import { Pagination } from '../components/ui/Pagination';
import { Button } from '../components/ui/Button';
import { ApplicationDetailModal } from '../components/applications/ApplicationDetailModal';
import { ConfirmDeleteApplicationModal } from '../components/applications/ConfirmDeleteApplicationModal';
import { useApplications } from '../hooks/useApplications';
import { useResource } from '../hooks/useResource';
import { useAuth } from '../hooks/useAuth';
import { projectService } from '../services/projectService';
import {
  APPLICATION_STATUS_COLORS,
  APPLICATION_STATUS_LABELS,
  CAN_WRITE_APPLICATIONS,
} from '../constants/applications';
import { propertyLabel } from '../types/property.types';
import { applicantFullName, fullDocument, type Application } from '../types/application.types';

const PlusIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const BackIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

/**
 * Solicitantes de un proyecto: `/proyectos/:projectId/solicitantes`.
 *
 * Cuelga del proyecto y no del menú lateral porque una postulación no existe
 * suelta: siempre es *a* un proyecto, y su vivienda tiene que estar en el
 * municipio donde se ejecuta la obra. Entrar por el proyecto deja ese contexto
 * fijado y ahorra tener que elegirlo en cada ficha.
 *
 * Tampoco es la pantalla de «beneficiarios»: un beneficiario es una de estas
 * mismas fichas en estado `approved`, y se listará filtrando por estado cuando
 * PV-31 traiga la aprobación. Por eso la columna de estado está desde ahora,
 * aunque hoy todas digan «Pendiente».
 */
export const ProjectApplicantsPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';
  // Registrar y corregir es trabajo de campo: admin y los dos líderes. El
  // supervisor lee pero no escribe, y borrar es solo de admin (el backend
  // responde 403 igualmente; esto evita ofrecer un botón que va a fallar).
  const canWrite = CAN_WRITE_APPLICATIONS.includes(
    user?.role as (typeof CAN_WRITE_APPLICATIONS)[number],
  );

  const {
    data: project,
    isLoading: isLoadingProject,
    error: projectError,
  } = useResource(projectService.getById, projectId, 'No se pudo cargar el proyecto.');

  const { applications, meta, page, limit, isLoading, error, refresh, goToPage, changeLimit } =
    useApplications({ projectId });

  const [viewing, setViewing] = useState<Application | null>(null);
  const [deleting, setDeleting] = useState<Application | null>(null);

  const goToEdit = (application: Application) =>
    navigate(`/proyectos/${projectId}/solicitantes/${application.id}/editar`);

  /** Desde el detalle se salta a corregir: se cierra el modal y se navega. */
  const openEdit = (application: Application) => {
    setViewing(null);
    goToEdit(application);
  };

  const columns: Column<Application>[] = [
    {
      key: 'applicant',
      header: 'Solicitante',
      render: (application) => (
        <span className="font-medium text-gray-900">
          {applicantFullName(application.person)}
        </span>
      ),
    },
    {
      key: 'document',
      header: 'Documento',
      render: (application) => fullDocument(application.person),
    },
    {
      key: 'property',
      header: 'Vivienda',
      render: (application) => propertyLabel(application.property),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (application) => (
        <Chip
          size="small"
          label={APPLICATION_STATUS_LABELS[application.status]}
          color={APPLICATION_STATUS_COLORS[application.status]}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (application) => (
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
          <MuiButton
            size="small"
            onClick={() => setViewing(application)}
            aria-label={`Ver la ficha de ${applicantFullName(application.person)}`}
          >
            Ver
          </MuiButton>
          {canWrite && (
            <MuiButton
              size="small"
              onClick={() => goToEdit(application)}
              aria-label={`Editar la ficha de ${applicantFullName(application.person)}`}
            >
              Editar
            </MuiButton>
          )}
          {isAdmin && (
            <MuiButton
              size="small"
              color="error"
              onClick={() => setDeleting(application)}
              aria-label={`Eliminar la ficha de ${applicantFullName(application.person)}`}
            >
              Eliminar
            </MuiButton>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Link
        to="/proyectos"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
      >
        {BackIcon}
        Volver a proyectos
      </Link>

      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-gray-900">Solicitantes</h2>
          {isLoadingProject ? (
            <Skeleton variant="text" width={280} />
          ) : (
            <p className="truncate text-sm text-gray-500">
              {project
                ? `${project.name} · Nº ${project.contractNo}`
                : 'Postulaciones registradas en el proyecto.'}
            </p>
          )}
        </div>
        {canWrite && (
          <Button
            fullWidth={false}
            onClick={() => navigate(`/proyectos/${projectId}/solicitantes/nuevo`)}
            icon={PlusIcon}
          >
            Nuevo solicitante
          </Button>
        )}
      </div>

      {/* El proyecto solo aporta la cabecera: si falla, el listado sigue siendo
          útil, así que se avisa sin tapar la tabla. */}
      {projectError && <Alert severity="warning">{projectError}</Alert>}

      {error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <Table
            columns={columns}
            data={applications}
            rowKey="id"
            isLoading={isLoading}
            emptyMessage="Este proyecto todavía no tiene solicitantes."
          />
          {meta && (
            <Pagination
              page={page}
              totalPages={meta.totalPages}
              total={meta.total}
              limit={limit}
              isLoading={isLoading}
              onPageChange={goToPage}
              onLimitChange={changeLimit}
              itemLabel={{ singular: 'solicitante', plural: 'solicitantes' }}
            />
          )}
        </>
      )}

      <ApplicationDetailModal
        open={viewing !== null}
        onClose={() => setViewing(null)}
        application={viewing}
        onEdit={canWrite ? openEdit : undefined}
      />

      <ConfirmDeleteApplicationModal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onSuccess={refresh}
        application={deleting}
      />
    </div>
  );
};

export default ProjectApplicantsPage;
