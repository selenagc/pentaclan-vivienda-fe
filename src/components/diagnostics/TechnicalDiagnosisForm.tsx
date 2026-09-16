import { useState } from 'react';
import Alert from '@mui/material/Alert';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { FormSection } from '../ui/FormSection';
import { diagnosticService } from '../../services/diagnosticService';
import type {
  ConstructionElement,
  DiagnosticPhoto,
  DiagnosticRecord,
  TechnicalDiagnosticInput,
} from '../../types/diagnostic.types';

interface TechnicalDiagnosisFormProps {
  applicationId: string;
  initialRecord: DiagnosticRecord | null;
  canEdit: boolean;
  onSaveSuccess: (record: DiagnosticRecord) => void;
}

const ABC_STANDARD_OPTIONS = [
  { value: 'Cumple con estándares ABC', label: 'Cumple con estándares ABC' },
  { value: 'No cumple con estándares ABC', label: 'No cumple con estándares ABC' },
  { value: 'En trámite / Parcial', label: 'En trámite / Parcial' },
  { value: 'No aplica', label: 'No aplica' },
];

const ACCESSIBILITY_OPTIONS = [
  { value: 'Vía asfaltada / Pavimento', label: 'Vía asfaltada / Pavimento' },
  { value: 'Camino ripiado vehicular', label: 'Camino ripiado vehicular' },
  { value: 'Camino de tierra vehicular', label: 'Camino de tierra vehicular' },
  { value: 'Acceso solo peatonal / Gradas', label: 'Acceso solo peatonal / Gradas' },
  { value: 'Sendero rural', label: 'Sendero rural' },
];

const LAND_CONDITION_OPTIONS = [
  { value: 'Firme y estable', label: 'Firme y estable' },
  { value: 'Sujeto a inundación', label: 'Sujeto a inundación' },
  { value: 'Riesgo de deslizamiento / Geológico', label: 'Riesgo de deslizamiento / Geológico' },
  { value: 'Relleno o suelo blando', label: 'Relleno o suelo blando' },
];

const WATER_ACCESS_OPTIONS = [
  { value: 'Red por cañería dentro de la vivienda', label: 'Red por cañería dentro de la vivienda' },
  { value: 'Red por cañería fuera de la vivienda', label: 'Red por cañería fuera de la vivienda' },
  { value: 'Pila pública comunitaria', label: 'Pila pública comunitaria' },
  { value: 'Carro cisterna', label: 'Carro cisterna' },
  { value: 'Pozo o vertiente', label: 'Pozo o vertiente' },
  { value: 'Sin acceso formal', label: 'Sin acceso formal' },
];

const ELECTRICITY_OPTIONS = [
  { value: 'Red pública con medidor propio', label: 'Red pública con medidor propio' },
  { value: 'Red pública compartida / medidor común', label: 'Red pública compartida / medidor común' },
  { value: 'Panel solar domiciliario', label: 'Panel solar domiciliario' },
  { value: 'Generador / Otro', label: 'Generador / Otro' },
  { value: 'Sin servicio eléctrico', label: 'Sin servicio eléctrico' },
];

const BATHROOM_TYPE_OPTIONS = [
  { value: 'Inodoro con arrastre de agua a alcantarillado', label: 'Inodoro con arrastre a alcantarillado' },
  { value: 'Inodoro con arrastre a cámara séptica', label: 'Inodoro con arrastre a cámara séptica' },
  { value: 'Letrina con pozo ciego', label: 'Letrina con pozo ciego' },
  { value: 'Letrina seca ecológica', label: 'Letrina seca ecológica' },
  { value: 'No tiene baño', label: 'No tiene baño' },
];

const KITCHEN_TYPE_OPTIONS = [
  { value: 'Cocina exclusiva a gas domiciliario o garrafa', label: 'Cocina exclusiva a gas' },
  { value: 'Cocina compartida', label: 'Cocina compartida' },
  { value: 'Cocina a leña / carbón (fogonero)', label: 'Cocina a leña / fogonero' },
  { value: 'No cuenta con cocina (cocina en dormitorio)', label: 'Cocina dentro de dormitorio' },
];

