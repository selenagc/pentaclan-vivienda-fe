import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { fullLocation, type Project } from '../../types/project.types';

/** Fecha larga en formato boliviano. El backend manda ISO en UTC. */
const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' });

const EditIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
    />
  </svg>
);

interface DetailRowProps {
  label: string;
  value: string;
}

const DetailRow = ({ label, value }: DetailRowProps) => (
  <div className="grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] gap-3 py-2.5">
    <dt className="text-sm text-gray-500">{label}</dt>
    <dd className="text-sm text-gray-900">{value}</dd>
  </div>
);

interface ProjectDetailModalProps {
  open: boolean;
  onClose: () => void;
  /** Proyecto a mostrar. `null` mientras no hay ninguno seleccionado. */
  project: Project | null;
  /** Abre la edición desde el detalle. Si se omite, no se ofrece el botón. */
  onEdit?: (project: Project) => void;
}

/**
 * Detalle de un proyecto en un modal de solo lectura.
 *
 * Recoge los datos que se quitaron de las columnas del listado (ubicación,
 * entidad financiadora y fechas) para que la tabla se quede con lo que
 * identifica al proyecto: título y número de contrato.
 *
 * No pide nada al backend: `GET /projects` ya devuelve el municipio resuelto
 * hasta el departamento y la entidad anidada, así que se pinta con la misma
 * fila del listado y el detalle abre al instante.
 */
export const ProjectDetailModal = ({
  open,
  onClose,
  project,
  onEdit,
}: ProjectDetailModalProps) => {
  if (!project) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={project.name}
      size="md"
      footer={
        <>
          <Button variant="outline" fullWidth={false} onClick={onClose}>
            Cerrar
          </Button>
          {onEdit && (
            <Button fullWidth={false} icon={EditIcon} onClick={() => onEdit(project)}>
              Editar
            </Button>
          )}
        </>
      }
    >
      <dl className="divide-y divide-gray-100">
        <DetailRow label="Nº de contrato" value={project.contractNo} />
        <DetailRow label="Ubicación" value={fullLocation(project.municipality)} />
        <DetailRow label="Entidad financiadora" value={project.publicEntity.name} />
        <DetailRow label="Registrado por" value={project.userName} />
        <DetailRow label="Fecha de registro" value={formatDate(project.createdAt)} />
        <DetailRow label="Última modificación" value={formatDate(project.updatedAt)} />
      </dl>
    </Modal>
  );
};
