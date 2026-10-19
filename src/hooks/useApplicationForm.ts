import { useCallback, useState } from 'react';
import axios from 'axios';
import { applicationService } from '../services/applicationService';
import { getApiFieldErrors } from '../lib/axios';
import { getFriendlyErrorMessage } from '../constants/apiErrorMessages';
import type {
  Application,
  DocumentIssuedIn,
  PersonData,
  PersonInput,
  RegisterApplicationInput,
  Sex,
  UpdateApplicationInput,
} from '../types/application.types';
import type { Project } from '../types/project.types';
import type { Property } from '../types/property.types';

/**
 * Los campos van como texto porque salen de inputs: los desplegables arrancan
 * en `''` (sin elegir) y las coordenadas se guardan crudas hasta el envío, así
 * el usuario puede escribir "-16." sin que el estado lo convierta en `NaN` a
 * media tecla.
 */
export interface PersonFormValues {
  documentNo: string;
  documentIssuedIn: DocumentIssuedIn | '';
  givenNames: string;
  paternalSurname: string;
  maternalSurname: string;
  phone: string;
  occupation: string;
  /** `YYYY-MM-DD`, tal cual lo entrega un `<input type="date">`. */
  birthDate: string;
  sex: Sex | '';
}

export interface PropertyFormValues {
  community: string;
  zone: string;
  address: string;
  latitude: string;
  longitude: string;
}

/**
 * La vivienda entra de dos formas y **solo una a la vez** (`xor` del backend):
 * `existing` cuando el operador la eligió del buscador, `new` cuando la
 * levantó en campo.
 */
export type PropertyMode = 'new' | 'existing';

export interface ApplicationFormValues {
  person: PersonFormValues;
  /** Controla si el bloque del cónyuge se envía. Al editar, desmarcarlo lo desvincula. */
  hasSpouse: boolean;
  spouse: PersonFormValues;
  propertyMode: PropertyMode;
  /** Vivienda elegida del buscador. Se guarda entera para poder mostrarla. */
  selectedProperty: Property | null;
  property: PropertyFormValues;
  /** `YYYY-MM-DD`: fecha del formulario en campo, que no es la de captura. */
  submittedAt: string;
}

export type PersonFormErrors = Partial<Record<keyof PersonFormValues, string>>;
export type PropertyFormErrors = Partial<Record<keyof PropertyFormValues, string>>;

export interface ApplicationFormErrors {
  person?: PersonFormErrors;
  spouse?: PersonFormErrors;
  property?: PropertyFormErrors;
  /** Error del buscador: no se eligió ninguna vivienda. */
  selectedProperty?: string;
  submittedAt?: string;
}

/** Límites del validator del backend, replicados para avisar antes de enviar. */
const MAX = {
  documentNo: 20,
  givenNames: 150,
  paternalSurname: 100,
  maternalSurname: 100,
  phone: 30,
  occupation: 120,
  community: 150,
  zone: 150,
  address: 250,
} as const;

const emptyPerson: PersonFormValues = {
  documentNo: '',
  documentIssuedIn: '',
  givenNames: '',
  paternalSurname: '',
  maternalSurname: '',
  phone: '',
  occupation: '',
  birthDate: '',
  sex: '',
};

const emptyProperty: PropertyFormValues = {
  community: '',
  zone: '',
  address: '',
  latitude: '',
  longitude: '',
};

/**
 * Hoy en horario local, en `YYYY-MM-DD`.
 *
 * Deliberadamente sin `toISOString()`, que pasa por UTC: en Bolivia (UTC−4)
 * una captura de las 21:00 se convertiría en la fecha de mañana y el backend
 * la rechazaría por futura.
 */
const todayLocal = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

/** Convierte lo que devolvió el backend en lo que espera el formulario. */
const valuesFromPerson = (person: PersonData): PersonFormValues => ({
  documentNo: person.documentNo,
  documentIssuedIn: person.documentIssuedIn,
  givenNames: person.givenNames,
  paternalSurname: person.paternalSurname,
  maternalSurname: person.maternalSurname ?? '',
  phone: person.phone ?? '',
  occupation: person.occupation ?? '',
  birthDate: person.birthDate,
  sex: person.sex,
});

