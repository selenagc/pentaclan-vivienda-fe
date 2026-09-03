import type { ReactNode } from 'react';
import Skeleton from '@mui/material/Skeleton';
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

interface FieldProps {
  label: string;
  value: string;
}

const Field = ({ label, value }: FieldProps) => (
  <div className="min-w-0">
    <dt className="text-xs text-gray-500">{label}</dt>
    <dd className="mt-0.5 text-sm font-medium break-words text-gray-900">{value}</dd>
  </div>
);

/** Marco común de la tarjeta, para que carga y contenido midan lo mismo. */
const Card = ({ children }: { children: ReactNode }) => (
  <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
    {children}
  </section>
);

/** Esqueleto de la tarjeta mientras se pide el proyecto. */
export const ProjectInfoCardSkeleton = () => (
  <Card>
    <Skeleton variant="text" width="45%" height={30} />
    <Skeleton variant="text" width="25%" />
    <div className="mt-5 grid gap-x-8 gap-y-4 border-t border-gray-100 pt-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index}>
          <Skeleton variant="text" width="50%" height={14} />
          <Skeleton variant="text" width="80%" />
        </div>
      ))}
    </div>
  </Card>
);

interface ProjectInfoCardProps {
  project: Project;
  /** Abre la edición. Si se omite, no se ofrece el botón (solo es de admin). */
  onEdit?: () => void;
}

/**
 * Cabecera del detalle de un proyecto: quién es y dónde se ejecuta.
 *
 * Es la tarjeta fija sobre las pestañas, así que muestra el contexto que hace
 * falta en todas ellas —solicitantes, beneficiarios y lo que venga— y no se
 * repite dentro de cada panel.
 *
 * *Editar* vive aquí, en la esquina de los datos que modifica, y no en la
 * barra de pestañas: esa barra es navegación, y mezclarle una acción haría que
 * dejara de leerse de un vistazo. Abajo, cada pestaña pone su propia acción
 * («Nuevo solicitante»), que así tampoco compite con esta.
 *
 * No pide nada: lo carga la página, que ya necesita el proyecto para el título.
 */
export const ProjectInfoCard = ({ project, onEdit }: ProjectInfoCardProps) => (
  <Card>
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-xl font-semibold break-words text-gray-900">{project.name}</h2>
        <p className="mt-0.5 text-sm text-gray-500">Nº de contrato {project.contractNo}</p>
      </div>
      {onEdit && (
        <Button variant="outline" fullWidth={false} icon={EditIcon} onClick={onEdit}>
          Editar
        </Button>
      )}
    </div>

    <dl className="mt-5 grid gap-x-8 gap-y-4 border-t border-gray-100 pt-5 sm:grid-cols-2 lg:grid-cols-3">
      <Field label="Ubicación" value={fullLocation(project.municipality)} />
      <Field label="Entidad financiadora" value={project.publicEntity.name} />
      <Field label="Registrado por" value={project.userName} />
      <Field label="Fecha de registro" value={formatDate(project.createdAt)} />
      <Field label="Última modificación" value={formatDate(project.updatedAt)} />
    </dl>
  </Card>
);
