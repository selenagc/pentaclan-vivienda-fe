/**
 * Tipos del módulo de Solicitantes (backend PV-30).
 *
 * ⚠️ La idea que ordena todo el módulo: **«solicitante» y «beneficiario» no
 * son dos entidades, son dos estados de una misma postulación.** Por eso no
 * existe `GET /applicants` ni `GET /beneficiaries`: hay `applications` con
 * `status`, y la lista de beneficiarios es `GET /applications?status=approved`.
 * Aprobar no mueve filas, cambia una columna, y así los rechazados siguen en
 * el padrón con su motivo, que es lo que permite auditar el programa.
 *
 * Ojo con el desempaquetado: como proyectos y geografía, estos endpoints
 * responden `{ data }` / `{ data, meta }` **sin** `success`, de ahí
 * `DataEnvelope`/`PagedEnvelope` en el servicio.
 */

import type { Property } from './property.types';

/**
 * Estados de la postulación.
 *
 * `approved` y `rejected` los escriben `POST /applications/:id/approve` y
 * `/reject`. `under_review` y `withdrawn` existen en la base pero todavía no
 * tienen endpoint que los fije: se listan porque el filtro los acepta y una
 * ficha podría llegar con ellos desde otra vía.
 */
export type ApplicationStatus =
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'withdrawn';

/** Sexo tal como figura en el documento de identidad. */
export type Sex = 'M' | 'F';

/**
 * Departamento donde se expidió el CI. Es parte de la clave natural de la
 * persona: el número de carnet solo es único junto con el lugar de expedición,
 * así que dos personas pueden compartir número si lo sacaron en departamentos
 * distintos.
 */
export type DocumentIssuedIn =
  | 'LP'
  | 'CB'
  | 'SC'
  | 'OR'
  | 'PT'
  | 'TJ'
  | 'CH'
  | 'BE'
  | 'PD';

/**
 * Datos propios de la persona, sin el cónyuge. Existe aparte de `Person` para
 * cortar la recursión: el cónyuge es una persona completa, pero no se anida su
 * propio cónyuge.
 */
export interface PersonData {
  id: string;
  documentNo: string;
  documentIssuedIn: DocumentIssuedIn;
  givenNames: string;
  paternalSurname: string;
  /** Opcional: hay gente que no lo tiene. */
  maternalSurname: string | null;
  phone: string | null;
  occupation: string | null;
  /**
   * `YYYY-MM-DD`, **no** una fecha ISO con hora.
   *
   * El backend la manda así a propósito: convertirla a `Date` la ancla a un
   * huso horario y una fecha de nacimiento boliviana serializada a UTC se
   * corre un día hacia atrás. Formatéala partiendo la cadena, nunca con
   * `new Date(birthDate)`.
   */
  birthDate: string;
  sex: Sex;
}

/**
 * Persona registrada. No tiene rol: la misma persona puede ser titular en un
 * trámite y cónyuge en otro, y el rol lo da la postulación.
 */
export interface Person extends PersonData {
  /** Nulo cuando el titular no declaró cónyuge. */
  spouse: PersonData | null;
  createdAt: string;
  updatedAt: string;
}

/** Proyecto al que se postula, resumido: no llega su entidad ni su ubicación. */
export interface ApplicationProject {
  id: string;
  name: string;
  contractNo: string;
}

