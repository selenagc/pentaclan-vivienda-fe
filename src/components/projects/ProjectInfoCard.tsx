import type { ReactNode } from 'react';
import Skeleton from '@mui/material/Skeleton';
import MuiButton from '@mui/material/Button';
import { fullLocation, type Project } from '../../types/project.types';

/** Fecha larga en formato boliviano. El backend manda ISO en UTC. */
const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' });

const iconClass = 'h-4 w-4';

const EditIcon = (
  <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
    />
  </svg>
);

const LocationIcon = (
  <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

const PublicEntityIcon = (
  <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l9 4.5H3L12 3zM4.5 21h15M5.25 9.75v9m4.5-9v9m4.5-9v9m4.5-9v9" />
  </svg>
);

const UserIcon = (
  <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const CalendarIcon = (
  <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

interface FieldProps {
  icon: ReactNode;
  label: string;
  value: string;
  /** Color del icono. Distingue de un vistazo el tipo de dato. */
  tone: 'primary' | 'teal' | 'olive' | 'accent';
}

const toneClass: Record<FieldProps['tone'], string> = {
  primary: 'bg-brand-primary/10 text-brand-primary',
  teal: 'bg-brand-teal/10 text-brand-teal',
  olive: 'bg-brand-olive/15 text-brand-olive',
  accent: 'bg-brand-accent/15 text-brand-accent',
};

const Field = ({ icon, label, value, tone }: FieldProps) => (
  <div className="flex min-w-0 items-start gap-3">
    <span
      aria-hidden="true"
      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${toneClass[tone]}`}
    >
      {icon}
    </span>
    <div className="min-w-0">
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium break-words text-gray-900">{value}</dd>
    </div>
  </div>
);

/** Marco común de la tarjeta, para que carga y contenido midan lo mismo. */
const Card = ({ children }: { children: ReactNode }) => (
  <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
    {children}
  </section>
);

/**
 * Franja de cabecera. El degradado va del azul del menú lateral al morado de
 * marca, que son los dos colores que el usuario ya tiene delante: la tarjeta
 * queda anclada a la identidad en vez de ser otro rectángulo blanco.
 */
const Banner = ({ children }: { children: ReactNode }) => (
  <div className="bg-gradient-to-r from-brand-dark-deep via-brand-dark to-brand-primary px-5 py-5 sm:px-6">
    {children}
  </div>
);

/** Esqueleto de la tarjeta mientras se pide el proyecto. */
export const ProjectInfoCardSkeleton = () => (
  <Card>
    <Banner>
      <Skeleton variant="text" width="45%" height={30} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
      <Skeleton variant="text" width="25%" sx={{ bgcolor: 'rgba(255,255,255,0.15)' }} />
    </Banner>
    <div className="grid gap-x-8 gap-y-4 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-start gap-3">
          <Skeleton variant="rounded" width={32} height={32} />
          <div className="flex-1">
            <Skeleton variant="text" width="50%" height={14} />
            <Skeleton variant="text" width="80%" />
          </div>
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
 * repite dentro de cada panel. Como todo el módulo se abre debajo de ella,
 * también es lo que responde «¿en qué proyecto estoy?» sin volver atrás.
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
    <Banner>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-white/60 uppercase">Proyecto</p>
          <h2 className="mt-0.5 text-xl font-semibold break-words text-white">{project.name}</h2>
          <p className="mt-1 text-sm text-white/70">Nº de contrato {project.contractNo}</p>
        </div>
        {onEdit && (
          // Contra el degradado, el botón se dibuja en blanco: la variante de
          // marca desaparecería sobre su propio color.
          <MuiButton
            variant="outlined"
            size="small"
            startIcon={EditIcon}
            onClick={onEdit}
            sx={{
              color: 'common.white',
              borderColor: 'rgba(255,255,255,0.5)',
              '&:hover': {
                borderColor: 'common.white',
                backgroundColor: 'rgba(255,255,255,0.12)',
              },
            }}
          >
            Editar
          </MuiButton>
        )}
      </div>
    </Banner>

    <dl className="grid gap-x-8 gap-y-4 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
      <Field
        icon={LocationIcon}
        tone="teal"
        label="Ubicación"
        value={fullLocation(project.municipality)}
      />
      <Field
        icon={PublicEntityIcon}
        tone="primary"
        label="Entidad financiadora"
        value={project.publicEntity.name}
      />
      <Field icon={UserIcon} tone="olive" label="Registrado por" value={project.userName} />
      <Field
        icon={CalendarIcon}
        tone="accent"
        label="Fecha de registro"
        value={formatDate(project.createdAt)}
      />
      <Field
        icon={CalendarIcon}
        tone="accent"
        label="Última modificación"
        value={formatDate(project.updatedAt)}
      />
    </dl>
  </Card>
);