const HOUSING_TYPOLOGY_OPTIONS = [
  { value: 'Casa unifamiliar independiente', label: 'Casa unifamiliar independiente' },
  { value: 'Cuarto(s) sueltos / dispersos', label: 'Cuarto(s) sueltos / dispersos' },
  { value: 'Vivienda precaria / Choza', label: 'Vivienda precaria / Choza' },
  { value: 'Vivienda compartida en lote familiar', label: 'Vivienda compartida en lote familiar' },
];

const TENURE_STATUS_OPTIONS = [
  { value: 'Propietario(a) con Folio Real', label: 'Propietario(a) con Folio Real' },
  { value: 'Minuta de compra-venta protocolizada', label: 'Minuta de compra-venta protocolizada' },
  { value: 'Certificación comunal / Título ejecutorial INRA', label: 'Certificación comunal / Título INRA' },
  { value: 'Declaratoria de herederos en trámite', label: 'Declaratoria de herederos en trámite' },
  { value: 'Posesión pacífica con aval comunal', label: 'Posesión pacífica con aval comunal' },
];

const MATERIAL_STATE_OPTIONS = [
  { value: 'Bueno', label: 'Bueno' },
  { value: 'Regular', label: 'Regular' },
  { value: 'Malo', label: 'Malo' },
  { value: 'Inexistente', label: 'Inexistente' },
];

const PHOTO_TYPE_OPTIONS = [
  { value: 'Fachada Principal', label: 'Fachada Principal' },
  { value: 'Dormitorio(s)', label: 'Dormitorio(s)' },
  { value: 'Cocina', label: 'Cocina' },
  { value: 'Baño / Sanitarios', label: 'Baño / Sanitarios' },
  { value: 'Muros y Estructura', label: 'Muros y Estructura' },
  { value: 'Cubierta y Techos', label: 'Cubierta y Techos' },
  { value: 'Pisos', label: 'Pisos' },
  { value: 'Entorno / Terreno', label: 'Entorno / Terreno' },
];

