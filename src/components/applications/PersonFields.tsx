import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { DOCUMENT_ISSUED_IN_OPTIONS, SEX_OPTIONS } from '../../constants/applications';
import type { DocumentIssuedIn, Sex } from '../../types/application.types';
import type { PersonFormErrors, PersonFormValues } from '../../hooks/useApplicationForm';

interface PersonFieldsProps {
  values: PersonFormValues;
  errors: PersonFormErrors;
  onChange: <K extends keyof PersonFormValues>(field: K, value: PersonFormValues[K]) => void;
  disabled?: boolean;
  /**
   * Prefijo de los `name` e `id` de los campos. Hacen falta distintos porque
   * titular y cónyuge se pintan a la vez en la misma página: sin esto las dos
   * etiquetas apuntarían al mismo input y el clic llevaría al campo equivocado.
   */
  idPrefix: string;
}

/**
 * Los nueve campos de una persona del trámite. Se usa dos veces en el mismo
 * formulario, para el titular y para el cónyuge, porque el backend guarda al
 * cónyuge como una persona completa y no como cuatro textos sueltos: hace
 * falta su fecha de nacimiento para los mismos cortes demográficos que el
 * titular, y así se puede detectar que postuló por su cuenta.
 *
 * Qué es obligatorio y por qué, siguiendo al backend: documento, nombres,
 * apellido paterno, fecha de nacimiento y sexo salen del CI que se está
 * transcribiendo. Apellido materno (hay gente que no lo tiene), teléfono y
 * ocupación quedan opcionales porque en campo faltan seguido.
 *
 * Es presentacional: el estado y la validación viven en `useApplicationForm`.
 */
export const PersonFields = ({
  values,
  errors,
  onChange,
  disabled,
  idPrefix,
}: PersonFieldsProps) => (
  <div className="grid gap-4 sm:grid-cols-2">
    <Input
      label="Nº de documento"
      name={`${idPrefix}-documentNo`}
      value={values.documentNo}
      onChange={(event) => onChange('documentNo', event.target.value)}
      placeholder="Ej. 4567123"
      error={errors.documentNo}
      maxLength={20}
      required
      disabled={disabled}
    />

    <Select
      label="Expedido en"
      name={`${idPrefix}-documentIssuedIn`}
      options={DOCUMENT_ISSUED_IN_OPTIONS}
      placeholder="Selecciona el departamento"
      value={values.documentIssuedIn}
      onChange={(event) => onChange('documentIssuedIn', event.target.value as DocumentIssuedIn)}
      error={errors.documentIssuedIn}
      required
      disabled={disabled}
    />

    <div className="sm:col-span-2">
      <Input
        label="Nombres"
        name={`${idPrefix}-givenNames`}
        value={values.givenNames}
        onChange={(event) => onChange('givenNames', event.target.value)}
        placeholder="Ej. Rosa Maria"
        error={errors.givenNames}
        maxLength={150}
        required
        disabled={disabled}
      />
    </div>

    <Input
      label="Apellido paterno"
      name={`${idPrefix}-paternalSurname`}
      value={values.paternalSurname}
      onChange={(event) => onChange('paternalSurname', event.target.value)}
      placeholder="Ej. Condori"
      error={errors.paternalSurname}
      maxLength={100}
      required
      disabled={disabled}
    />

    <Input
      label="Apellido materno"
      name={`${idPrefix}-maternalSurname`}
      value={values.maternalSurname}
      onChange={(event) => onChange('maternalSurname', event.target.value)}
      placeholder="Opcional"
      error={errors.maternalSurname}
      maxLength={100}
      disabled={disabled}
    />

    <Input
      label="Fecha de nacimiento"
      type="date"
      name={`${idPrefix}-birthDate`}
      value={values.birthDate}
      onChange={(event) => onChange('birthDate', event.target.value)}
      error={errors.birthDate}
      required
      disabled={disabled}
    />

    <Select
      label="Sexo"
      name={`${idPrefix}-sex`}
      options={SEX_OPTIONS}
      placeholder="Selecciona"
      value={values.sex}
      onChange={(event) => onChange('sex', event.target.value as Sex)}
      error={errors.sex}
      required
      disabled={disabled}
    />

    <Input
      label="Teléfono"
      name={`${idPrefix}-phone`}
      value={values.phone}
      onChange={(event) => onChange('phone', event.target.value)}
      placeholder="Opcional"
      error={errors.phone}
      maxLength={30}
      disabled={disabled}
    />

    <Input
      label="Ocupación"
      name={`${idPrefix}-occupation`}
      value={values.occupation}
      onChange={(event) => onChange('occupation', event.target.value)}
      placeholder="Opcional"
      error={errors.occupation}
      maxLength={120}
      disabled={disabled}
    />
  </div>
);
