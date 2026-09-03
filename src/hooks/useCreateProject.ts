import { useCallback, useState } from 'react';
import axios from 'axios';
import { projectService } from '../services/projectService';
import { getApiFieldErrors } from '../lib/axios';
import { getFriendlyErrorMessage } from '../constants/apiErrorMessages';
import { emptyGeoSelection, type GeoSelection } from '../types/geography.types';
import type { CreateProjectInput, Project } from '../types/project.types';

/** Estado del formulario. `geo` es navegación; solo su municipio se persiste. */
export interface ProjectFormValues {
  name: string;
  contractNo: string;
  geo: GeoSelection;
  publicEntityId: number | null;
}

/** Errores por campo, incluidos los tres niveles de la cascada geográfica. */
export type ProjectFormErrors = Partial<
  Record<
    'name' | 'contractNo' | 'publicEntityId' | 'departmentId' | 'provinceId' | 'municipalityId',
    string
  >
>;

const emptyValues: ProjectFormValues = {
  name: '',
  contractNo: '',
  geo: emptyGeoSelection,
  publicEntityId: null,
};

/** Límites del validator del backend, replicados para avisar antes de enviar. */
const MAX_NAME = 200;
const MAX_CONTRACT_NO = 50;

/**
 * Traducción de los errores de campo del backend. Sus mensajes vienen en
 * inglés y con la jerga de Joi ('"name" is not allowed to be empty'), así
 * que se mapean por `path` y nunca se muestran tal cual.
 */
const FIELD_MESSAGES: Record<string, string> = {
  name: 'Revisa el título del proyecto.',
  contractNo: 'Revisa el número de contrato.',
  publicEntityId: 'Revisa la entidad pública financiadora.',
  municipalityId: 'Revisa el municipio seleccionado.',
};

/** Validación en cliente. Espeja los límites del backend, no los sustituye. */
function validar(values: ProjectFormValues): ProjectFormErrors {
  const errors: ProjectFormErrors = {};

  const name = values.name.trim();
  if (!name) errors.name = 'El título del proyecto es obligatorio.';
  else if (name.length > MAX_NAME) {
    errors.name = `El título no puede superar los ${MAX_NAME} caracteres.`;
  }

  const contractNo = values.contractNo.trim();
  if (!contractNo) errors.contractNo = 'El número de contrato es obligatorio.';
  else if (contractNo.length > MAX_CONTRACT_NO) {
    errors.contractNo = `El número de contrato no puede superar los ${MAX_CONTRACT_NO} caracteres.`;
  }

  // La cascada se valida de arriba abajo: el error se pinta en el primer nivel
  // que falte, que es donde el usuario tiene que actuar.
  if (values.geo.departmentId === null) errors.departmentId = 'Selecciona un departamento.';
  else if (values.geo.provinceId === null) errors.provinceId = 'Selecciona una provincia.';
  else if (values.geo.municipalityId === null) errors.municipalityId = 'Selecciona un municipio.';

  if (values.publicEntityId === null) {
    errors.publicEntityId = 'Selecciona la entidad pública financiadora.';
  }

  return errors;
}

/**
 * Estado y envío del formulario de creación de proyectos.
 *
 * Dos cosas que este hook resuelve y que no son evidentes:
 *
 * 1. **Envía exactamente los cuatro campos del contrato.** El backend valida
 *    con `stripUnknown: true`, así que cualquier extra se descartaría en
 *    silencio devolviendo un 201 engañoso.
 * 2. **Ancla el 409 al campo `contractNo`.** Ese error llega sin `details[]`
 *    y con el texto en inglés ("Nro de contrato already in use"), de modo que
 *    `getApiFieldErrors` no lo asocia a ningún campo: hay que detectarlo por
 *    status. Es el error más probable de esta pantalla.
 */
export const useCreateProject = (onSuccess: (project: Project) => void) => {
  const [values, setValues] = useState<ProjectFormValues>(emptyValues);
  const [errors, setErrors] = useState<ProjectFormErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Actualiza un campo y limpia su error, para que no quede en rojo al corregir. */
  const setField = useCallback(<K extends keyof ProjectFormValues>(
    field: K,
    value: ProjectFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      if (field === 'geo') {
        // Al tocar la cascada se limpian los tres niveles a la vez.
        delete next.departmentId;
        delete next.provinceId;
        delete next.municipalityId;
      } else {
        delete next[field as keyof ProjectFormErrors];
      }
      return next;
    });
  }, []);

  const submit = useCallback(async () => {
    const validationErrors = validar(values);
    setErrors(validationErrors);
    setGeneralError(null);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      // El cuerpo se arma campo por campo a propósito: nada de `...values`.
      const input: CreateProjectInput = {
        name: values.name.trim(),
        contractNo: values.contractNo.trim(),
        publicEntityId: values.publicEntityId as number,
        municipalityId: values.geo.municipalityId as number,
      };

      const project = await projectService.create(input);
      onSuccess(project);
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;

      if (status === 409) {
        setErrors({ contractNo: 'Ese número de contrato ya está registrado.' });
        return;
      }

      const fieldErrors = getApiFieldErrors(err);
      const traducidos: ProjectFormErrors = {};
      for (const path of Object.keys(fieldErrors)) {
        if (path in FIELD_MESSAGES) {
          traducidos[path as keyof ProjectFormErrors] = FIELD_MESSAGES[path];
        }
      }

      if (Object.keys(traducidos).length > 0) {
        setErrors(traducidos);
        return;
      }

      setGeneralError(getFriendlyErrorMessage(err, 'No se pudo crear el proyecto.'));
    } finally {
      setIsSubmitting(false);
    }
  }, [values, onSuccess]);

  return { values, setField, errors, generalError, isSubmitting, submit };
};