export const TechnicalDiagnosisForm = ({
  applicationId,
  initialRecord,
  canEdit,
  onSaveSuccess,
}: TechnicalDiagnosisFormProps) => {
  const today = new Date().toISOString().split('T')[0];

  const [formNo, setFormNo] = useState(initialRecord?.formNo ?? '');
  const [evaluationDate, setEvaluationDate] = useState(initialRecord?.evaluationDate ?? today);

  // 1. Terreno y Accesibilidad
  const [slopePercentage, setSlopePercentage] = useState<number | null>(
    initialRecord?.landAccessibility?.slopePercentage ?? null,
  );
  const [pedestrianMinutes, setPedestrianMinutes] = useState<number | null>(
    initialRecord?.landAccessibility?.pedestrianMinutes ?? null,
  );
  const [abcStandard, setAbcStandard] = useState(initialRecord?.landAccessibility?.abcStandard ?? '');
  const [accessibilityType, setAccessibilityType] = useState(
    initialRecord?.landAccessibility?.accessibilityType ?? '',
  );
  const [landCondition, setLandCondition] = useState(
    initialRecord?.landAccessibility?.landCondition ?? '',
  );

  // 2. Servicios Básicos
  const [waterAccess, setWaterAccess] = useState(initialRecord?.basicUtilities?.waterAccess ?? '');
  const [electricityService, setElectricityService] = useState(
    initialRecord?.basicUtilities?.electricityService ?? '',
  );
  const [sharedBathroom, setSharedBathroom] = useState(
    initialRecord?.basicUtilities?.sharedBathroom ?? false,
  );
  const [privateBathroom, setPrivateBathroom] = useState(
    initialRecord?.basicUtilities?.privateBathroom ?? false,
  );
  const [bathroomType, setBathroomType] = useState(initialRecord?.basicUtilities?.bathroomType ?? '');
  const [sharedKitchen, setSharedKitchen] = useState(
    initialRecord?.basicUtilities?.sharedKitchen ?? false,
  );
  const [privateKitchen, setPrivateKitchen] = useState(
    initialRecord?.basicUtilities?.privateKitchen ?? false,
  );
  const [adequateKitchen, setAdequateKitchen] = useState(
    initialRecord?.basicUtilities?.adequateKitchen ?? false,
  );
  const [kitchenType, setKitchenType] = useState(initialRecord?.basicUtilities?.kitchenType ?? '');

  // 3. Características de la Vivienda
  const [housingTypology, setHousingTypology] = useState(
    initialRecord?.housingCharacteristics?.housingTypology ?? '',
  );
  const [tenureStatus, setTenureStatus] = useState(
    initialRecord?.housingCharacteristics?.tenureStatus ?? '',
  );
  const [housingObs, setHousingObs] = useState(
    initialRecord?.housingCharacteristics?.observations ?? '',
  );

  // 4. Elementos Constructivos
  const [elements, setElements] = useState<ConstructionElement[]>(
    initialRecord?.constructionElements?.length
      ? initialRecord.constructionElements
      : [
          {
            constructionNumber: 1,
            usageType: 'Dormitorio principal',
            foundationMaterial: 'Piedra con barro',
            foundationState: 'Regular',
            wallsMaterial: 'Adobe',
            wallsState: 'Regular',
            roofMaterial: 'Calamina',
            roofState: 'Regular',
            exteriorPlasterMaterial: 'Barro',
            exteriorPlasterState: 'Malo',
            interiorPlasterMaterial: 'Yeso',
            interiorPlasterState: 'Regular',
            ceilingPlasterMaterial: 'Sin cielo raso',
            ceilingPlasterState: 'Inexistente',
            floorsMaterial: 'Tierra',
            floorsState: 'Malo',
            doorsMaterial: 'Madera rústica',
            doorsState: 'Regular',
            windowsMaterial: 'Fierro / Sin vidrio',
            windowsState: 'Regular',
            electricalInstallation: 'Visible / Precaria',
            electricalInstallationState: 'Malo',
            canBeImproved: 1,
            cannotBeImproved: 0,
            noImprovementNeeded: 0,
            observations: '',
          },
        ],
  );

  // 5. Propuesta de Intervención Técnica
  const [requiresImprovement, setRequiresImprovement] = useState(
    initialRecord?.requiresImprovement ?? true,
  );
  const [requiresExpansion, setRequiresExpansion] = useState(
    initialRecord?.requiresExpansion ?? false,
  );
  const [requiresRenovation, setRequiresRenovation] = useState(
    initialRecord?.requiresRenovation ?? false,
  );
  const [roomsToImprove, setRoomsToImprove] = useState(initialRecord?.roomsToImprove ?? '');
  const [bedroomSuggestion, setBedroomSuggestion] = useState(initialRecord?.bedroomSuggestion ?? '');
  const [livingRoomSuggestion, setLivingRoomSuggestion] = useState(
    initialRecord?.livingRoomSuggestion ?? '',
  );
  const [kitchenSuggestion, setKitchenSuggestion] = useState(initialRecord?.kitchenSuggestion ?? '');
  const [bathroomSuggestion, setBathroomSuggestion] = useState(
    initialRecord?.bathroomSuggestion ?? '',
  );
  const [generalObservations, setGeneralObservations] = useState(
    initialRecord?.generalObservations ?? '',
  );

  // 6. Ficha Fotográfica
  const [photos, setPhotos] = useState<DiagnosticPhoto[]>(
    initialRecord?.photos?.length ? initialRecord.photos : [],
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAddElement = () => {
    setElements((prev) => [
      ...prev,
      {
        constructionNumber: prev.length + 1,
        usageType: 'Nuevo ambiente',
        foundationMaterial: '',
        foundationState: 'Regular',
        wallsMaterial: '',
        wallsState: 'Regular',
        roofMaterial: '',
        roofState: 'Regular',
        exteriorPlasterMaterial: '',
        exteriorPlasterState: 'Regular',
        interiorPlasterMaterial: '',
        interiorPlasterState: 'Regular',
        ceilingPlasterMaterial: '',
        ceilingPlasterState: 'Regular',
        floorsMaterial: '',
        floorsState: 'Regular',
        doorsMaterial: '',
        doorsState: 'Regular',
        windowsMaterial: '',
        windowsState: 'Regular',
        electricalInstallation: '',
        electricalInstallationState: 'Regular',
        canBeImproved: 1,
        cannotBeImproved: 0,
        noImprovementNeeded: 0,
        observations: '',
      },
    ]);
  };

  const handleRemoveElement = (index: number) => {
    setElements((prev) => prev.filter((_, i) => i !== index));
  };

  const handleElementChange = <K extends keyof ConstructionElement>(
    index: number,
    field: K,
    value: ConstructionElement[K],
  ) => {
    setElements((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddPhoto = () => {
    setPhotos((prev) => [
      ...prev,
      {
        photoType: 'Fachada Principal',
        url: '',
        description: '',
      },
    ]);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePhotoChange = <K extends keyof DiagnosticPhoto>(
    index: number,
    field: K,
    value: DiagnosticPhoto[K],
  ) => {
    setPhotos((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = async (isCompleted: boolean) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const payload: TechnicalDiagnosticInput = {
        formNo: formNo.trim() || null,
        evaluationDate,
        isCompleted,
        requiresImprovement,
        requiresExpansion,
        requiresRenovation,
        roomsToImprove: roomsToImprove.trim() || null,
        bedroomSuggestion: bedroomSuggestion.trim() || null,
        livingRoomSuggestion: livingRoomSuggestion.trim() || null,
        kitchenSuggestion: kitchenSuggestion.trim() || null,
        bathroomSuggestion: bathroomSuggestion.trim() || null,
        generalObservations: generalObservations.trim() || null,
        landAccessibility: {
          slopePercentage,
          pedestrianMinutes,
          abcStandard: abcStandard || null,
          accessibilityType: accessibilityType || null,
          landCondition: landCondition || null,
        },
        basicUtilities: {
          waterAccess: waterAccess || null,
          electricityService: electricityService || null,
          sharedBathroom,
          privateBathroom,
          bathroomType: bathroomType || null,
          sharedKitchen,
          privateKitchen,
          adequateKitchen,
          kitchenType: kitchenType || null,
        },
        housingCharacteristics: {
          housingTypology: housingTypology || null,
          tenureStatus: tenureStatus || null,
          observations: housingObs.trim() || null,
        },
        constructionElements: elements,
        photos: photos.filter((p) => p.url.trim() !== ''),
      };

      const updated = await diagnosticService.saveTechnical(applicationId, payload);
      setSuccessMessage(
        isCompleted
          ? 'Diagnóstico técnico guardado y marcado como completado.'
          : 'Borrador del diagnóstico técnico guardado correctamente.',
      );
      onSaveSuccess(updated);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || err?.message || 'Error al guardar el diagnóstico técnico.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header status */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Módulo de Evaluación Técnica</h2>
            <p className="text-sm text-gray-500">
              Evaluación del terreno, estado constructivo y propuesta de intervención técnica.
            </p>
          </div>
          {initialRecord?.technicalCompletedAt ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Completado por {initialRecord.technicalUserName || 'Evaluador Técnico'} el{' '}
              {new Date(initialRecord.technicalCompletedAt).toLocaleDateString('es-BO')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              En progreso / Pendiente
            </span>
          )}
        </div>

        {!canEdit && (
          <div className="mt-4">
            <Alert severity="info">
              Estás visualizando este diagnóstico en modo solo lectura. Solo el Evaluador Técnico (o el Administrador) asignado puede modificarlo.
            </Alert>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4">
            <Alert severity="error">{errorMessage}</Alert>
          </div>
        )}

        {successMessage && (
          <div className="mt-4">
            <Alert severity="success">{successMessage}</Alert>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Nº Formulario Técnico"
            value={formNo}
            onChange={(e) => setFormNo(e.target.value)}
            disabled={!canEdit || isSubmitting}
            placeholder="Ej. TEC-001"
          />
          <Input
            label="Fecha de Evaluación"
            type="date"
            value={evaluationDate}
            onChange={(e) => setEvaluationDate(e.target.value)}
            disabled={!canEdit || isSubmitting}
          />
        </div>
      </div>

      {/* 1. Terreno y Accesibilidad */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
        <FormSection stepNumber={1} title="Terreno y Accesibilidad" withDivider={false}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              label="Pendiente del Terreno (%)"
              type="number"
              value={slopePercentage ?? ''}
              onChange={(e) =>
                setSlopePercentage(e.target.value === '' ? null : Number(e.target.value))
              }
              disabled={!canEdit || isSubmitting}
              placeholder="Ej. 5"
            />
            <Input
              label="Minutos de Caminata / Acceso Peatonal"
              type="number"
              value={pedestrianMinutes ?? ''}
              onChange={(e) =>
                setPedestrianMinutes(e.target.value === '' ? null : Number(e.target.value))
              }
              disabled={!canEdit || isSubmitting}
              placeholder="Minutos a pie"
            />
            <Select
              label="Estándar Vial (Norma ABC)"
              value={abcStandard}
              onChange={(e) => setAbcStandard(e.target.value)}
              options={ABC_STANDARD_OPTIONS}
              disabled={!canEdit || isSubmitting}
            />
            <Select
              label="Tipo de Accesibilidad"
              value={accessibilityType}
              onChange={(e) => setAccessibilityType(e.target.value)}
              options={ACCESSIBILITY_OPTIONS}
              disabled={!canEdit || isSubmitting}
            />
            <Select
              label="Condición / Estabilidad del Terreno"
              value={landCondition}
              onChange={(e) => setLandCondition(e.target.value)}
              options={LAND_CONDITION_OPTIONS}
              disabled={!canEdit || isSubmitting}
            />
          </div>
        </FormSection>
      </div>

      {/* 2. Servicios Básicos */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
        <FormSection stepNumber={2} title="Servicios Básicos e Higiene">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Acceso a Agua Potable"
              value={waterAccess}
              onChange={(e) => setWaterAccess(e.target.value)}
              options={WATER_ACCESS_OPTIONS}
              disabled={!canEdit || isSubmitting}
            />
            <Select
              label="Servicio de Energía Eléctrica"
              value={electricityService}
              onChange={(e) => setElectricityService(e.target.value)}
              options={ELECTRICITY_OPTIONS}
              disabled={!canEdit || isSubmitting}
            />
            <Select
              label="Tipo de Baño / Letrina"
              value={bathroomType}
              onChange={(e) => setBathroomType(e.target.value)}
              options={BATHROOM_TYPE_OPTIONS}
              disabled={!canEdit || isSubmitting}
            />
            <div className="flex items-center gap-6 pt-6">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={privateBathroom}
                  onChange={(e) => setPrivateBathroom(e.target.checked)}
                  disabled={!canEdit || isSubmitting}
                  className="rounded text-brand-primary focus:ring-brand-primary"
                />
                Baño Privado
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={sharedBathroom}
                  onChange={(e) => setSharedBathroom(e.target.checked)}
                  disabled={!canEdit || isSubmitting}
                  className="rounded text-brand-primary focus:ring-brand-primary"
                />
                Baño Compartido
              </label>
            </div>
            <Select
              label="Tipo de Cocina"
              value={kitchenType}
              onChange={(e) => setKitchenType(e.target.value)}
              options={KITCHEN_TYPE_OPTIONS}
              disabled={!canEdit || isSubmitting}
            />
            <div className="flex flex-wrap items-center gap-6 pt-6">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={privateKitchen}
                  onChange={(e) => setPrivateKitchen(e.target.checked)}
                  disabled={!canEdit || isSubmitting}
                  className="rounded text-brand-primary focus:ring-brand-primary"
                />
                Cocina Privada
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={sharedKitchen}
                  onChange={(e) => setSharedKitchen(e.target.checked)}
                  disabled={!canEdit || isSubmitting}
                  className="rounded text-brand-primary focus:ring-brand-primary"
                />
                Cocina Compartida
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={adequateKitchen}
                  onChange={(e) => setAdequateKitchen(e.target.checked)}
                  disabled={!canEdit || isSubmitting}
                  className="rounded text-brand-primary focus:ring-brand-primary"
                />
                Ambiente Adecuado
              </label>
            </div>
          </div>
        </FormSection>
      </div>

      {/* 3. Características y Tenencia */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
        <FormSection stepNumber={3} title="Tipología y Régimen de Tenencia">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Tipología de Vivienda"
              value={housingTypology}
              onChange={(e) => setHousingTypology(e.target.value)}
              options={HOUSING_TYPOLOGY_OPTIONS}
              disabled={!canEdit || isSubmitting}
            />
            <Select
              label="Régimen de Tenencia del Inmueble"
              value={tenureStatus}
              onChange={(e) => setTenureStatus(e.target.value)}
              options={TENURE_STATUS_OPTIONS}
              disabled={!canEdit || isSubmitting}
            />
            <div className="sm:col-span-2">
              <Input
                label="Observaciones sobre la Tenencia y Vivienda"
                value={housingObs}
                onChange={(e) => setHousingObs(e.target.value)}
                disabled={!canEdit || isSubmitting}
                placeholder="Detalles sobre linderos, posesión o antecedentes"
              />
            </div>
          </div>
        </FormSection>
      </div>

      {/* 4. Componentes Constructivos */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
        <FormSection stepNumber={4} title="Componentes y Materiales Constructivos">
          <p className="mb-4 text-sm text-gray-500">
            Evalúe cada uno de los bloques o ambientes de la vivienda existente.
          </p>

          <div className="space-y-6">
            {elements.map((el, index) => (
              <div
                key={index}
                className="relative rounded-xl border border-gray-200 bg-gray-50/40 p-5 transition-colors hover:border-gray-300"
              >
                <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3">
                  <h4 className="text-sm font-bold text-gray-900">
                    Construcción / Bloque #{el.constructionNumber}
                  </h4>
                  {canEdit && elements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveElement(index)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                    >
                      Eliminar bloque
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="sm:col-span-2 lg:col-span-3">
                    <Input
                      label="Uso / Destino del Bloque"
                      value={el.usageType ?? ''}
                      onChange={(e) => handleElementChange(index, 'usageType', e.target.value)}
                      disabled={!canEdit || isSubmitting}
                      placeholder="Ej. Dormitorio principal, Cocina, Cuarto multiuso"
                    />
                  </div>

                  {/* Cimientos */}
                  <Input
                    label="Material Cimientos"
                    value={el.foundationMaterial ?? ''}
                    onChange={(e) =>
                      handleElementChange(index, 'foundationMaterial', e.target.value)
                    }
                    disabled={!canEdit || isSubmitting}
                    placeholder="Piedra, HºCº, Sin cimiento"
                  />
                  <Select
                    label="Estado Cimientos"
                    value={el.foundationState ?? 'Regular'}
                    onChange={(e) => handleElementChange(index, 'foundationState', e.target.value)}
                    options={MATERIAL_STATE_OPTIONS}
                    disabled={!canEdit || isSubmitting}
                  />

                  {/* Muros */}
                  <Input
                    label="Material Muros"
                    value={el.wallsMaterial ?? ''}
                    onChange={(e) => handleElementChange(index, 'wallsMaterial', e.target.value)}
                    disabled={!canEdit || isSubmitting}
                    placeholder="Adobe, Ladrillo, Madera, Tapial"
                  />
                  <Select
                    label="Estado Muros"
                    value={el.wallsState ?? 'Regular'}
                    onChange={(e) => handleElementChange(index, 'wallsState', e.target.value)}
                    options={MATERIAL_STATE_OPTIONS}
                    disabled={!canEdit || isSubmitting}
                  />

                  {/* Techo */}
                  <Input
                    label="Material Techo"
                    value={el.roofMaterial ?? ''}
                    onChange={(e) => handleElementChange(index, 'roofMaterial', e.target.value)}
                    disabled={!canEdit || isSubmitting}
                    placeholder="Calamina, Teja, Paja, Dolo"
                  />
                  <Select
                    label="Estado Techo"
                    value={el.roofState ?? 'Regular'}
                    onChange={(e) => handleElementChange(index, 'roofState', e.target.value)}
                    options={MATERIAL_STATE_OPTIONS}
                    disabled={!canEdit || isSubmitting}
                  />

                  {/* Pisos */}
                  <Input
                    label="Material Pisos"
                    value={el.floorsMaterial ?? ''}
                    onChange={(e) => handleElementChange(index, 'floorsMaterial', e.target.value)}
                    disabled={!canEdit || isSubmitting}
                    placeholder="Tierra, Cemento, Cerámica, Machihembre"
                  />
                  <Select
                    label="Estado Pisos"
                    value={el.floorsState ?? 'Regular'}
                    onChange={(e) => handleElementChange(index, 'floorsState', e.target.value)}
                    options={MATERIAL_STATE_OPTIONS}
                    disabled={!canEdit || isSubmitting}
                  />

                  {/* Puertas y Ventanas */}
                  <Input
                    label="Material Puertas"
                    value={el.doorsMaterial ?? ''}
                    onChange={(e) => handleElementChange(index, 'doorsMaterial', e.target.value)}
                    disabled={!canEdit || isSubmitting}
                    placeholder="Madera, Placa, Calamina"
                  />
                  <Input
                    label="Material Ventanas"
                    value={el.windowsMaterial ?? ''}
                    onChange={(e) => handleElementChange(index, 'windowsMaterial', e.target.value)}
                    disabled={!canEdit || isSubmitting}
                    placeholder="Madera con vidrio, Fierro, Sin vidrio"
                  />

                  {/* Instalación Eléctrica */}
                  <Input
                    label="Instalación Eléctrica"
                    value={el.electricalInstallation ?? ''}
                    onChange={(e) =>
                      handleElementChange(index, 'electricalInstallation', e.target.value)
                    }
                    disabled={!canEdit || isSubmitting}
                    placeholder="Empotrada, Sobrepuesta, Precaria"
                  />
                  <Select
                    label="Estado Inst. Eléctrica"
                    value={el.electricalInstallationState ?? 'Regular'}
                    onChange={(e) =>
                      handleElementChange(index, 'electricalInstallationState', e.target.value)
                    }
                    options={MATERIAL_STATE_OPTIONS}
                    disabled={!canEdit || isSubmitting}
                  />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-6 border-t border-gray-200 pt-3">
                  <span className="text-xs font-semibold text-gray-700 uppercase">
                    Diagnóstico Constructivo:
                  </span>
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-800">
                    <input
                      type="radio"
                      name={`interv_${index}`}
                      checked={el.canBeImproved === 1}
                      onChange={() => {
                        handleElementChange(index, 'canBeImproved', 1);
                        handleElementChange(index, 'cannotBeImproved', 0);
                        handleElementChange(index, 'noImprovementNeeded', 0);
                      }}
                      disabled={!canEdit || isSubmitting}
                      className="text-brand-primary focus:ring-brand-primary"
                    />
                    Puede Mejorarse
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-800">
                    <input
                      type="radio"
                      name={`interv_${index}`}
                      checked={el.cannotBeImproved === 1}
                      onChange={() => {
                        handleElementChange(index, 'canBeImproved', 0);
                        handleElementChange(index, 'cannotBeImproved', 1);
                        handleElementChange(index, 'noImprovementNeeded', 0);
                      }}
                      disabled={!canEdit || isSubmitting}
                      className="text-brand-primary focus:ring-brand-primary"
                    />
                    No Puede Mejorarse (Demolición/Inhabitable)
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-800">
                    <input
                      type="radio"
                      name={`interv_${index}`}
                      checked={el.noImprovementNeeded === 1}
                      onChange={() => {
                        handleElementChange(index, 'canBeImproved', 0);
                        handleElementChange(index, 'cannotBeImproved', 0);
                        handleElementChange(index, 'noImprovementNeeded', 1);
                      }}
                      disabled={!canEdit || isSubmitting}
                      className="text-brand-primary focus:ring-brand-primary"
                    />
                    No Requiere Mejora (En buen estado)
                  </label>
                </div>
              </div>
            ))}

            {canEdit && (
              <Button variant="outline" fullWidth={false} onClick={handleAddElement} disabled={isSubmitting}>
                + Agregar Otro Bloque Constructivo
              </Button>
            )}
          </div>
        </FormSection>
      </div>

      {/* 5. Propuesta Técnica de Intervención */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
        <FormSection stepNumber={5} title="Propuesta de Intervención Técnica">
          <p className="mb-4 text-sm text-gray-500">
            Defina el tipo de solución habitacional recomendada para este hogar.
          </p>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-6 rounded-lg bg-gray-50 p-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-gray-800">
                <input
                  type="checkbox"
                  checked={requiresImprovement}
                  onChange={(e) => setRequiresImprovement(e.target.checked)}
                  disabled={!canEdit || isSubmitting}
                  className="rounded text-brand-primary focus:ring-brand-primary"
                />
                Requiere Mejoramiento
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-gray-800">
                <input
                  type="checkbox"
                  checked={requiresExpansion}
                  onChange={(e) => setRequiresExpansion(e.target.checked)}
                  disabled={!canEdit || isSubmitting}
                  className="rounded text-brand-primary focus:ring-brand-primary"
                />
                Requiere Ampliación
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-gray-800">
                <input
                  type="checkbox"
                  checked={requiresRenovation}
                  onChange={(e) => setRequiresRenovation(e.target.checked)}
                  disabled={!canEdit || isSubmitting}
                  className="rounded text-brand-primary focus:ring-brand-primary"
                />
                Requiere Renovación Integral
              </label>
            </div>

            <Input
              label="Ambientes a Mejorar"
              value={roomsToImprove}
              onChange={(e) => setRoomsToImprove(e.target.value)}
              disabled={!canEdit || isSubmitting}
              placeholder="Ej. Dormitorio 1, Cocina, Instalación de Baño nuevo"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Sugerencia Técnica para Dormitorio(s)"
                value={bedroomSuggestion}
                onChange={(e) => setBedroomSuggestion(e.target.value)}
                disabled={!canEdit || isSubmitting}
                placeholder="Revoques, colocación de piso cerámico, ventana..."
              />
              <Input
                label="Sugerencia Técnica para Sala / Comedor"
                value={livingRoomSuggestion}
                onChange={(e) => setLivingRoomSuggestion(e.target.value)}
                disabled={!canEdit || isSubmitting}
                placeholder="Pintura, iluminación, contrapiso..."
              />
              <Input
                label="Sugerencia Técnica para Cocina"
                value={kitchenSuggestion}
                onChange={(e) => setKitchenSuggestion(e.target.value)}
                disabled={!canEdit || isSubmitting}
                placeholder="Mesón de HºCº, revestimiento de azulejo, lavaplatos..."
              />
              <Input
                label="Sugerencia Técnica para Baño"
                value={bathroomSuggestion}
                onChange={(e) => setBathroomSuggestion(e.target.value)}
                disabled={!canEdit || isSubmitting}
                placeholder="Inodoro, ducha, lavamanos, cámara de inspección..."
              />
            </div>

            <div>
              <Input
                label="Observaciones Generales de la Intervención"
                value={generalObservations}
                onChange={(e) => setGeneralObservations(e.target.value)}
                disabled={!canEdit || isSubmitting}
                placeholder="Recomendaciones técnicas adicionales para la ejecución de obra..."
              />
            </div>
          </div>
        </FormSection>
      </div>

      {/* 6. Ficha Fotográfica */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
        <FormSection stepNumber={6} title="Evidencia Fotográfica de Campo">
          <p className="mb-4 text-sm text-gray-500">
            Adjunte las fotografías del diagnóstico técnico de la vivienda.
          </p>

          <div className="space-y-4">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-gray-50/50 p-4 sm:grid-cols-3"
              >
                <div>
                  <Select
                    label="Tipo de Fotografía"
                    value={photo.photoType}
                    onChange={(e) => handlePhotoChange(index, 'photoType', e.target.value)}
                    options={PHOTO_TYPE_OPTIONS}
                    disabled={!canEdit || isSubmitting}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="URL de la Fotografía"
                    value={photo.url}
                    onChange={(e) => handlePhotoChange(index, 'url', e.target.value)}
                    disabled={!canEdit || isSubmitting}
                    placeholder="https://..."
                  />
                </div>
                <div className="sm:col-span-3">
                  <Input
                    label="Descripción / Observación de la Foto"
                    value={photo.description ?? ''}
                    onChange={(e) => handlePhotoChange(index, 'description', e.target.value)}
                    disabled={!canEdit || isSubmitting}
                    placeholder="Detalle visual de la falla o ambiente"
                  />
                </div>
                {canEdit && (
                  <div className="sm:col-span-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                    >
                      Eliminar fotografía
                    </button>
                  </div>
                )}
              </div>
            ))}

            {canEdit && (
              <Button variant="outline" fullWidth={false} onClick={handleAddPhoto} disabled={isSubmitting}>
                + Agregar Fotografía
              </Button>
            )}
          </div>
        </FormSection>
      </div>

      {/* Actions */}
      {canEdit && (
        <div className="flex flex-wrap items-center justify-end gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
          <Button
            variant="outline"
            fullWidth={false}
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Borrador'}
          </Button>
          <Button
            variant="primary"
            fullWidth={false}
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : 'Completar y Guardar Diagnóstico Técnico'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TechnicalDiagnosisForm;
