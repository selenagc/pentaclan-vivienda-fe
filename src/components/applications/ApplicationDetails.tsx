import {
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

interface ApplicationDetailsProps {
  application: Application;
}

/**
 * Datos generales de una ficha, de solo lectura: titular, cónyuge, vivienda y
 * trámite.
 *
 * Es el contenido que antes vivía en un modal del listado y ahora es la
 * primera pestaña de la ficha, junto a los dos diagnósticos. Se separó del
 * modal porque el bloque es el mismo se muestre donde se muestre; quien lo
 * usa decide el marco.
 *
 * El estado se muestra en la tarjeta de cabecera, no aquí, y no se toca:
 * cambiarlo es del ticket de aprobación.
 */
export const ApplicationDetails = ({ application }: ApplicationDetailsProps) => {
  const { person, property } = application;

  return (
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
      {/* Los tres campos de decisión se llenan al aprobar o rechazar; hasta
          entonces la ficha no tiene nada que mostrar aquí. */}
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
  );
};
