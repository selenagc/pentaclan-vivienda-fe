import type { FormEvent, ReactNode } from 'react';
import Alert from '@mui/material/Alert';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { FormSection } from '../ui/FormSection';
import { PersonFields } from './PersonFields';
import { PropertyFields } from './PropertyFields';
import type { Project } from '../../types/project.types';
import type { Property } from '../../types/property.types';
import type {
  ApplicationFormErrors,
  ApplicationFormValues,
  PersonFormValues,
  PropertyFormValues,
  PropertyMode,
} from '../../hooks/useApplicationForm';

interface ApplicationFormProps {
  /** Proyecto al que se postula: fija el municipio y encabeza el formulario. */
  project: Project;
  values: ApplicationFormValues;
  errors: ApplicationFormErrors;
  /** Error que no corresponde a ningún campo (500, 404, sin conexión…). */
  generalError: string | null;
  isSubmitting: boolean;
  setPersonField: <K extends keyof PersonFormValues>(
    who: 'person' | 'spouse',
    field: K,
    value: PersonFormValues[K],
  ) => void;
  setPropertyField: <K extends keyof PropertyFormValues>(
    field: K,
    value: PropertyFormValues[K],
  ) => void;
  setHasSpouse: (hasSpouse: boolean) => void;
  setPropertyMode: (mode: PropertyMode) => void;
  selectProperty: (property: Property | null) => void;
  setSubmittedAt: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  /** Presente al corregir una ficha existente. Cambia textos y avisos. */
  isEditing?: boolean;
  submitLabel?: string;
  submitIcon?: ReactNode;
}

const SaveIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 12.75l6 6 9-13.5"
    />
  </svg>
);

/**
 * Formulario de solicitante, en los cuatro bloques del trámite: titular,
 * cónyuge, vivienda y presentación. Sirve igual para registrar y para
 * corregir; lo que cambia son los textos y algún aviso.
 *
 * Es presentacional: el estado, la validación y el envío viven en
 * `useApplicationForm`.
 *
 * ⚠️ **No hay campo de estado.** Toda ficha nace en `pending` y aprobarla o
 * rechazarla es una operación con sus propias reglas y su propia auditoría
 * (PV-31), no una edición de formulario: el backend responde 400 si `status`
 * llega en el cuerpo. Tampoco hay campo de "registrado por": sale de la sesión.
 */
export const ApplicationForm = ({
  project,
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
  onSubmit,
  onCancel,
  isEditing = false,
  submitLabel,
  submitIcon = SaveIcon,
}: ApplicationFormProps) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      // La validación la hacemos nosotros, en español: el navegador se queda
      // al margen para que sus burbujas no se adelanten a nuestros mensajes.
      noValidate
      className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="space-y-6">
        <FormSection stepNumber={1} title="Titular de la postulación" withDivider={false}>
          <PersonFields
            values={values.person}
            errors={errors.person ?? {}}
            onChange={(field, value) => setPersonField('person', field, value)}
            disabled={isSubmitting}
            idPrefix="person"
          />
        </FormSection>

        <FormSection stepNumber={2} title="Cónyuge">
          <FormControlLabel
            control={
              <Checkbox
                checked={values.hasSpouse}
                onChange={(event) => setHasSpouse(event.target.checked)}
                disabled={isSubmitting}
                size="small"
              />
            }
            label="El titular declara cónyuge"
          />

          {values.hasSpouse ? (
            <div className="mt-4">
              <PersonFields
                values={values.spouse}
                errors={errors.spouse ?? {}}
                onChange={(field, value) => setPersonField('spouse', field, value)}
                disabled={isSubmitting}
                idPrefix="spouse"
              />
            </div>
          ) : (
            <p className="mt-1 text-xs text-gray-500">
              {isEditing
                ? 'Al guardar sin marcarlo, el cónyuge queda desvinculado de esta ficha. La persona no se borra: puede ser titular de su propia postulación.'
                : 'Se registra con sus datos completos, no como un nombre suelto: su fecha de nacimiento hace falta para los mismos cortes demográficos que el titular.'}
            </p>
          )}
        </FormSection>

        <FormSection stepNumber={3} title="Vivienda a mejorar">
          <PropertyFields
            municipality={project.municipality}
            mode={values.propertyMode}
            onModeChange={setPropertyMode}
            values={values.property}
            errors={errors.property ?? {}}
            onChange={setPropertyField}
            selectedProperty={values.selectedProperty}
            onSelectProperty={selectProperty}
            selectedPropertyError={errors.selectedProperty}
            disabled={isSubmitting}
            isEditing={isEditing}
          />
        </FormSection>

        <FormSection stepNumber={4} title="Presentación">
          <div className="sm:max-w-xs">
            <Input
              label="Fecha de presentación"
              type="date"
              name="submittedAt"
              value={values.submittedAt}
              onChange={(event) => setSubmittedAt(event.target.value)}
              error={errors.submittedAt}
              required
              disabled={isSubmitting}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Es la fecha del formulario en campo, que no siempre es la de captura. Se puede
            retroceder, pero no adelantar.
          </p>
        </FormSection>
      </div>

      {generalError && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {generalError}
        </Alert>
      )}

      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          fullWidth={false}
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" fullWidth={false} isLoading={isSubmitting} icon={submitIcon}>
          {submitLabel ?? (isEditing ? 'Guardar cambios' : 'Registrar solicitante')}
        </Button>
      </div>
    </form>
  );
};