const valuesFromApplication = (application: Application): ApplicationFormValues => ({
  person: valuesFromPerson(application.person),
  hasSpouse: application.person.spouse !== null,
  spouse: application.person.spouse ? valuesFromPerson(application.person.spouse) : emptyPerson,
  // Al editar se arranca corrigiendo la vivienda que ya tiene la ficha, que es
  // lo habitual; cambiar de inmueble es la excepción y exige ir al buscador.
  propertyMode: 'new',
  selectedProperty: null,
  property: {
    community: application.property.community ?? '',
    zone: application.property.zone ?? '',
    address: application.property.address ?? '',
    latitude: String(application.property.latitude),
    longitude: String(application.property.longitude),
  },
  // `submittedAt` llega ISO con hora; el input de fecha solo quiere el día.
  submittedAt: application.submittedAt.slice(0, 10),
});

/** Texto → `PersonInput`. Los opcionales vacíos viajan como `null`, no como "". */
const toPersonInput = (values: PersonFormValues): PersonInput => ({
  documentNo: values.documentNo.trim(),
  documentIssuedIn: values.documentIssuedIn as DocumentIssuedIn,
  givenNames: values.givenNames.trim(),
  paternalSurname: values.paternalSurname.trim(),
  maternalSurname: values.maternalSurname.trim() || null,
  phone: values.phone.trim() || null,
  occupation: values.occupation.trim() || null,
  birthDate: values.birthDate,
  sex: values.sex as Sex,
});

/** Valida una persona (titular o cónyuge) contra los límites del backend. */
function validatePerson(values: PersonFormValues): PersonFormErrors {
  const errors: PersonFormErrors = {};

  const documentNo = values.documentNo.trim();
  if (!documentNo) errors.documentNo = 'El número de documento es obligatorio.';
  else if (documentNo.length > MAX.documentNo) {
    errors.documentNo = `No puede superar los ${MAX.documentNo} caracteres.`;
  }

  if (!values.documentIssuedIn) errors.documentIssuedIn = 'Indica dónde se expidió.';

  const givenNames = values.givenNames.trim();
  if (!givenNames) errors.givenNames = 'Los nombres son obligatorios.';
  else if (givenNames.length > MAX.givenNames) {
    errors.givenNames = `No pueden superar los ${MAX.givenNames} caracteres.`;
  }

  const paternalSurname = values.paternalSurname.trim();
  if (!paternalSurname) errors.paternalSurname = 'El apellido paterno es obligatorio.';
  else if (paternalSurname.length > MAX.paternalSurname) {
    errors.paternalSurname = `No puede superar los ${MAX.paternalSurname} caracteres.`;
  }

  if (values.maternalSurname.trim().length > MAX.maternalSurname) {
    errors.maternalSurname = `No puede superar los ${MAX.maternalSurname} caracteres.`;
  }
  if (values.phone.trim().length > MAX.phone) {
    errors.phone = `No puede superar los ${MAX.phone} caracteres.`;
  }
  if (values.occupation.trim().length > MAX.occupation) {
    errors.occupation = `No puede superar los ${MAX.occupation} caracteres.`;
  }

  // La fecha se compara como cadena contra hoy: ambas están en `YYYY-MM-DD` y
  // el orden alfabético coincide con el cronológico, así que no hace falta
  // construir un `Date` y arriesgarse al corrimiento de huso.
  if (!values.birthDate) errors.birthDate = 'La fecha de nacimiento es obligatoria.';
  else if (values.birthDate > todayLocal()) {
    errors.birthDate = 'La fecha de nacimiento no puede estar en el futuro.';
  }

  if (!values.sex) errors.sex = 'Indica el sexo.';

  return errors;
}

function validateProperty(values: PropertyFormValues): PropertyFormErrors {
  const errors: PropertyFormErrors = {};

  // El backend exige comunidad **o** dirección: sin al menos una, el buscador
  // de viviendas no sirve de nada. La zona sola no basta.
  if (!values.community.trim() && !values.address.trim()) {
    errors.community = 'Indica al menos la comunidad o la dirección.';
  }

  if (values.community.trim().length > MAX.community) {
    errors.community = `No puede superar los ${MAX.community} caracteres.`;
  }
  if (values.zone.trim().length > MAX.zone) {
    errors.zone = `No puede superar los ${MAX.zone} caracteres.`;
  }
  if (values.address.trim().length > MAX.address) {
    errors.address = `No puede superar los ${MAX.address} caracteres.`;
  }

  const latitude = Number(values.latitude);
  if (!values.latitude.trim()) errors.latitude = 'La latitud es obligatoria.';
  else if (Number.isNaN(latitude)) errors.latitude = 'Debe ser un número.';
  else if (latitude < -90 || latitude > 90) errors.latitude = 'Debe estar entre -90 y 90.';

  const longitude = Number(values.longitude);
  if (!values.longitude.trim()) errors.longitude = 'La longitud es obligatoria.';
  else if (Number.isNaN(longitude)) errors.longitude = 'Debe ser un número.';
  else if (longitude < -180 || longitude > 180) errors.longitude = 'Debe estar entre -180 y 180.';

  return errors;
}

