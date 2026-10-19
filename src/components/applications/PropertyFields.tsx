import Alert from '@mui/material/Alert';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { Input } from '../ui/Input';
import { PropertyPicker } from './PropertyPicker';
import { fullLocation } from '../../types/geography.types';
import type { Property, PropertyMunicipality } from '../../types/property.types';
import type {
  PropertyFormErrors,
  PropertyFormValues,
  PropertyMode,
} from '../../hooks/useApplicationForm';

interface PropertyFieldsProps {
  /** Municipio del proyecto. La vivienda tiene que estar aquí, sin excepción. */
  municipality: PropertyMunicipality;
  mode: PropertyMode;
  onModeChange: (mode: PropertyMode) => void;
  values: PropertyFormValues;
  errors: PropertyFormErrors;
  onChange: <K extends keyof PropertyFormValues>(field: K, value: PropertyFormValues[K]) => void;
  selectedProperty: Property | null;
  onSelectProperty: (property: Property) => void;
  selectedPropertyError?: string;
  disabled?: boolean;
  /** Cambia los textos a los de corrección: al editar, `nueva` corrige la actual. */
  isEditing?: boolean;
}

/**
 * La vivienda a mejorar: el objeto real del programa.
 *
 * Entra de dos formas y **solo una a la vez**, que es el `xor` del backend:
 * elegida del buscador si ya está registrada, o levantada aquí si es la
 * primera vez que se visita.
 *
 * **El municipio no se pregunta.** Sale del proyecto, porque solo se mejoran
 * viviendas donde se ejecuta la obra; ofrecer el selector geográfico sería
 * ofrecer un camino directo al 409. Se muestra como dato para que el operador
 * sepa dónde está capturando.
 */
export const PropertyFields = ({
  municipality,
  mode,
  onModeChange,
  values,
  errors,
  onChange,
  selectedProperty,
  onSelectProperty,
  selectedPropertyError,
  disabled,
  isEditing = false,
}: PropertyFieldsProps) => (
  <div className="space-y-4">
    <p className="text-sm text-gray-600">
      Municipio del proyecto:{' '}
      <span className="font-medium text-gray-900">{fullLocation(municipality)}</span>. La vivienda
      tiene que estar aquí.
    </p>

    <RadioGroup
      row
      value={mode}
      onChange={(event) => onModeChange(event.target.value as PropertyMode)}
    >
      <FormControlLabel
        value="new"
        control={<Radio size="small" />}
        label={isEditing ? 'Corregir los datos de la vivienda' : 'Registrar una vivienda nueva'}
        disabled={disabled}
      />
      <FormControlLabel
        value="existing"
        control={<Radio size="small" />}
        label={isEditing ? 'Cambiar a otra vivienda registrada' : 'Elegir una vivienda registrada'}
        disabled={disabled}
      />
    </RadioGroup>

    {mode === 'existing' ? (
      <PropertyPicker
        municipalityId={municipality.id}
        value={selectedProperty}
        onChange={onSelectProperty}
        error={selectedPropertyError}
        disabled={disabled}
      />
    ) : (
      <>
        {isEditing && (
          <Alert severity="info">
            Estás corrigiendo la vivienda que ya tiene esta ficha. Si otra postulación apunta a la
            misma vivienda, el cambio también la afecta. Para apuntar a otra casa, usa «Cambiar a
            otra vivienda registrada».
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Comunidad"
            name="community"
            value={values.community}
            onChange={(event) => onChange('community', event.target.value)}
            placeholder="Ej. Comunidad Alto Lima"
            error={errors.community}
            maxLength={150}
            disabled={disabled}
          />

          <Input
            label="Zona"
            name="zone"
            value={values.zone}
            onChange={(event) => onChange('zone', event.target.value)}
            placeholder="Opcional"
            error={errors.zone}
            maxLength={150}
            disabled={disabled}
          />

          <div className="sm:col-span-2">
            <Input
              label="Dirección"
              name="address"
              value={values.address}
              onChange={(event) => onChange('address', event.target.value)}
              placeholder="Ej. Calle 5 s/n"
              error={errors.address}
              maxLength={250}
              disabled={disabled}
            />
            <p className="mt-1 text-xs text-gray-500">
              Basta con la comunidad o con la dirección: en área rural la dirección suele ser solo
              el nombre de la comunidad.
            </p>
          </div>

          <Input
            label="Latitud"
            type="number"
            name="latitude"
            value={values.latitude}
            onChange={(event) => onChange('latitude', event.target.value)}
            placeholder="Ej. -16.492100"
            error={errors.latitude}
            min={-90}
            max={90}
            step="any"
            required
            disabled={disabled}
          />

          <Input
            label="Longitud"
            type="number"
            name="longitude"
            value={values.longitude}
            onChange={(event) => onChange('longitude', event.target.value)}
            placeholder="Ej. -68.178400"
            error={errors.longitude}
            min={-180}
            max={180}
            step="any"
            required
            disabled={disabled}
          />

          <p className="text-xs text-gray-500 sm:col-span-2">
            Las coordenadas son obligatorias: sin código catastral, la ubicación es lo único que
            identifica físicamente la vivienda y hace falta para supervisar la obra.
          </p>
        </div>
      </>
    )}
  </div>
);