export interface Application {
  id: string;
  status: ApplicationStatus;
  /** Fecha del formulario en campo, que no siempre es la de captura. ISO. */
  submittedAt: string;
  person: Person;
  /**
   * La vivienda a mejorar. Se guarda en la postulación y no se deriva de la
   * persona: la misma persona puede postular a otro proyecto con otro
   * inmueble, y el mismo inmueble puede volver con otro ocupante.
   */
  property: Property;
  project: ApplicationProject;
  /** Auditoría: nombre del usuario que la registró. No llega su id. */
  userName: string;
  /**
   * Los tres son nulos mientras nadie decida, y se llenan juntos al aprobar o
   * rechazar. `rejectionReason` solo viaja con `rejected`: un beneficiario lo
   * tiene siempre en null.
   */
  decidedAt: string | null;
  decidedByName: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Persona tal como viaja en el cuerpo del alta o la edición. */
export interface PersonInput {
  documentNo: string;
  documentIssuedIn: DocumentIssuedIn;
  givenNames: string;
  paternalSurname: string;
  maternalSurname?: string | null;
  phone?: string | null;
  occupation?: string | null;
  /** `YYYY-MM-DD`. El backend rechaza fechas futuras. */
  birthDate: string;
  sex: Sex;
}

/** Vivienda nueva, levantada en el formulario de campo. */
export interface PropertyInput {
  community?: string | null;
  zone?: string | null;
  address?: string | null;
  latitude: number;
  longitude: number;
  /**
   * Tiene que ser el municipio del proyecto: el backend responde 409 si no
   * coincide, porque solo se mejoran viviendas donde se ejecuta la obra.
   */
  municipalityId: number;
}

/**
 * Cuerpo del POST /applications.
 *
 * ⚠️ `propertyId` y `property` son **excluyentes y obligatorio uno de los
 * dos** (`xor` en el backend): mandar los dos o ninguno devuelve 400. El
 * primero es la vivienda elegida del buscador; el segundo, una levantada en
 * campo.
 *
 * `userId` y `status` están `forbidden()`: salen de la sesión y del servidor,
 * y enviarlos devuelve 400 en vez de ignorarse en silencio.
 */
export interface RegisterApplicationInput {
  projectId: string;
  person: PersonInput;
  /** `null` cuando el titular no tiene cónyuge. */
  spouse: PersonInput | null;
  propertyId?: string;
  property?: PropertyInput;
  /** ISO. Si se omite, el backend usa el momento del registro. */
  submittedAt?: string;
}

/**
 * Cuerpo del PUT /applications/:id. Parcial, pero exige al menos un campo.
 *
 * Dos cosas que cambian el resultado y no se ven en el tipo:
 *
 *  - `spouse: null` **desvincula** al cónyuge sin borrar a esa persona, que
 *    puede ser titular de su propia ficha. `undefined` lo deja como está.
 *  - `property` **corrige el inmueble actual en el sitio**, y ese inmueble
 *    puede estar compartido con otras postulaciones. Para apuntar a otra
 *    vivienda distinta va `propertyId`, no `property`.
 *
 * `status` no está: aprobar o rechazar tiene sus propias reglas y su propia
 * auditoría (`POST /applications/:id/approve` y `/reject`), no es una edición
 * de formulario. Enviarlo da 400.
 */
export interface UpdateApplicationInput {
  person?: Partial<PersonInput>;
  spouse?: PersonInput | null;
  propertyId?: string;
  property?: Partial<PropertyInput>;
  submittedAt?: string;
}

/**
 * Cuerpo del POST /applications/:id/reject.
 *
 * El motivo es obligatorio y el backend lo exige: un rechazo sin explicación
 * es una fila que nadie puede justificar seis meses después, que es cuando
 * llega la auditoría. Aprobar, en cambio, no lleva cuerpo.
 */
export interface RejectApplicationInput {
  /** Máximo 500 caracteres (el largo de la columna). */
  rejectionReason: string;
}

/** Query params de GET /applications. */
export interface ListApplicationsParams {
  page?: number;
  /** Máximo 100 (lo impone el backend). */
  limit?: number;
  /** `applicantName` ordena por apellido paterno, como se lee un padrón. */
  sortBy?: 'submittedAt' | 'status' | 'createdAt' | 'applicantName';
  sortOrder?: 'asc' | 'desc';
  /** Busca por nombres, apellidos o número de documento del titular. */
  search?: string;
  projectId?: string;
  /**
   * Uno o varios estados, en OR. Ausente no filtra.
   *
   * Admite lista porque las dos pestañas del padrón salen de este endpoint:
   * los beneficiarios son `approved` y los solicitantes son todos los demás.
   * Esa segunda lista no se puede armar filtrando las filas ya recibidas: el
   * `total` y las páginas los cuenta el servidor y quedarían descuadrados.
   */
  status?: ApplicationStatus | ApplicationStatus[];
  /** Municipio **de la vivienda**, no de la persona. */
  municipalityId?: number;
}

/** "Condori Apaza, Rosa Maria" — orden de padrón, para listar y ordenar. */
export const applicantFullName = (person: PersonData): string => {
  const surnames = [person.paternalSurname, person.maternalSurname].filter(Boolean).join(' ');
  return `${surnames}, ${person.givenNames}`;
};

/** "Rosa Maria Condori Apaza" — orden natural, para títulos y confirmaciones. */
export const personDisplayName = (person: PersonData): string =>
  [person.givenNames, person.paternalSurname, person.maternalSurname]
    .filter(Boolean)
    .join(' ');

/** "4567123 LP" — el documento completo, que es la clave natural. */
export const fullDocument = (person: PersonData): string =>
  `${person.documentNo} ${person.documentIssuedIn}`;