/** Reparte los `error.details[]` del backend (`person.birthDate`) por bloque. */
function mapFieldErrors(error: unknown): ApplicationFormErrors {
  const mapped: ApplicationFormErrors = {};

  for (const path of Object.keys(getApiFieldErrors(error))) {
    const [block, field] = path.split('.');
    if (!field) continue;
    if (block !== 'person' && block !== 'spouse' && block !== 'property') continue;
    // El texto del backend viene en inglés y con jerga de Joi, así que se
    // muestra un mensaje propio: lo que se aprovecha es *qué campo* falló.
    mapped[block] = { ...mapped[block], [field]: 'Revisa este dato.' };
  }

  return mapped;
}

export interface UseApplicationFormOptions {
  /** Proyecto al que se postula. Fija el municipio de la vivienda. */
  project: Project;
  /**
   * Ficha a editar. Si se omite, el formulario registra una nueva. Lo que
   * decide el modo es este dato y no una bandera aparte, así no puede quedar
   * un `mode: 'edit'` sin ficha que editar.
   */
  application?: Application | null;
  onSuccess: (application: Application) => void;
}

/**
 * Estado, validación y envío del formulario de solicitante, tanto al registrar
 * como al corregir.
 *
 * Cuatro cosas que resuelve y que no se ven en la firma:
 *
 * 1. **El municipio de la vivienda no lo elige el usuario.** Sale del proyecto.
 *    El backend responde 409 si la vivienda no está donde se ejecuta la obra,
 *    así que ofrecer un selector geográfico sería ofrecer un camino al error.
 * 2. **`propertyId` y `property` son excluyentes.** Se envía uno u otro según
 *    el modo; mandar los dos, o ninguno, es un 400.
 * 3. **Al corregir, `property` modifica la vivienda existente en el sitio**, y
 *    esa vivienda puede estar compartida con otra ficha (marido y esposa que
 *    postulan la misma casa). Cambiar *de* vivienda es `propertyId`.
 * 4. **`spouse: null` desvincula sin borrar** a esa persona, que puede ser
 *    titular de su propia ficha en otro proyecto.
 */
