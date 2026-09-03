import type { ReactNode } from 'react';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import { Button } from '../ui/Button';
import {
  APPLICATION_STATUS_COLORS,
  APPLICATION_STATUS_LABELS,
} from '../../constants/applications';
import {
  fullDocument,
  personDisplayName,
  type Application,
} from '../../types/application.types';

const CheckIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const XIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const EditIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
    />
  </svg>
);

/**
 * Marco común de la tarjeta, para que carga y contenido midan lo mismo.
 *
 * Lleva una franja de color a la izquierda en vez del degradado de la tarjeta
 * del proyecto: se ve dentro de ella, y repetir el mismo bloque de color haría
 * competir a las dos cabeceras en lugar de dejar clara la jerarquía.
 */
const Card = ({ children }: { children: ReactNode }) => (
  <section className="overflow-hidden rounded-xl border border-gray-200 border-l-4 border-l-brand-primary bg-white p-5 shadow-sm sm:p-6">
    {children}
  </section>
);

/** Esqueleto de la tarjeta mientras se pide la ficha. */
export const ApplicantInfoCardSkeleton = () => (
  <Card>
    <div className="flex items-center gap-4">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1">
        <Skeleton variant="text" width="40%" height={28} />
        <Skeleton variant="text" width="30%" />
      </div>
    </div>
  </Card>
);

/** Iniciales del titular, para el círculo. "Rosa Condori" → "RC". */
const initials = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');

interface ApplicantInfoCardProps {
  application: Application;
  /** Abre la corrección. Se omite para quien solo puede leer. */
  onEdit?: () => void;
  /** Abre la baja. Se omite para quien no es admin. */
  onDelete?: () => void;
  /** Abre la aprobación. Se omite si no puede decidir o la ficha ya se decidió. */
  onApprove?: () => void;
  /** Abre el rechazo, con las mismas condiciones que la aprobación. */
  onReject?: () => void;
}

/**
 * Cabecera de la ficha de un solicitante: de quién es y en qué estado está.
 *
 * Mismo criterio que la tarjeta del proyecto: las acciones sobre la ficha
 * —corregir y dar de baja— viven aquí, junto a los datos sobre los que actúan,
 * y no repartidas por las filas del listado. Así el padrón se lee de un
 * vistazo y quien va a corregir ya está viendo lo que va a corregir.
 *
 * Dar de baja es solo de admin: un líder que se equivoca la pide, no la
 * ejecuta (el backend responde 403 igualmente).
 *
 * **Aprobar y rechazar van primero y separados del resto.** No son otra forma
 * de editar: son la decisión que convierte al solicitante en beneficiario, y
 * quien las ve no es quien registra —los líderes levantan la ficha, el
 * supervisor la decide—. El separador vertical marca esa frontera para que
 * *Aprobar* no se pulse por inercia al ir a *Editar*.
 */
export const ApplicantInfoCard = ({
  application,
  onEdit,
  onDelete,
  onApprove,
  onReject,
}: ApplicantInfoCardProps) => {
  const name = personDisplayName(application.person);
  const canDecide = Boolean(onApprove || onReject);

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary to-brand-primary-light text-sm font-semibold text-white"
          >
            {initials(name)}
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold break-words text-gray-900">{name}</h2>
              <Chip
                size="small"
                label={APPLICATION_STATUS_LABELS[application.status]}
                color={APPLICATION_STATUS_COLORS[application.status]}
              />
            </div>
            <p className="mt-0.5 text-sm text-gray-500">
              CI {fullDocument(application.person)} · {application.project.name}
            </p>
          </div>
        </div>

        {(onEdit || onDelete || canDecide) && (
          <div className="flex flex-wrap items-center gap-2">
            {onApprove && (
              <Button fullWidth={false} icon={CheckIcon} onClick={onApprove}>
                Aprobar
              </Button>
            )}
            {onReject && (
              <Button variant="outline" fullWidth={false} icon={XIcon} onClick={onReject}>
                Rechazar
              </Button>
            )}
            {canDecide && (onEdit || onDelete) && (
              <span aria-hidden="true" className="mx-1 hidden h-6 w-px bg-gray-200 sm:block" />
            )}
            {onEdit && (
              <Button variant="outline" fullWidth={false} icon={EditIcon} onClick={onEdit}>
                Editar
              </Button>
            )}
            {onDelete && (
              <Button variant="danger" fullWidth={false} onClick={onDelete}>
                Dar de baja
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
