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
  defaultFormNo?: string | null;
  initialRecord: DiagnosticRecord | null;
  canEdit: boolean;
  onSaveSuccess: (record: DiagnosticRecord) => void;
}

const ABC_STANDARD_OPTIONS = [
  { value: 'DENTRO DE LOS 50 mts DEL EJE DE VIA', label: 'DENTRO DE LOS 50 mts DEL EJE DE VIA' },
  { value: 'FUERA DE LOS 50 mts DEL EJE DE VIA', label: 'FUERA DE LOS 50 mts DEL EJE DE VIA' },
];

const ACCESSIBILITY_OPTIONS = [
  { value: 'CARRETERA ASFALTADA', label: 'CARRETERA ASFALTADA' },
  { value: 'CARRETERA DE TIERRA', label: 'CARRETERA DE TIERRA' },
  { value: 'CAMINO VECINAL', label: 'CAMINO VECINAL' },
  { value: 'SIN ACCESO VEHICULAR', label: 'SIN ACCESO VEHICULAR' },
];

const LAND_CONDITION_OPTIONS = [
  { value: 'SECO', label: 'SECO' },
  { value: 'CON HUMEDAD', label: 'CON HUMEDAD' },
  { value: 'INUNDABLE', label: 'INUNDABLE' },
  { value: 'INESTABLE', label: 'INESTABLE' },
];

const WATER_ACCESS_OPTIONS = [
  { value: 'SIN ACCESO', label: 'SIN ACCESO' },
  { value: 'POR CAÑERIA', label: 'POR CAÑERIA' },
  { value: 'DE POZO', label: 'DE POZO' },
  { value: 'OTRO', label: 'OTRO' },
];

const ELECTRICITY_OPTIONS = [
  { value: 'SIN ACCESO', label: 'SIN ACCESO' },
  { value: 'DE RED', label: 'DE RED' },
  { value: 'PANEL SOLAR', label: 'PANEL SOLAR' },
  { value: 'OTRO', label: 'OTRO' },
];

const BATHROOM_TYPE_OPTIONS = [
  { value: 'NO TIENE', label: 'NO TIENE' },
  { value: 'LETRINA', label: 'LETRINA' },
  { value: 'ECOLOGICO', label: 'ECOLOGICO' },
  { value: 'DESCARGA AGUA', label: 'DESCARGA AGUA' },
];

const KITCHEN_TYPE_OPTIONS = [
  { value: 'NO TIENE', label: 'NO TIENE' },
  { value: 'FOGON', label: 'FOGON' },
  { value: 'MALENA', label: 'MALENA' },
  { value: 'A GAS', label: 'A GAS' },
  { value: 'OTRO', label: 'OTRO' },
];

const HOUSING_TYPOLOGY_OPTIONS = [
  { value: 'UNIFAMILIAR', label: 'UNIFAMILIAR' },
  { value: 'COLECTIVA', label: 'COLECTIVA' },
];

const TENURE_STATUS_OPTIONS = [
  { value: 'PROPIA', label: 'PROPIA' },
  { value: 'ALQUILADA', label: 'ALQUILADA' },
  { value: 'CEDIDA', label: 'CEDIDA' },
  { value: 'PRESTADA', label: 'PRESTADA' },
  { value: 'OTRO', label: 'OTRO' },
];

const USAGE_TYPE_OPTIONS = [
  { value: '', label: '-- Seleccione --' },
  { value: 'DORMITORIO', label: 'DORMITORIO' },
  { value: 'COCINA', label: 'COCINA' },
  { value: 'GALERIA', label: 'GALERIA' },
  { value: 'DEPOSITO', label: 'DEPOSITO' },
  { value: 'USO COMBINADO', label: 'USO COMBINADO' },
  { value: 'TIENDA', label: 'TIENDA' },
  { value: 'PLANTAS', label: 'PLANTAS' },
  { value: 'DIVISIONES INT.', label: 'DIVISIONES INT.' },
];