export const useApplicationForm = ({
  project,
  application = null,
  onSuccess,
}: UseApplicationFormOptions) => {
  const [values, setValues] = useState<ApplicationFormValues>(
    application
      ? valuesFromApplication(application)
      : {
          person: emptyPerson,
          hasSpouse: false,
          spouse: emptyPerson,
          propertyMode: 'new',
          selectedProperty: null,
          property: emptyProperty,
          submittedAt: todayLocal(),
        },
  );
  const [errors, setErrors] = useState<ApplicationFormErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Actualiza un campo de una persona y limpia su error, para que no siga en rojo. */
  const setPersonField = useCallback(
    <K extends keyof PersonFormValues>(
      who: 'person' | 'spouse',
      field: K,
      value: PersonFormValues[K],
    ) => {
      setValues((prev) => ({ ...prev, [who]: { ...prev[who], [field]: value } }));
      setErrors((prev) => {
        if (!prev[who]) return prev;
        const block = { ...prev[who] };
        delete block[field];
        return { ...prev, [who]: block };
      });
    },
    [],
  );

  const setPropertyField = useCallback(
    <K extends keyof PropertyFormValues>(field: K, value: PropertyFormValues[K]) => {
      setValues((prev) => ({ ...prev, property: { ...prev.property, [field]: value } }));
      setErrors((prev) => {
        if (!prev.property) return prev;
        const block = { ...prev.property };
        delete block[field];
        // La regla "comunidad o dirección" pinta su error en `community`, así
        // que escribir la dirección también tiene que apagarlo.
        if (field === 'address') delete block.community;
        return { ...prev, property: block };
      });
    },
    [],
  );

  const setHasSpouse = useCallback((hasSpouse: boolean) => {
    setValues((prev) => ({ ...prev, hasSpouse }));
    // Los errores del cónyuge dejan de aplicar en cuanto se quita el bloque.
    setErrors((prev) => ({ ...prev, spouse: undefined }));
  }, []);

  const setPropertyMode = useCallback((propertyMode: PropertyMode) => {
    setValues((prev) => ({ ...prev, propertyMode }));
    setErrors((prev) => ({ ...prev, property: undefined, selectedProperty: undefined }));
  }, []);

  const selectProperty = useCallback((selectedProperty: Property | null) => {
    setValues((prev) => ({ ...prev, selectedProperty }));
    setErrors((prev) => ({ ...prev, selectedProperty: undefined }));
  }, []);

  const setSubmittedAt = useCallback((submittedAt: string) => {
    setValues((prev) => ({ ...prev, submittedAt }));
    setErrors((prev) => ({ ...prev, submittedAt: undefined }));
  }, []);

  const submit = useCallback(async () => {
    const validationErrors: ApplicationFormErrors = {};

    const personErrors = validatePerson(values.person);
    if (Object.keys(personErrors).length > 0) validationErrors.person = personErrors;

    if (values.hasSpouse) {
      const spouseErrors = validatePerson(values.spouse);
      // El backend rechaza que titular y cónyuge sean la misma persona; se
      // avisa aquí porque es un error de captura fácil de cometer al copiar.
      if (
        values.spouse.documentNo.trim() === values.person.documentNo.trim() &&
        values.spouse.documentIssuedIn === values.person.documentIssuedIn &&
        values.spouse.documentNo.trim() !== ''
      ) {
        spouseErrors.documentNo = 'El cónyuge no puede tener el mismo documento que el titular.';
      }
      if (Object.keys(spouseErrors).length > 0) validationErrors.spouse = spouseErrors;
    }

    if (values.propertyMode === 'new') {
      const propertyErrors = validateProperty(values.property);
      if (Object.keys(propertyErrors).length > 0) validationErrors.property = propertyErrors;
    } else if (!values.selectedProperty) {
      validationErrors.selectedProperty = 'Elige una vivienda del buscador.';
    }

    if (!values.submittedAt) {
      validationErrors.submittedAt = 'La fecha de presentación es obligatoria.';
    } else if (values.submittedAt > todayLocal()) {
      validationErrors.submittedAt = 'La fecha de presentación no puede estar en el futuro.';
    }

    setErrors(validationErrors);
    setGeneralError(null);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const person = toPersonInput(values.person);
      const spouse = values.hasSpouse ? toPersonInput(values.spouse) : null;

      // Solo uno de los dos viaja: el `xor`/`oxor` del backend rechaza ambos.
      const propertyPart =
        values.propertyMode === 'existing'
          ? { propertyId: values.selectedProperty!.id }
          : {
              property: {
                community: values.property.community.trim() || null,
                zone: values.property.zone.trim() || null,
                address: values.property.address.trim() || null,
                latitude: Number(values.property.latitude),
                longitude: Number(values.property.longitude),
                // No lo elige el usuario: la vivienda tiene que estar donde se
                // ejecuta el proyecto o el backend responde 409.
                municipalityId: project.municipality.id,
              },
            };

      let saved: Application;
      if (application) {
        const input: UpdateApplicationInput = {
          person,
          spouse,
          submittedAt: values.submittedAt,
          ...propertyPart,
        };
        saved = await applicationService.update(application.id, input);
      } else {
        const input: RegisterApplicationInput = {
          projectId: project.id,
          person,
          spouse,
          submittedAt: values.submittedAt,
          ...propertyPart,
        };
        saved = await applicationService.create(input);
      }

      onSuccess(saved);
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;

      if (status === 409) {
        // Un mismo código para dos causas distintas, así que aquí toca mirar
        // el texto: el backend nombra el municipio esperado ("must be located
        // in Collana") cuando la vivienda cae fuera del área del proyecto.
        const message = axios.isAxiosError(err)
          ? (err.response?.data?.error?.message ?? '')
          : '';

        if (message.includes('located in')) {
          setGeneralError(
            `La vivienda debe estar en ${project.municipality.name}, que es donde se ejecuta el proyecto.`,
          );
        } else {
          setErrors({
            person: { documentNo: 'Esta persona ya tiene una ficha en este proyecto.' },
          });
        }
        return;
      }

      const fieldErrors = mapFieldErrors(err);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
        return;
      }

      setGeneralError(
        getFriendlyErrorMessage(
          err,
          application ? 'No se pudo guardar la ficha.' : 'No se pudo registrar al solicitante.',
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [values, project, application, onSuccess]);

  return {
    values,
    errors,
    generalError,
    isSubmitting,
    setPersonField,
    setPropertyField,
    setHasSpouse,
    setPropertyMode,
    selectProperty,
    setSubmittedAt,
    submit,
  };
};
