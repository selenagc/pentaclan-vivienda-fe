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

const EditIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
    />
  </svg>
);

/** Marco común de la tarjeta, para que carga y contenido midan lo mismo. */
const Card = ({ children }: { children: ReactNode }) => (
  <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
    {children}
  </section>
);

/** Esqueleto de la tarjeta mientras se pide la ficha. */
export const ApplicantInfoCardSkeleton = () => (
  <Card>
    <Skeleton variant="text" width="40%" height={30} />
    <Skeleton variant="text" width="30%" />
  </Card>
);

interface ApplicantInfoCardProps {
  application: Application;
  /** Abre la corrección. Se omite para quien solo puede leer. */
  onEdit?: () => void;
  /** Abre la baja. Se omite para quien no es admin. */
  onDelete?: () => void;
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
 */
export const ApplicantInfoCard = ({ application, onEdit, onDelete }: ApplicantInfoCardProps) => (
  <Card>
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold break-words text-gray-900">
            {personDisplayName(application.person)}
          </h2>
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

      {(onEdit || onDelete) && (
        <div className="flex flex-wrap gap-2">
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
