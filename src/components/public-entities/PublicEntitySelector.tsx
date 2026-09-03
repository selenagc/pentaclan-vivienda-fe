import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { usePublicEntities } from '../../hooks/usePublicEntities';
import { publicEntityLabel, formatTaxId } from '../../types/publicEntity.types';

interface PublicEntitySelectorProps {
  /** Id de la entidad elegida. `null` = todavía sin elegir. */
  value: number | null;
  onChange: (publicEntityId: number | null) => void;
  /** Error de validación, para pintarlo bajo el select. */
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

/**
 * Selector de entidad pública financiadora.
 *
 * Es un componente controlado: el formulario es dueño del `publicEntityId`
 * y es lo único que se persiste. El **NIT es derivado**: se rellena solo con
 * el de la entidad elegida y es de solo lectura, tal como en el mockup.
 *
 * El catálogo hoy tiene una sola entidad (AEVIVIENDA). Se deja como `<select>`
 * igual, para no rehacerlo cuando se cargue el catálogo real.
 */
export const PublicEntitySelector = ({
  value,
  onChange,
  error,
  disabled,
  required,
  className = '',
}: PublicEntitySelectorProps) => {
  const { publicEntities, isLoading, error: loadError, isEmpty, retry } = usePublicEntities();

  const selected = publicEntities.find((publicEntity) => publicEntity.id === value) ?? null;

  const placeholder = isLoading
    ? 'Cargando…'
    : loadError
      ? 'No se pudo cargar'
      : isEmpty
        ? 'No hay entidades registradas'
        : 'Selecciona una entidad pública';

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <Select
          label="Entidad pública financiadora"
          options={publicEntities.map((publicEntity) => ({
            value: String(publicEntity.id),
            label: publicEntityLabel(publicEntity),
          }))}
          placeholder={placeholder}
          // Los ids del catálogo son números y el <select> nativo trabaja con
          // cadenas: se convierte en ambos sentidos.
          value={value === null ? '' : String(value)}
          onChange={(event) => {
            const raw = event.target.value;
            onChange(raw === '' ? null : Number(raw));
          }}
          error={error ?? loadError ?? undefined}
          disabled={disabled || isLoading || Boolean(loadError) || isEmpty}
          required={required}
          aria-busy={isLoading}
        />
        {loadError && (
          <button
            type="button"
            onClick={retry}
            className="mt-1.5 text-xs font-medium text-brand-primary hover:underline"
          >
            Reintentar
          </button>
        )}
      </div>

      <Input
        label="NIT"
        // Derivado de la entidad, no editable: el backend no lo recibe.
        value={selected ? formatTaxId(selected.taxId) : ''}
        placeholder="Se completa al elegir la entidad"
        readOnly
        tabIndex={-1}
        // El `!` es necesario: el Input trae `bg-white` en sus clases base y en
        // Tailwind el orden del string no decide, decide el orden del CSS.
        className="bg-gray-50! text-gray-500"
      />
    </div>
  );
};
