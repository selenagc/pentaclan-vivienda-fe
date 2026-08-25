import { useCallback, useState } from 'react';
import axios from 'axios';
import { proyectoService } from '../services/proyectoService';
import { getApiFieldErrors } from '../lib/axios';
import { getFriendlyErrorMessage } from '../constants/apiErrorMessages';
import { emptyGeoSelection, type GeoSelection } from '../types/geografia.types';
import type { CreateProyectoInput, Proyecto } from '../types/proyecto.types';

/** Estado del formulario. `geo` es navegación; solo su municipio se persiste. */
export interface ProyectoFormValues {
  nombre: string;
  nroContrato: string;
  geo: GeoSelection;
  entidadPublicaId: number | null;
}

/** Errores por campo, incluidos los tres niveles de la cascada geográfica. */
export type ProyectoFormErrors = Partial<
  Record<
    'nombre' | 'nroContrato' | 'entidadPublicaId' | 'departamentoId' | 'provinciaId' | 'municipioId',
    string
  >
>;

const emptyValues: ProyectoFormValues = {
  nombre: '',
  nroContrato: '',
  geo: emptyGeoSelection,
  entidadPublicaId: null,
};

/** Límites del validator del backend, replicados para avisar antes de enviar. */
const MAX_NOMBRE = 200;
const MAX_NRO_CONTRATO = 50;

/**
 * Traducción de los errores de campo del backend. Sus mensajes vienen en
 * inglés y con la jerga de Joi ('"nombre" is not allowed to be empty'), así
 * que se mapean por `path` y nunca se muestran tal cual.
 */
const MENSAJES_POR_CAMPO: Record<string, string> = {
  nombre: 'Revisa el título del proyecto.',
  nroContrato: 'Revisa el número de contrato.',
  entidadPublicaId: 'Revisa la entidad pública financiadora.',
  municipioId: 'Revisa el municipio seleccionado.',
};

/** Validación en cliente. Espeja los límites del backend, no los sustituye. */
function validar(values: ProyectoFormValues): ProyectoFormErrors {
  const errors: ProyectoFormErrors = {};

  const nombre = values.nombre.trim();
  if (!nombre) errors.nombre = 'El título del proyecto es obligatorio.';
  else if (nombre.length > MAX_NOMBRE) {
    errors.nombre = `El título no puede superar los ${MAX_NOMBRE} caracteres.`;
  }

  const nroContrato = values.nroContrato.trim();
  if (!nroContrato) errors.nroContrato = 'El número de contrato es obligatorio.';
  else if (nroContrato.length > MAX_NRO_CONTRATO) {
    errors.nroContrato = `El número de contrato no puede superar los ${MAX_NRO_CONTRATO} caracteres.`;
  }

  // La cascada se valida de arriba abajo: el error se pinta en el primer nivel
  // que falte, que es donde el usuario tiene que actuar.
  if (values.geo.departamentoId === null) errors.departamentoId = 'Selecciona un departamento.';
  else if (values.geo.provinciaId === null) errors.provinciaId = 'Selecciona una provincia.';
  else if (values.geo.municipioId === null) errors.municipioId = 'Selecciona un municipio.';

  if (values.entidadPublicaId === null) {
    errors.entidadPublicaId = 'Selecciona la entidad pública financiadora.';
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
 * 2. **Ancla el 409 al campo `nroContrato`.** Ese error llega sin `details[]`
 *    y con el texto en inglés ("Nro de contrato already in use"), de modo que
 *    `getApiFieldErrors` no lo asocia a ningún campo: hay que detectarlo por
 *    status. Es el error más probable de esta pantalla.
 */
export const useCrearProyecto = (onSuccess: (proyecto: Proyecto) => void) => {
  const [values, setValues] = useState<ProyectoFormValues>(emptyValues);
  const [errors, setErrors] = useState<ProyectoFormErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Actualiza un campo y limpia su error, para que no quede en rojo al corregir. */
  const setField = useCallback(<K extends keyof ProyectoFormValues>(
    field: K,
    value: ProyectoFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      if (field === 'geo') {
        // Al tocar la cascada se limpian los tres niveles a la vez.
        delete next.departamentoId;
        delete next.provinciaId;
        delete next.municipioId;
      } else {
        delete next[field as keyof ProyectoFormErrors];
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
      const input: CreateProyectoInput = {
        nombre: values.nombre.trim(),
        nroContrato: values.nroContrato.trim(),
        entidadPublicaId: values.entidadPublicaId as number,
        municipioId: values.geo.municipioId as number,
      };

      const proyecto = await proyectoService.create(input);
      onSuccess(proyecto);
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;

      if (status === 409) {
        setErrors({ nroContrato: 'Ese número de contrato ya está registrado.' });
        return;
      }

      const fieldErrors = getApiFieldErrors(err);
      const traducidos: ProyectoFormErrors = {};
      for (const path of Object.keys(fieldErrors)) {
        if (path in MENSAJES_POR_CAMPO) {
          traducidos[path as keyof ProyectoFormErrors] = MENSAJES_POR_CAMPO[path];
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
