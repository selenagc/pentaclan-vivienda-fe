import { Modal } from '../ui/Modal';
import { ProjectForm } from './ProjectForm';
import { useProjectForm } from '../../hooks/useProjectForm';
import type { Project } from '../../types/project.types';

const SaveIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

interface ProjectFormModalProps {
  onClose: () => void;
  /** Se invoca tras guardar con éxito, para refrescar el listado. */
  onSuccess: () => void;
  /** Proyecto a editar. */
  project: Project;
}

/**
 * Modal de edición de proyecto. Reusa el mismo `ProjectForm` de la pantalla de
 * creación (sin su tarjeta, que aquí la pone el modal) y el mismo
 * `useProjectForm`, que al recibir un proyecto envía un PUT en vez de un POST.
 *
 * Se monta solo mientras se está editando —`{editing && <ProjectFormModal …>}`,
 * que es lo que exige el tipo de `project`—, así que cada apertura arranca de
 * los datos actuales del proyecto y no de lo que se escribió y se descartó la
 * vez anterior.
 *
 * Los botones van dentro del formulario, no en el pie del modal, para que
 * *Guardar cambios* siga siendo el `submit` del `<form>` y responda al Enter.
 */
export const ProjectFormModal = ({ onClose, onSuccess, project }: ProjectFormModalProps) => {
  const { values, setField, errors, generalError, isSubmitting, submit } = useProjectForm({
    project,
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  return (
    <Modal open onClose={onClose} title="Editar proyecto" size="lg">
      <ProjectForm
        values={values}
        setField={setField}
        errors={errors}
        generalError={generalError}
        isSubmitting={isSubmitting}
        onSubmit={submit}
        onCancel={onClose}
        submitLabel="Guardar cambios"
        submitIcon={SaveIcon}
        variant="plain"
      />
    </Modal>
  );
};
