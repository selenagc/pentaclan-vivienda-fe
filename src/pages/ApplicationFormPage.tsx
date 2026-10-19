import { useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import { ApplicationForm } from '../components/applications/ApplicationForm';
import type { ProjectSection } from '../components/applications/applicationOutlet';
import { useProjectOutlet } from '../components/projects/projectOutlet';
import { useApplicationForm } from '../hooks/useApplicationForm';
import { useResource } from '../hooks/useResource';
import { useAuth } from '../hooks/useAuth';
import { applicationService } from '../services/applicationService';
import { CAN_WRITE_APPLICATIONS } from '../constants/applications';
import type { Application } from '../types/application.types';
import type { Project } from '../types/project.types';

const BackIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

const FormIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

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

interface ApplicationFormPageProps {
  /** Pestaña desde la que se abrió: fija a dónde vuelve al guardar o cancelar. */
  section: ProjectSection;
}

/**
 * Alta y corrección de un solicitante, **dentro** del detalle del proyecto:
 * `/proyectos/:projectId/solicitantes/nuevo` y `.../:applicationId/editar`.
 *
 * No saca al usuario del proyecto: se abre como una pantalla dentro de la
 * contenedora, con la tarjeta del proyecto y sus pestañas todavía arriba y un
 * *volver* propio. Registrar a alguien no es cambiar de sitio, es hacer algo
 * dentro del proyecto en el que ya se estaba.
 *
 * Sigue siendo el bloque ancho de siempre —titular, cónyuge, vivienda y
 * presentación— y no un modal: dentro de uno quedarían apretados en un móvil,
 * que es donde se captura en campo. Y la dirección es enlazable: se puede
 * retomar una ficha a medio revisar.
 *
 * El proyecto llega por el contexto del `<Outlet />`, ya cargado por la
 * pantalla contenedora, así que este formulario no lo vuelve a pedir.
 *
 * Registrar y corregir es de `admin`, `social_lead` y `technical_lead`; el
 * backend responde 403 al resto, así que a quien no tiene permiso se le
 * explica en vez de dejarle llenar un formulario que va a fallar al enviar.
 */
export const ApplicationFormPage = ({ section }: ApplicationFormPageProps) => {
  const { projectId, applicationId } = useParams<{
    projectId: string;
    applicationId?: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { project, isLoadingProject } = useProjectOutlet();

  const canWrite = CAN_WRITE_APPLICATIONS.includes(
    user?.role as (typeof CAN_WRITE_APPLICATIONS)[number],
  );
  const isEditing = Boolean(applicationId);
  const listPath = `/proyectos/${projectId}/${section}`;
  // Al corregir se vuelve a la ficha, que es de donde se entró; al registrar
  // no hay ficha todavía, así que se vuelve al padrón.
  const returnPath = isEditing ? `${listPath}/${applicationId}` : listPath;
  const returnLabel = isEditing ? 'Volver a la ficha' : `Volver a ${section}`;

  // `applicationId` es undefined en el alta: el hook no pide nada y no carga.
  const {
    data: application,
    isLoading: isLoadingApplication,
    error: applicationError,
  } = useResource(applicationService.getById, applicationId, 'No se pudo cargar la ficha.');

  const goBack = useCallback(() => {
    navigate(returnPath);
  }, [navigate, returnPath]);

  const header = (
    <div className="space-y-3">
      <Link
        to={returnPath}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-brand-primary"
      >
        {BackIcon}
        {returnLabel}
      </Link>

      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary"
        >
          {FormIcon}
        </span>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Corregir ficha del solicitante' : 'Registrar solicitante'}
          </h2>
          <p className="text-sm text-gray-500">Titular, cónyuge y vivienda a mejorar.</p>
        </div>
      </div>
    </div>
  );

  if (!canWrite) {
    return (
      <div className="space-y-4">
        {header}
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            No tienes permisos para registrar solicitantes
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Registrar y corregir fichas es trabajo de campo: lo hacen el administrador y los
            líderes social y técnico.
          </p>
        </div>
      </div>
    );
  }

  // Sin proyecto no hay municipio con el que validar la vivienda, y sin la
  // ficha no se puede corregir: en ambos casos el formulario no se pinta. Un
  // fallo al cargar el proyecto lo muestra la pantalla contenedora, que ni
  // siquiera llega a montar esto.
  const isLoading = isLoadingProject || isLoadingApplication;

  return (
    <div className="space-y-4">
      {header}

      {applicationError ? (
        <Alert severity="error">{applicationError}</Alert>
      ) : isLoading || !project ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
          <Skeleton variant="text" width="40%" height={32} />
          <Skeleton variant="rectangular" height={220} sx={{ mt: 2, borderRadius: 1 }} />
        </div>
      ) : (
        <LoadedForm
          project={project}
          application={application}
          onDone={goBack}
          onCancel={goBack}
        />
      )}
    </div>
  );
};

export default ApplicationFormPage;
