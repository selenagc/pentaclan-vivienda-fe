import MuiButton from '@mui/material/Button';
import { Select } from '../ui/Select';
import { useGeography, type GeoLevel } from '../../hooks/useGeography';
import type { GeoSelection, GeoSelectionErrors } from '../../types/geography.types';

interface GeoSelectorProps {
  /** Selección actual. El componente es controlado: no guarda estado propio. */
  value: GeoSelection;
  /** Recibe la selección completa ya con los reseteos en cascada aplicados. */
  onChange: (value: GeoSelection) => void;
  /** Errores de validación por campo, para pintarlos bajo cada select. */
  errors?: GeoSelectionErrors;
  /** Deshabilita los tres selects (p. ej. mientras se guarda el formulario). */
  disabled?: boolean;
  /** Marca los tres campos como requeridos. */
  required?: boolean;
  /**
   * Dibuja una flecha entre nivel y nivel (Departamento → Provincia →
   * Municipio) para hacer visible el orden de la cascada. Solo se ve a partir
   * de `md`: en móvil los selects se apilan y la flecha estorbaría.
   */
  withArrows?: boolean;
  /**
   * `row` (por defecto) coloca los tres selects en fila a partir de `md`;
   * `stacked` los apila siempre, para contenedores estrechos como un modal,
   * donde tres columnas dejarían los nombres largos recortados.
   */
  layout?: 'row' | 'stacked';
  className?: string;
}

/** Separador decorativo entre dos niveles de la cascada. */
const Flecha = () => (
  <span
    aria-hidden="true"
    // `mt-9` lo baja hasta la altura del select, saltándose la etiqueta.
    className="mt-2 hidden select-none text-gray-400 md:block"
  >
    →
  </span>
);

/** Entidad mínima que renderiza este selector. */
interface GeoItem {
  id: number;
  name: string;
}

interface GeoFieldProps<T extends GeoItem> {
  label: string;
  level: GeoLevel<T>;
  value: number | null;
  onSelect: (id: number | null) => void;
  /** `false` mientras no se haya elegido el nivel superior. */
  hasParent: boolean;
  /** Placeholder por estado. */
  placeholders: { waiting: string; ready: string; empty: string };
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

/**
 * Un nivel de la cascada. Traduce el estado del nivel (sin padre, cargando,
 * error, vacío, listo) a un placeholder y al estado deshabilitado del select,
 * y añade el botón de reintento cuando la carga falló.
 */
const GeoField = <T extends GeoItem>({
  label,
  level,
  value,
  onSelect,
  hasParent,
  placeholders,
  error,
  disabled,
  required,
}: GeoFieldProps<T>) => {
  const { items, isLoading, error: loadError, isEmpty, retry } = level;

  const placeholder = !hasParent
    ? placeholders.waiting
    : isLoading
      ? 'Cargando…'
      : loadError
        ? 'No se pudo cargar'
        : isEmpty
          ? placeholders.empty
          : placeholders.ready;

  // Solo se puede elegir cuando hay padre, la carga terminó bien y hay opciones.
  const isSelectable = hasParent && !isLoading && !loadError && !isEmpty;

  return (
    <div>
      <Select
        label={label}
        options={items.map((item) => ({
          value: String(item.id),
          label: item.name,
        }))}
        placeholder={placeholder}
        // Los ids del catálogo son números y el <select> nativo trabaja con
        // cadenas: se convierte en ambos sentidos.
        value={value === null ? '' : String(value)}
        onChange={(event) => {
          const raw = event.target.value;
          onSelect(raw === '' ? null : Number(raw));
        }}
        error={error ?? loadError ?? undefined}
        disabled={disabled || !isSelectable}
        required={required}
        aria-busy={isLoading}
      />
      {loadError && (
        <MuiButton size="small" onClick={retry} sx={{ mt: 0.5 }}>
          Reintentar
        </MuiButton>
      )}
    </div>
  );
};

/**
 * Selector en cascada Departamento → Provincia → Municipio del catálogo
 * geográfico de Bolivia (PV-17).
 *
 * Es un componente controlado: el formulario que lo usa es dueño de la
 * selección y la recibe entera en `onChange`, ya con los reseteos aplicados
 * (cambiar el departamento limpia provincia y municipio; cambiar la provincia
 * limpia el municipio).
 *
 * Los tres ids son opcionales (`null`) por defecto. Si municipio pasa a ser
 * obligatorio (decisión D1 del ticket), esa validación la impone el formulario
 * contenedor, no este componente.
 */
export const GeoSelector = ({
  value,
  onChange,
  errors,
  disabled,
  required,
  withArrows = false,
  layout = 'row',
  className = '',
}: GeoSelectorProps) => {
  const { departments, provinces, municipalities } = useGeography(value);

  // Con flechas la rejilla alterna columna/flecha; sin ellas son tres columnas
  // iguales. En móvil siempre se apila, igual que con `layout: 'stacked'`.
  const gridClass =
    layout === 'stacked'
      ? 'grid gap-4'
      : withArrows
        ? 'grid gap-x-3 gap-y-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)]'
        : 'grid gap-4 md:grid-cols-3';

  return (
    <div className={`${gridClass} ${className}`}>
      <GeoField
        label="Departamento"
        level={departments}
        value={value.departmentId}
        // Cambiar el departamento invalida los dos niveles inferiores.
        onSelect={(departmentId) =>
          onChange({ departmentId, provinceId: null, municipalityId: null })
        }
        hasParent
        placeholders={{
          waiting: 'Selecciona un departamento',
          ready: 'Selecciona un departamento',
          empty: 'No hay departamentos',
        }}
        error={errors?.departmentId}
        disabled={disabled}
        required={required}
      />

      {withArrows && <Flecha />}

      <GeoField
        label="Provincia"
        level={provinces}
        value={value.provinceId}
        onSelect={(provinceId) =>
          onChange({ ...value, provinceId, municipalityId: null })
        }
        hasParent={value.departmentId !== null}
        placeholders={{
          waiting: 'Elige primero un departamento',
          ready: 'Selecciona una provincia',
          empty: 'Sin provincias',
        }}
        error={errors?.provinceId}
        disabled={disabled}
        required={required}
      />

      {withArrows && <Flecha />}

      <GeoField
        label="Municipio"
        level={municipalities}
        value={value.municipalityId}
        onSelect={(municipalityId) => onChange({ ...value, municipalityId })}
        hasParent={value.provinceId !== null}
        placeholders={{
          waiting: 'Elige primero una provincia',
          ready: 'Selecciona un municipio',
          empty: 'Sin municipios',
        }}
        error={errors?.municipalityId}
        disabled={disabled}
        required={required}
      />
    </div>
  );
};
