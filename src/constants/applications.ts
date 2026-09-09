import type { ApplicationStatus, DocumentIssuedIn, Sex } from '../types/application.types';

/**
 * Etiquetas legibles del módulo de solicitantes. Igual que
 * `apiErrorMessages`, la traducción se hace **por código**, nunca mostrando el
 * texto crudo del backend, que viene en inglés.
 */

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: 'Pendiente',
  under_review: 'En revisión',
  approved: 'Aprobada',
  rejected: 'Rechazada',
  withdrawn: 'Retirada',
};

/**
 * Color del chip de estado. `approved` en verde y `rejected` en rojo son los
 * dos que el operador busca de un vistazo; el resto queda neutro para que no
 * compitan por la atención.
 */
export const APPLICATION_STATUS_COLORS: Record<
  ApplicationStatus,
  'default' | 'info' | 'success' | 'error' | 'warning'
> = {
  pending: 'default',
  under_review: 'info',
  approved: 'success',
  rejected: 'error',
  withdrawn: 'warning',
};

/** Departamento de expedición del CI, parte de la clave natural de la persona. */
export const DOCUMENT_ISSUED_IN_LABELS: Record<DocumentIssuedIn, string> = {
  LP: 'La Paz',
  CB: 'Cochabamba',
  SC: 'Santa Cruz',
  OR: 'Oruro',
  PT: 'Potosí',
  TJ: 'Tarija',
  CH: 'Chuquisaca',
  BE: 'Beni',
  PD: 'Pando',
};

/** Opciones del desplegable: "LP — La Paz", que es como se lee en el carnet. */
export const DOCUMENT_ISSUED_IN_OPTIONS = (
  Object.keys(DOCUMENT_ISSUED_IN_LABELS) as DocumentIssuedIn[]
).map((value) => ({ value, label: `${value} — ${DOCUMENT_ISSUED_IN_LABELS[value]}` }));

export const SEX_LABELS: Record<Sex, string> = {
  F: 'Femenino',
  M: 'Masculino',
};

export const SEX_OPTIONS = (Object.keys(SEX_LABELS) as Sex[]).map((value) => ({
  value,
  label: SEX_LABELS[value],
}));

/**
 * Quién puede registrar y corregir fichas, según `applications.routes.ts` del
 * backend. `project_supervisor` queda fuera de la escritura pero sí puede leer,
 * y **eliminar es solo de admin**: un líder que se equivoca pide la baja, no la
 * ejecuta.
 */
export const CAN_WRITE_APPLICATIONS = ['admin', 'social_lead', 'technical_lead'] as const;
