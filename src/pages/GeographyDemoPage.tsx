import { useState } from 'react';
import { GeoSelector } from '../components/geography/GeoSelector';
import { Button } from '../components/ui/Button';
import { emptyGeoSelection, type GeoSelection } from '../types/geography.types';

/**
 * Banco de pruebas de <GeoSelector />.
 *
 * TEMPORAL: existe solo para validar la cascada mientras el backend define a
 * qué entidad se asocia la ubicación (bloqueante B1 del ticket PV-17). En
 * cuanto haya un formulario real que la consuma, esta página y su ruta
 * `/geografia` se eliminan.
 */
const GeographyDemoPage = () => {
  const [selection, setSelection] = useState<GeoSelection>(emptyGeoSelection);

  // Sin nada elegido no hay nada que limpiar.
  const hasSelection = selection.departmentId !== null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Catálogo geográfico</h1>
        <p className="mt-1 text-sm text-gray-500">
          Selector en cascada Department → Province → Municipality.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <GeoSelector value={selection} onChange={setSelection} />

        <div className="mt-6 flex justify-end border-t border-gray-100 pt-4">
          <Button
            variant="outline"
            fullWidth={false}
            disabled={!hasSelection}
            onClick={() => setSelection(emptyGeoSelection)}
          >
            Limpiar selección
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GeographyDemoPage;