const MATERIAL_STATE_OPTIONS = [
  { value: 'MAL ESTADO', label: 'MAL ESTADO' },
  { value: 'REGULAR ESTADO', label: 'REGULAR ESTADO' },
  { value: 'BUEN ESTADO', label: 'BUEN ESTADO' },
];

interface ComponentConfig {
  title: string;
  materialField: keyof ConstructionElement;
  stateField: keyof ConstructionElement;
  options: { value: string; label: string }[];
  hasNoTiene: boolean;
}

const CONSTRUCTION_COMPONENT_CONFIGS: ComponentConfig[] = [
  {
    title: 'CIMIENTOS',
    materialField: 'foundationMaterial',
    stateField: 'foundationState',
    hasNoTiene: true,
    options: [
      { value: 'NO TIENE', label: 'NO TIENE' },
      { value: 'PIEDRA Y BARRO', label: 'PIEDRA Y BARRO' },
      { value: 'H°C°', label: 'H°C°' },
      { value: 'OTRO', label: 'OTRO' },
    ],
  },
  {
    title: 'MUROS',
    materialField: 'wallsMaterial',
    stateField: 'wallsState',
    hasNoTiene: false,
    options: [
      { value: 'TAPIAL', label: 'TAPIAL' },
      { value: 'ADOBE', label: 'ADOBE' },
      { value: 'LADRILLO', label: 'LADRILLO' },
      { value: 'OTRO', label: 'OTRO' },
    ],
  },
  {
    title: 'TECHOS',
    materialField: 'roofMaterial',
    stateField: 'roofState',
    hasNoTiene: false,
    options: [
      { value: 'PAJA', label: 'PAJA' },
      { value: 'CALAMINA', label: 'CALAMINA' },
      { value: 'FIBROCEMENTO', label: 'FIBROCEMENTO' },
      { value: 'OTRO', label: 'OTRO' },
    ],
  },
  {
    title: 'REVOQUE EXT.',
    materialField: 'exteriorPlasterMaterial',
    stateField: 'exteriorPlasterState',
    hasNoTiene: true,
    options: [
      { value: 'NO TIENE', label: 'NO TIENE' },
      { value: 'BARRO', label: 'BARRO' },
      { value: 'YESO', label: 'YESO' },
      { value: 'CEMENTO', label: 'CEMENTO' },
      { value: 'OTRO', label: 'OTRO' },
    ],
  },
  {
    title: 'REVOQUE INT.',
    materialField: 'interiorPlasterMaterial',
    stateField: 'interiorPlasterState',
    hasNoTiene: true,
    options: [
      { value: 'NO TIENE', label: 'NO TIENE' },
      { value: 'BARRO', label: 'BARRO' },
      { value: 'YESO', label: 'YESO' },
      { value: 'CEMENTO', label: 'CEMENTO' },
      { value: 'OTRO', label: 'OTRO' },
    ],
  },
  {
    title: 'REV. EN CIELO',
    materialField: 'ceilingPlasterMaterial',
    stateField: 'ceilingPlasterState',
    hasNoTiene: true,
    options: [
      { value: 'NO TIENE', label: 'NO TIENE' },
      { value: 'TELA', label: 'TELA' },
      { value: 'YESO', label: 'YESO' },
      { value: 'PLAFON', label: 'PLAFON' },
      { value: 'OTRO', label: 'OTRO' },
    ],
  },
  {
    title: 'PISOS',
    materialField: 'floorsMaterial',
    stateField: 'floorsState',
    hasNoTiene: false,
    options: [
      { value: 'TIERRA', label: 'TIERRA' },
      { value: 'CEMENTO', label: 'CEMENTO' },
      { value: 'TABLON', label: 'TABLON' },
      { value: 'MACHIMBRE', label: 'MACHIMBRE' },
      { value: 'CERAMICA', label: 'CERAMICA' },
      { value: 'LAD. ADOBITO', label: 'LAD. ADOBITO' },
    ],
  },
  {
    title: 'PUERTAS',
    materialField: 'doorsMaterial',
    stateField: 'doorsState',
    hasNoTiene: true,
    options: [
      { value: 'NO TIENE', label: 'NO TIENE' },
      { value: 'IMPROVISADA', label: 'IMPROVISADA' },
      { value: 'LATON', label: 'LATON' },
      { value: 'MADERA', label: 'MADERA' },
      { value: 'METALICA', label: 'METALICA' },
    ],
  },
  {
    title: 'VENTANAS',
    materialField: 'windowsMaterial',
    stateField: 'windowsState',
    hasNoTiene: true,
    options: [
      { value: 'NO TIENE', label: 'NO TIENE' },
      { value: 'IMPROVISADA', label: 'IMPROVISADA' },
      { value: 'MADERA', label: 'MADERA' },
      { value: 'METALICA', label: 'METALICA' },
    ],
  },
  {
    title: 'INST. ELÉCTRICA',
    materialField: 'electricalInstallation',
    stateField: 'electricalInstallationState',
    hasNoTiene: true,
    options: [
      { value: 'NO TIENE', label: 'NO TIENE' },
      { value: 'INST. PRECARIA', label: 'INST. PRECARIA' },
      { value: 'TIENE', label: 'TIENE' },
    ],
  },
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
  defaultFormNo,
  initialRecord,
  canEdit,
  onSaveSuccess,
}: TechnicalDiagnosisFormProps) => {
  const formNo = initialRecord?.formNo ?? defaultFormNo ?? '';

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
            usageType: '',
            foundationMaterial: '',
            foundationState: '',
            wallsMaterial: '',
            wallsState: '',
            roofMaterial: '',
            roofState: '',
            exteriorPlasterMaterial: '',
            exteriorPlasterState: '',
            interiorPlasterMaterial: '',
            interiorPlasterState: '',
            ceilingPlasterMaterial: '',
            ceilingPlasterState: '',
            floorsMaterial: '',
            floorsState: '',
            doorsMaterial: '',
            doorsState: '',
            windowsMaterial: '',
            windowsState: '',
            electricalInstallation: '',
            electricalInstallationState: '',
            canBeImproved: 0,
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
        usageType: '',
        foundationMaterial: '',
        foundationState: '',
        wallsMaterial: '',
        wallsState: '',
        roofMaterial: '',
        roofState: '',
        exteriorPlasterMaterial: '',
        exteriorPlasterState: '',
        interiorPlasterMaterial: '',
        interiorPlasterState: '',
        ceilingPlasterMaterial: '',
        ceilingPlasterState: '',
        floorsMaterial: '',
        floorsState: '',
        doorsMaterial: '',
        doorsState: '',
        windowsMaterial: '',
        windowsState: '',
        electricalInstallation: '',
        electricalInstallationState: '',
        canBeImproved: 0,
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
      const now = new Date();
      const deviceDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      const payload: TechnicalDiagnosticInput = {
        formNo: formNo.trim() || null,
        evaluationDate: deviceDate,
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
      </div>

      {/* 1. Terreno y Accesibilidad */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
        <FormSection stepNumber={1} title="Terreno y Accesibilidad" withDivider={false}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-6 lg:grid-cols-12">
            <div className="col-span-1 rounded-xl border border-purple-200 bg-purple-100/70 p-3 shadow-2xs sm:col-span-2 lg:col-span-2 [&_.MuiOutlinedInput-root]:bg-white/90">
              <Input
                label="Pendiente (%)"
                type="number"
                value={slopePercentage ?? ''}
                onChange={(e) =>
                  setSlopePercentage(e.target.value === '' ? null : Number(e.target.value))
                }
                disabled={!canEdit || isSubmitting}
                placeholder="Ej. 5"
              />
            </div>
            <div className="col-span-1 rounded-xl border border-sky-200 bg-sky-100/70 p-3 shadow-2xs sm:col-span-2 lg:col-span-2 [&_.MuiOutlinedInput-root]:bg-white/90">
              <Input
                label="Caminata (min)"
                type="number"
                value={pedestrianMinutes ?? ''}
                onChange={(e) =>
                  setPedestrianMinutes(e.target.value === '' ? null : Number(e.target.value))
                }
                disabled={!canEdit || isSubmitting}
                placeholder="Minutos"
              />
            </div>
            <div className="col-span-2 rounded-xl border border-purple-200 bg-purple-100/70 p-3 shadow-2xs sm:col-span-2 lg:col-span-3 [&_.MuiOutlinedInput-root]:bg-white/90">
              <Select
                label="Norma ABC"
                value={abcStandard}
                onChange={(e) => setAbcStandard(e.target.value)}
                options={ABC_STANDARD_OPTIONS}
                disabled={!canEdit || isSubmitting}
              />
            </div>
            <div className="col-span-2 rounded-xl border border-sky-200 bg-sky-100/70 p-3 shadow-2xs sm:col-span-3 lg:col-span-3 [&_.MuiOutlinedInput-root]:bg-white/90">
              <Select
                label="Tipo de Accesibilidad"
                value={accessibilityType}
                onChange={(e) => setAccessibilityType(e.target.value)}
                options={ACCESSIBILITY_OPTIONS}
                disabled={!canEdit || isSubmitting}
              />
            </div>
            <div className="col-span-2 rounded-xl border border-purple-200 bg-purple-100/70 p-3 shadow-2xs sm:col-span-3 lg:col-span-2 [&_.MuiOutlinedInput-root]:bg-white/90">
              <Select
                label="Condición del Terreno"
                value={landCondition}
                onChange={(e) => setLandCondition(e.target.value)}
                options={LAND_CONDITION_OPTIONS}
                disabled={!canEdit || isSubmitting}
              />
            </div>
          </div>
        </FormSection>
      </div>

      {/* 2. Servicios Básicos */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
        <FormSection stepNumber={2} title="Servicios Básicos e Higiene">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
            {/* Agua */}
            <div className="rounded-xl border border-purple-200 bg-purple-100/70 p-3 shadow-2xs lg:col-span-2 [&_.MuiOutlinedInput-root]:bg-white/90">
              <h4 className="mb-2 text-[11px] font-bold tracking-wide text-purple-900 uppercase">
                Agua Potable
              </h4>
              <Select
                label="Acceso a Agua"
                value={waterAccess}
                onChange={(e) => setWaterAccess(e.target.value)}
                options={WATER_ACCESS_OPTIONS}
                disabled={!canEdit || isSubmitting}
              />
            </div>

            {/* Electricidad */}
            <div className="rounded-xl border border-sky-200 bg-sky-100/70 p-3 shadow-2xs lg:col-span-2 [&_.MuiOutlinedInput-root]:bg-white/90">
              <h4 className="mb-2 text-[11px] font-bold tracking-wide text-sky-900 uppercase">
                Energía Eléctrica
              </h4>
              <Select
                label="Servicio Eléctrico"
                value={electricityService}
                onChange={(e) => setElectricityService(e.target.value)}
                options={ELECTRICITY_OPTIONS}
                disabled={!canEdit || isSubmitting}
              />
            </div>

            {/* Recuadro de Baño */}
            <div className="rounded-xl border border-purple-200 bg-purple-100/70 p-3 shadow-2xs lg:col-span-4 [&_.MuiOutlinedInput-root]:bg-white/90">
              <h4 className="mb-2 text-[11px] font-bold tracking-wide text-purple-900 uppercase">
                Baño / Servicio Sanitario
              </h4>
              <Select
                label="Tipo de Baño / Letrina"
                value={bathroomType}
                onChange={(e) => {
                  const nextType = e.target.value;
                  setBathroomType(nextType);
                  if (!nextType || nextType === 'NO TIENE') {
                    setPrivateBathroom(false);
                    setSharedBathroom(false);
                  }
                }}
                options={BATHROOM_TYPE_OPTIONS}
                disabled={!canEdit || isSubmitting}
              />
              <div className="mt-2.5 flex flex-wrap items-center gap-4 rounded-lg border border-purple-200/80 bg-white/90 px-3 py-2">
                {(() => {
                  const canChooseBathroomUsage =
                    Boolean(bathroomType) && bathroomType !== 'NO TIENE';
                  return (
                    <>
                      <label
                        className={`flex items-center gap-1.5 text-xs font-medium ${
                          canEdit && canChooseBathroomUsage
                            ? 'cursor-pointer text-gray-800'
                            : 'cursor-not-allowed text-gray-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={sharedBathroom}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setSharedBathroom(checked);
                            if (checked) setPrivateBathroom(false);
                          }}
                          disabled={!canEdit || isSubmitting || !canChooseBathroomUsage}
                          className="rounded text-brand-primary focus:ring-brand-primary disabled:opacity-50"
                        />
                        DE USO COMPARTIDO
                      </label>
                      <label
                        className={`flex items-center gap-1.5 text-xs font-medium ${
                          canEdit && canChooseBathroomUsage
                            ? 'cursor-pointer text-gray-800'
                            : 'cursor-not-allowed text-gray-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={privateBathroom}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setPrivateBathroom(checked);
                            if (checked) setSharedBathroom(false);
                          }}
                          disabled={!canEdit || isSubmitting || !canChooseBathroomUsage}
                          className="rounded text-brand-primary focus:ring-brand-primary disabled:opacity-50"
                        />
                        DE USO PRIVADO
                      </label>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Recuadro de Cocina */}
            <div className="rounded-xl border border-sky-200 bg-sky-100/70 p-3 shadow-2xs lg:col-span-4 [&_.MuiOutlinedInput-root]:bg-white/90">
              <h4 className="mb-2 text-[11px] font-bold tracking-wide text-sky-900 uppercase">
                Cocina
              </h4>
              <Select
                label="Tipo de Cocina"
                value={kitchenType}
                onChange={(e) => {
                  const nextType = e.target.value;
                  setKitchenType(nextType);
                  if (nextType === 'NO TIENE') {
                    setPrivateKitchen(false);
                    setSharedKitchen(false);
                  } else if (nextType) {
                    setAdequateKitchen(false);
                  } else {
                    setPrivateKitchen(false);
                    setSharedKitchen(false);
                    setAdequateKitchen(false);
                  }
                }}
                options={KITCHEN_TYPE_OPTIONS}
                disabled={!canEdit || isSubmitting}
              />
              <div className="mt-2.5 flex flex-wrap items-center gap-3 rounded-lg border border-sky-200/80 bg-white/90 px-3 py-2">
                {(() => {
                  const hasKitchen = Boolean(kitchenType) && kitchenType !== 'NO TIENE';
                  const hasNoKitchen = kitchenType === 'NO TIENE';
                  return (
                    <>
                      <label
                        className={`flex items-center gap-1.5 text-xs font-medium ${
                          canEdit && hasKitchen
                            ? 'cursor-pointer text-gray-800'
                            : 'cursor-not-allowed text-gray-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={privateKitchen}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setPrivateKitchen(checked);
                            if (checked) setSharedKitchen(false);
                          }}
                          disabled={!canEdit || isSubmitting || !hasKitchen}
                          className="rounded text-brand-primary focus:ring-brand-primary disabled:opacity-50"
                        />
                        Cocina Privada
                      </label>
                      <label
                        className={`flex items-center gap-1.5 text-xs font-medium ${
                          canEdit && hasKitchen
                            ? 'cursor-pointer text-gray-800'
                            : 'cursor-not-allowed text-gray-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={sharedKitchen}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setSharedKitchen(checked);
                            if (checked) setPrivateKitchen(false);
                          }}
                          disabled={!canEdit || isSubmitting || !hasKitchen}
                          className="rounded text-brand-primary focus:ring-brand-primary disabled:opacity-50"
                        />
                        Cocina Compartida
                      </label>
                      <label
                        className={`flex items-center gap-1.5 text-xs font-medium ${
                          canEdit && hasNoKitchen
                            ? 'cursor-pointer text-gray-800'
                            : 'cursor-not-allowed text-gray-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={adequateKitchen}
                          onChange={(e) => setAdequateKitchen(e.target.checked)}
                          disabled={!canEdit || isSubmitting || !hasNoKitchen}
                          className="rounded text-brand-primary focus:ring-brand-primary disabled:opacity-50"
                        />
                        Ambiente Adecuado
                      </label>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </FormSection>
      </div>

      {/* 3. Características y Tenencia */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
        <FormSection stepNumber={3} title="Tipología y Régimen de Tenencia">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
            <div className="rounded-xl border border-purple-200 bg-purple-100/70 p-3 shadow-2xs lg:col-span-3 [&_.MuiOutlinedInput-root]:bg-white/90">
              <Select
                label="Tipología de Habitabilidad"
                value={housingTypology}
                onChange={(e) => setHousingTypology(e.target.value)}
                options={HOUSING_TYPOLOGY_OPTIONS}
                disabled={!canEdit || isSubmitting}
              />
            </div>
            <div className="rounded-xl border border-sky-200 bg-sky-100/70 p-3 shadow-2xs lg:col-span-4 [&_.MuiOutlinedInput-root]:bg-white/90">
              <Select
                label="Característica de Ocupación de la Vivienda"
                value={tenureStatus}
                onChange={(e) => setTenureStatus(e.target.value)}
                options={TENURE_STATUS_OPTIONS}
                disabled={!canEdit || isSubmitting}
              />
            </div>
            <div className="rounded-xl border border-purple-200 bg-purple-100/70 p-3 shadow-2xs sm:col-span-2 lg:col-span-5 [&_.MuiOutlinedInput-root]:bg-white/90">
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
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
        <FormSection stepNumber={4} title="Componentes y Materiales Constructivos">
          <div className="space-y-5">
            {elements.map((el, index) => (
              <div
                key={index}
                className="relative rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition-colors hover:border-gray-300"
              >
                {/* Fila superior del bloque: Número de bloque + Uso + Eliminar */}
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className="text-sm font-bold text-gray-900">
                      Construcción / Bloque #{el.constructionNumber}
                    </h4>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold tracking-wide text-brand-primary uppercase">
                        USO:
                      </label>
                      <select
                        value={el.usageType ?? ''}
                        onChange={(e) => handleElementChange(index, 'usageType', e.target.value)}
                        disabled={!canEdit || isSubmitting}
                        className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-800 shadow-2xs focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                      >
                        {USAGE_TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
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

                {/* Fila 1: Los 10 componentes constructivos en una sola fila con recuadro propio */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-10">
                  {CONSTRUCTION_COMPONENT_CONFIGS.map((comp, compIdx) => {
                    const materialVal = String(el[comp.materialField] ?? '');
                    const stateVal = String(el[comp.stateField] ?? '');
                    const isNoTiene = comp.hasNoTiene && materialVal === 'NO TIENE';
                    const isEven = compIdx % 2 === 0;

                    return (
                      <div
                        key={comp.title}
                        className={`flex flex-col justify-between rounded-lg border p-2 shadow-2xs ${
                          isEven
                            ? 'border-purple-200 bg-purple-100/70'
                            : 'border-sky-200 bg-sky-100/70'
                        }`}
                      >
                        <div
                          className={`mb-1.5 border-b pb-1 text-[10px] font-bold tracking-wider uppercase ${
                            isEven
                              ? 'border-purple-200/80 text-purple-900'
                              : 'border-sky-200/80 text-sky-900'
                          }`}
                        >
                          {comp.title}
                        </div>

                        <div className="space-y-1.5">
                          <div>
                            <select
                              value={materialVal}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleElementChange(index, comp.materialField, val);
                                if (comp.hasNoTiene && val === 'NO TIENE') {
                                  handleElementChange(index, comp.stateField, '');
                                }
                              }}
                              disabled={!canEdit || isSubmitting}
                              className="w-full rounded border border-gray-300 bg-white/90 px-1.5 py-1 text-[11px] font-medium text-gray-800 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                            >
                              <option value="">-- Seleccione --</option>
                              {comp.options.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label
                              className={`mb-0.5 block text-[10px] font-bold uppercase ${
                                isEven ? 'text-purple-800' : 'text-sky-800'
                              }`}
                            >
                              Estado
                            </label>
                            <select
                              value={isNoTiene ? '' : stateVal}
                              onChange={(e) =>
                                handleElementChange(index, comp.stateField, e.target.value)
                              }
                              disabled={!canEdit || isSubmitting || isNoTiene}
                              className="w-full rounded border border-gray-300 bg-white/90 px-1.5 py-1 text-[11px] font-medium text-gray-800 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100/80 disabled:text-gray-400"
                            >
                              <option value="">
                                {isNoTiene ? '— No aplica —' : '-- Seleccione --'}
                              </option>
                              {MATERIAL_STATE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Fila 2: Recomendación Técnica (puntajes 0 a 10) y Observaciones en una sola fila */}
                <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-12">
                  <div className="rounded-lg border border-purple-200 bg-purple-100/70 p-3 shadow-2xs lg:col-span-7">
                    <div className="mb-2 border-b border-purple-200/80 pb-1 text-xs font-bold tracking-wide text-purple-900 uppercase">
                      Recomendación Técnica (Valoración 0 al 10)
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <div className="flex items-center justify-between gap-2 rounded-md border border-purple-200/80 bg-white/85 px-2.5 py-1.5">
                        <label className="text-[11px] font-semibold text-purple-950">
                          NO SE PUEDE MEJORAR
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={10}
                          value={el.cannotBeImproved ?? 0}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const num = raw === '' ? 0 : Math.max(0, Math.min(10, Number(raw)));
                            handleElementChange(index, 'cannotBeImproved', num);
                          }}
                          disabled={!canEdit || isSubmitting}
                          className="w-14 rounded border border-gray-300 bg-white px-2 py-1 text-center text-xs font-bold text-gray-900 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none disabled:bg-gray-100"
                        />
                      </div>

                      <div className="flex items-center justify-between gap-2 rounded-md border border-purple-200/80 bg-white/85 px-2.5 py-1.5">
                        <label className="text-[11px] font-semibold text-purple-950">
                          SE PUEDE MEJORAR
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={10}
                          value={el.canBeImproved ?? 0}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const num = raw === '' ? 0 : Math.max(0, Math.min(10, Number(raw)));
                            handleElementChange(index, 'canBeImproved', num);
                          }}
                          disabled={!canEdit || isSubmitting}
                          className="w-14 rounded border border-gray-300 bg-white px-2 py-1 text-center text-xs font-bold text-gray-900 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none disabled:bg-gray-100"
                        />
                      </div>

                      <div className="flex items-center justify-between gap-2 rounded-md border border-purple-200/80 bg-white/85 px-2.5 py-1.5">
                        <label className="text-[11px] font-semibold text-purple-950">
                          NO NECESITA MEJORAR
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={10}
                          value={el.noImprovementNeeded ?? 0}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const num = raw === '' ? 0 : Math.max(0, Math.min(10, Number(raw)));
                            handleElementChange(index, 'noImprovementNeeded', num);
                          }}
                          disabled={!canEdit || isSubmitting}
                          className="w-14 rounded border border-gray-300 bg-white px-2 py-1 text-center text-xs font-bold text-gray-900 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none disabled:bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-sky-200 bg-sky-100/70 p-3 shadow-2xs lg:col-span-5">
                    <div className="mb-2 border-b border-sky-200/80 pb-1 text-xs font-bold tracking-wide text-sky-900 uppercase">
                      Observaciones del Bloque
                    </div>
                    <input
                      type="text"
                      value={el.observations ?? ''}
                      onChange={(e) => handleElementChange(index, 'observations', e.target.value)}
                      disabled={!canEdit || isSubmitting}
                      placeholder="Observaciones constructivas de este bloque o ambiente..."
                      className="w-full rounded-md border border-gray-300 bg-white/95 px-3 py-1.5 text-xs text-gray-800 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
                    />
                  </div>
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
