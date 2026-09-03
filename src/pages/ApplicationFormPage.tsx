import { useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import { ApplicationForm } from '../components/applications/ApplicationForm';
import { useApplicationForm } from '../hooks/useApplicationForm';
import { useResource } from '../hooks/useResource';
import { useAuth } from '../hooks/useAuth';
import { projectService } from '../services/projectService';
import { applicationService } from '../services/applicationService';
import { CAN_WRITE_APPLICATIONS } from '../constants/applications';
import type { Application } from '../types/application.types';
import type { Project } from '../types/project.types';

interface LoadedFormProps {
  project: Project;
  /** `null` en la ruta de alta. */
  application: Application | null;
  onDone: () => void;
  onCancel: () => void;
}

/**
 * El formulario, ya con el proyecto (y la ficha, si se edita) en la mano.
 *
 * Está separado porque `useApplicationForm` toma sus valores iniciales del
 * proyecto y de la ficha, y los hooks no pueden llamarse condicionalmente:
 * montarlo solo cuando los datos llegaron es lo que garantiza que el estado
 * del formulario arranque poblado en vez de vacío.
 */
const LoadedForm = ({ project, application, onDone, onCancel }: LoadedFormProps) => {
  const form = useApplicationForm({ project, application, onSuccess: onDone });

  return (
    <ApplicationForm
      project={project}
      values={form.values}
      errors={form.errors}
      generalError={form.generalError}
      isSubmitting={form.isSubmitting}
      setPersonField={form.setPersonField}
      setPropertyField={form.setPropertyField}
      setHasSpouse={form.setHasSpouse}
      setPropertyMode={form.setPropertyMode}
      selectProperty={form.selectProperty}
      setSubmittedAt={form.setSubmittedAt}
      onSubmit={form.submit}
      onCancel={onCancel}
      isEditing={application !== null}
    />
  );
};

/**
 * Alta y corrección de un solicitante, en su propia ruta:
 * `/proyectos/:projectId/solicitantes/nuevo` y `.../:applicationId/editar`.
 *
 * En pantalla propia y no en un modal porque el formulario son cuatro bloques
 * —titular, cónyuge, vivienda y presentación— y dentro de un modal quedarían
 * apretados en un móvil, que es donde se captura en campo. De paso, la
 * dirección es enlazable: se puede retomar una ficha a medio revisar.
 *
 * Registrar y corregir es de `admin`, `social_lead` y `technical_lead`; el
 * backend responde 403 al resto, así que a quien no tiene permiso se le
 * explica en vez de dejarle llenar un formulario que va a fallar al enviar.
 */
export const ApplicationFormPage = () => {
  const { projectId, applicationId } = useParams<{
    projectId: string;
    applicationId?: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const canWrite = CAN_WRITE_APPLICATIONS.includes(
    user?.role as (typeof CAN_WRITE_APPLICATIONS)[number],
  );
  const isEditing = Boolean(applicationId);
  const listPath = `/proyectos/${projectId}/solicitantes`;
  // Al corregir se vuelve a la ficha, que es de donde se entró; al registrar
  // no hay ficha todavía, así que se vuelve al padrón.
  const returnPath = isEditing ? `${listPath}/${applicationId}` : listPath;

  const {
    data: project,
    isLoading: isLoadingProject,
    error: projectError,
  } = useResource(projectService.getById, projectId, 'No se pudo cargar el proyecto.');

  // `applicationId` es undefined en el alta: el hook no pide nada y no carga.
  const {
    data: application,
    isLoading: isLoadingApplication,
    error: applicationError,
  } = useResource(applicationService.getById, applicationId, 'No se pudo cargar la ficha.');

  const handleDone = useCallback(() => {
    navigate(returnPath);
  }, [navigate, returnPath]);

  const handleCancel = useCallback(() => {
    navigate(returnPath);
  }, [navigate, returnPath]);

  if (!canWrite) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-gray-900">
          No tienes permisos para registrar solicitantes
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Registrar y corregir fichas es trabajo de campo: lo hacen el administrador y los líderes
          social y técnico.
        </p>
        <Link
          to={listPath}
          className="mt-4 inline-block text-sm font-medium text-brand-primary hover:underline"
        >
          Volver al listado
        </Link>
      </div>
    );
  }

  // Sin proyecto no hay municipio con el que validar la vivienda, y sin la
  // ficha no se puede corregir: en ambos casos el formulario no se pinta.
  const loadError = projectError ?? applicationError;
  const isLoading = isLoadingProject || isLoadingApplication;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          {isEditing ? 'Corregir ficha del solicitante' : 'Registrar solicitante'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {project
            ? `${project.name} · Nº ${project.contractNo}`
            : 'Titular, cónyuge y vivienda a mejorar.'}
        </p>
      </div>

      {loadError ? (
        <>
          <Alert severity="error">{loadError}</Alert>
          <Link to={listPath} className="text-sm font-medium text-brand-primary hover:underline">
            Volver al listado
          </Link>
        </>
      ) : isLoading || !project ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
          <Skeleton variant="text" width="40%" height={32} />
          <Skeleton variant="rectangular" height={220} sx={{ mt: 2, borderRadius: 1 }} />
        </div>
      ) : (
        <LoadedForm
          project={project}
          application={application}
          onDone={handleDone}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default ApplicationFormPage;
