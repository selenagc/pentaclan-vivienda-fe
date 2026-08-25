import { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProjectForm } from '../components/projects/ProjectForm';
import { ProjectSummary } from '../components/projects/ProjectSummary';
import { useCreateProject } from '../hooks/useCreateProject';
import { useAuth } from '../hooks/useAuth';

/**
 * Pantalla *Crear nuevo proyecto*: formulario a la izquierda y resumen en vivo
 * a la derecha, como en el mockup.
 *
 * Crear proyectos es exclusivo de administradores (el backend responde 403 al
 * resto), así que a un usuario sin permiso se le explica en vez de dejarle
 * llenar un formulario que va a fallar al enviar.
 */
export const CreateProjectPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const handleSuccess = useCallback(() => {
    navigate('/proyectos');
  }, [navigate]);

  const { values, setField, errors, generalError, isSubmitting, submit } =
    useCreateProject(handleSuccess);

  if (!isAdmin) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-gray-900">
          No tienes permisos para crear proyectos
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Solo un administrador puede registrar proyectos nuevos.
        </p>
        <Link
          to="/proyectos"
          className="mt-4 inline-block text-sm font-medium text-brand-primary hover:underline"
        >
          Volver al listado
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Crear nuevo proyecto</h2>
        <p className="mt-1 text-sm text-gray-500">
          Registra la información y ubicación del proyecto.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <ProjectForm
          values={values}
          setField={setField}
          errors={errors}
          generalError={generalError}
          isSubmitting={isSubmitting}
          onSubmit={submit}
          onCancel={() => navigate('/proyectos')}
        />

        <ProjectSummary
          name={values.name}
          geo={values.geo}
          publicEntityId={values.publicEntityId}
        />
      </div>
    </div>
  );
};

export default CreateProjectPage;
