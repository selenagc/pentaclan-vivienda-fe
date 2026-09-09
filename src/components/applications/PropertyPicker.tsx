import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import { Input } from '../ui/Input';
import { useProperties } from '../../hooks/useProperties';
import { propertyLabel, type Property } from '../../types/property.types';

interface PropertyPickerProps {
  /** Municipio del proyecto: acota la búsqueda a las viviendas admisibles. */
  municipalityId: number;
  value: Property | null;
  onChange: (property: Property) => void;
  error?: string;
  disabled?: boolean;
}

const SearchIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
    />
  </svg>
);

/**
 * Buscador de viviendas ya registradas.
 *
 * Es lo que evita que la misma casa se cargue dos veces. Cuando dos fichas
 * apuntan al mismo inmueble —el caso del matrimonio que postula por separado—
 * tiene que ser el mismo registro, no dos copias con la dirección escrita de
 * dos maneras: la regla que impide dos beneficios sobre una vivienda se apoya
 * en ese id.
 *
 * Solo ofrece viviendas del municipio del proyecto, que son exactamente las
 * que el backend acepta: elegir una de fuera devolvería 409.
 */
export const PropertyPicker = ({
  municipalityId,
  value,
  onChange,
  error,
  disabled,
}: PropertyPickerProps) => {
  const [search, setSearch] = useState('');
  /**
   * Lo que realmente se consulta. Sin este retardo cada tecla dispararía una
   * petición, y `usePaginatedList` descartaría las respuestas atrasadas pero
   * el servidor las habría atendido igual.
   */
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { properties, meta, isLoading, error: loadError } = useProperties({
    municipalityId,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });

  return (
    <div className="space-y-3">
      <Input
        label="Buscar vivienda"
        name="propertySearch"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Comunidad, zona o dirección"
        icon={SearchIcon}
        error={error}
        disabled={disabled}
      />

      {loadError ? (
        <Alert severity="error">{loadError}</Alert>
      ) : isLoading ? (
        <div className="space-y-2 px-1">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} variant="text" width="70%" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <p className="px-1 text-sm text-gray-500">
          {debouncedSearch
            ? 'Ninguna vivienda coincide con la búsqueda.'
            : 'Todavía no hay viviendas registradas en este municipio.'}
        </p>
      ) : (
        <>
          <List dense disablePadding className="rounded-lg border border-gray-200">
            {properties.map((property) => (
              <ListItemButton
                key={property.id}
                selected={value?.id === property.id}
                onClick={() => onChange(property)}
                disabled={disabled}
              >
                <ListItemText
                  primary={propertyLabel(property)}
                  secondary={`${property.latitude}, ${property.longitude}`}
                />
              </ListItemButton>
            ))}
          </List>

          {/* El listado muestra las primeras; afinar la búsqueda es más rápido
              que paginar dentro de un formulario. */}
          {meta && meta.total > properties.length && (
            <p className="px-1 text-xs text-gray-500">
              Se muestran {properties.length} de {meta.total}. Afina la búsqueda para ver otras.
            </p>
          )}
        </>
      )}

      {value && (
        <p className="px-1 text-sm text-gray-700">
          Vivienda elegida:{' '}
          <span className="font-medium text-gray-900">{propertyLabel(value)}</span>
        </p>
      )}
    </div>
  );
};
