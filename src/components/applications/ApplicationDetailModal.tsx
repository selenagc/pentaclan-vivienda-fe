import Chip from '@mui/material/Chip';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import {
  APPLICATION_STATUS_COLORS,
  APPLICATION_STATUS_LABELS,
  DOCUMENT_ISSUED_IN_LABELS,
  SEX_LABELS,
} from '../../constants/applications';
import { fullLocation } from '../../types/geography.types';
import { propertyLabel } from '../../types/property.types';
import {
  fullDocument,
  personDisplayName,
  type Application,
  type PersonData,
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

/** Fecha larga en formato boliviano, desde un instante ISO del backend. */
const formatTimestamp = (iso: string): string =>
  new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' });

/**
 * Fecha de nacimiento, que llega como `YYYY-MM-DD` sin hora.
 *
 * Se parte a mano y se construye con el constructor **local** en vez de
 * `new Date('1948-07-09')`, que JavaScript interpreta como UTC: en Bolivia
 * (UTC−4) eso mostraría el 8 de julio.
 */
const formatDateOnly = (value: string): string => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

interface DetailRowProps {
  label: string;
  value: string;
}

const DetailRow = ({ label, value }: DetailRowProps) => (
  <div className="grid grid-cols-[minmax(0,8rem)_minmax(0,1fr)] gap-3 py-2.5">
    <dt className="text-sm text-gray-500">{label}</dt>
    <dd className="text-sm text-gray-900">{value}</dd>
  </div>
);

const SectionTitle = ({ children }: { children: string }) => (
  <h3 className="pt-4 pb-1 text-xs font-semibold tracking-wide text-gray-500 uppercase">
    {children}
  </h3>
);

/** Las filas comunes a titular y cónyuge, que se pintan igual en ambos casos. */
const PersonRows = ({ person }: { person: PersonData }) => (
  <>
    <DetailRow label="Nombre" value={personDisplayName(person)} />
    <DetailRow
      label="Documento"
      value={`${fullDocument(person)} (${DOCUMENT_ISSUED_IN_LABELS[person.documentIssuedIn]})`}
    />
    <DetailRow label="Nacimiento" value={formatDateOnly(person.birthDate)} />
    <DetailRow label="Sexo" value={SEX_LABELS[person.sex]} />
    <DetailRow label="Teléfono" value={person.phone ?? 'No registrado'} />
    <DetailRow label="Ocupación" value={person.occupation ?? 'No registrada'} />
  </>
);

interface ApplicationDetailModalProps {
  open: boolean;
  onClose: () => void;
  /** Ficha a mostrar. `null` mientras no hay ninguna seleccionada. */
  application: Application | null;
  /** Abre la corrección desde el detalle. Si se omite, no se ofrece el botón. */
  onEdit?: (application: Application) => void;
}

/**
 * Detalle de una postulación, de solo lectura.
 *
 * No pide nada al backend: `GET /applications` ya devuelve la persona con su
 * cónyuge, la vivienda con su municipio resuelto hasta el departamento y el
 * proyecto, así que se pinta con la misma fila del listado y abre al instante.
 *
 * El estado se muestra pero no se toca: cambiarlo es de PV-31.
 */
export const ApplicationDetailModal = ({
  open,
  onClose,
  application,
  onEdit,
}: ApplicationDetailModalProps) => {
  if (!application) return null;

  const { person, property } = application;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={personDisplayName(person)}
      size="lg"
      footer={
        <>
          <Button variant="outline" fullWidth={false} onClick={onClose}>
            Cerrar
          </Button>
          {onEdit && (
            <Button fullWidth={false} icon={EditIcon} onClick={() => onEdit(application)}>
              Editar
            </Button>
          )}
        </>
      }
    >
      <div className="mb-2">
        <Chip
          size="small"
          label={APPLICATION_STATUS_LABELS[application.status]}
          color={APPLICATION_STATUS_COLORS[application.status]}
        />
      </div>

      <dl className="divide-y divide-gray-100">
        <SectionTitle>Titular</SectionTitle>
        <PersonRows person={person} />

        <SectionTitle>Cónyuge</SectionTitle>
        {person.spouse ? (
          <PersonRows person={person.spouse} />
        ) : (
          <DetailRow label="Cónyuge" value="No declarado" />
        )}

        <SectionTitle>Vivienda</SectionTitle>
        <DetailRow label="Ubicación" value={propertyLabel(property)} />
        <DetailRow label="Municipio" value={fullLocation(property.municipality)} />
        <DetailRow label="Coordenadas" value={`${property.latitude}, ${property.longitude}`} />

        <SectionTitle>Trámite</SectionTitle>
        <DetailRow label="Proyecto" value={application.project.name} />
        <DetailRow label="Nº de contrato" value={application.project.contractNo} />
        <DetailRow label="Presentada" value={formatTimestamp(application.submittedAt)} />
        <DetailRow label="Registrada por" value={application.userName} />
        {/* Los tres campos de decisión se llenan al aprobar o rechazar (PV-31);
            hasta entonces la ficha no tiene nada que mostrar aquí. */}
        {application.decidedAt && (
          <DetailRow label="Decidida" value={formatTimestamp(application.decidedAt)} />
        )}
        {application.decidedByName && (
          <DetailRow label="Decidida por" value={application.decidedByName} />
        )}
        {application.rejectionReason && (
          <DetailRow label="Motivo del rechazo" value={application.rejectionReason} />
        )}
      </dl>
    </Modal>
  );
};
