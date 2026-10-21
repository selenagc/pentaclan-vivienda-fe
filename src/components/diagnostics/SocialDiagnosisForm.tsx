import { useState, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { FormSection } from '../ui/FormSection';
import { diagnosticService } from '../../services/diagnosticService';
import type {
  DiagnosticRecord,
  EvaluationQuestion,
  FamilyMember,
  SocialDiagnosticInput,
} from '../../types/diagnostic.types';

interface SocialDiagnosisFormProps {
  applicationId: string;
  defaultFormNo?: string | null;
  initialRecord: DiagnosticRecord | null;
  canEdit: boolean;
  onSaveSuccess: (record: DiagnosticRecord) => void;
}

const RELATIONSHIP_OPTIONS = [
  { value: 'Jefe(a) de Hogar', label: 'Jefe(a) de Hogar' },
  { value: 'Cónyuge / Conviviente', label: 'Cónyuge / Conviviente' },
  { value: 'Hijo(a)', label: 'Hijo(a)' },
  { value: 'Padre / Madre', label: 'Padre / Madre' },
  { value: 'Hermano(a)', label: 'Hermano(a)' },
  { value: 'Nieto(a)', label: 'Nieto(a)' },
  { value: 'Yerno / Nuera', label: 'Yerno / Nuera' },
  { value: 'Suegro(a)', label: 'Suegro(a)' },
  { value: 'Otro familiar', label: 'Otro familiar' },
];

const WATER_SOURCE_OPTIONS = [
  { value: 'Red pública dentro de la vivienda', label: 'Red pública dentro de la vivienda' },
  { value: 'Red pública fuera de la vivienda', label: 'Red pública fuera de la vivienda' },
  { value: 'Pila o grifo público', label: 'Pila o grifo público' },
  { value: 'Carro cisterna', label: 'Carro cisterna' },
  { value: 'Pozo protegido', label: 'Pozo protegido' },
  { value: 'Pozo no protegido / Río / Vertiente', label: 'Pozo no protegido / Río / Vertiente' },
  { value: 'Cosecha de agua de lluvia', label: 'Cosecha de agua de lluvia' },
];

const CONTAINER_STATUS_OPTIONS = [
  { value: 'Bueno (Limpio y con tapa)', label: 'Bueno (Limpio y con tapa)' },
  { value: 'Regular (Con tapa pero desgastado)', label: 'Regular (Con tapa pero desgastado)' },
  { value: 'Malo (Sin tapa o contaminado)', label: 'Malo (Sin tapa o contaminado)' },
];

const WATER_TREATMENT_OPTIONS = [
  { value: 'Hierve el agua', label: 'Hierve el agua' },
  { value: 'Aplica cloro / lavandina', label: 'Aplica cloro / lavandina' },
  { value: 'Filtra el agua', label: 'Filtra el agua' },
  { value: 'No realiza ningún tratamiento', label: 'No realiza ningún tratamiento' },
];

const GREYWATER_OPTIONS = [
  { value: 'Red de alcantarillado', label: 'Red de alcantarillado' },
  { value: 'Cámara séptica con pozo de absorción', label: 'Cámara séptica con pozo de absorción' },
  { value: 'Pozo ciego o letrina', label: 'Pozo ciego o letrina' },
  { value: 'A la calle / acequia / río', label: 'A la calle / acequia / río' },
  { value: 'Al patio o huerto', label: 'Al patio o huerto' },
];

const GARBAGE_OPTIONS = [
  { value: 'Servicio público de recojo', label: 'Servicio público de recojo' },
  { value: 'La quema', label: 'La quema' },
  { value: 'La entierra', label: 'La entierra' },
  { value: 'La bota al río / quebrada / baldío', label: 'La bota al río / quebrada / baldío' },
];

const CLEANLINESS_OPTIONS = [
  { value: 'Excelente', label: 'Excelente' },
  { value: 'Bueno', label: 'Bueno' },
  { value: 'Regular', label: 'Regular' },
  { value: 'Deficiente', label: 'Deficiente' },
];

const HEALTH_CARE_OPTIONS = [
  { value: 'Centro de Salud / Hospital público', label: 'Centro de Salud / Hospital público' },
  { value: 'Posta Sanitaria / Puesto de salud', label: 'Posta Sanitaria / Puesto de salud' },
  { value: 'Clínica / Consulta privada', label: 'Clínica / Consulta privada' },
  { value: 'Medicina tradicional / Naturista', label: 'Medicina tradicional / Naturista' },
  { value: 'Se automedica / Compra en farmacia', label: 'Se automedica / Compra en farmacia' },
];

export const SocialDiagnosisForm = ({
  applicationId,
  defaultFormNo,
  initialRecord,
  canEdit,
  onSaveSuccess,
}: SocialDiagnosisFormProps) => {
  const formNo = initialRecord?.formNo ?? defaultFormNo ?? '';


  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(
    initialRecord?.familyMembers?.length
      ? initialRecord.familyMembers
      : [
          {
            fullName: '',
            relationship: 'Jefe(a) de Hogar',
            age: null,
            occupation: '',
            hasDisability: false,
            disabilityType: '',
            disabilityDocument: '',
          },
        ],
  );

  const [questions, setQuestions] = useState<EvaluationQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, { answerBoolean: boolean | null; score: string }>>(
    () => {
      const initialMap: Record<number, { answerBoolean: boolean | null; score: string }> = {};
      if (initialRecord?.answers) {
        for (const ans of initialRecord.answers) {
          initialMap[ans.evaluationQuestionId] = {
            answerBoolean: ans.answerBoolean ?? null,
            score: ans.score ?? '',
          };
        }
      }
      return initialMap;
    },
  );

  const [waterSource, setWaterSource] = useState(initialRecord?.waterHabits?.waterSource ?? '');
  const [containerClean, setContainerClean] = useState(initialRecord?.waterHabits?.containerClean ?? false);
  const [containerStatus, setContainerStatus] = useState(initialRecord?.waterHabits?.containerStatus ?? '');
  const [waterTreatment, setWaterTreatment] = useState(initialRecord?.waterHabits?.waterTreatment ?? '');
  const [waterDetails, setWaterDetails] = useState(initialRecord?.waterHabits?.otherDetails ?? '');

  const [greywaterDisposal, setGreywaterDisposal] = useState(initialRecord?.hygiene?.greywaterDisposal ?? '');
  const [garbageDisposal, setGarbageDisposal] = useState(initialRecord?.hygiene?.garbageDisposal ?? '');
  const [cleanlinessStatus, setCleanlinessStatus] = useState(initialRecord?.hygiene?.cleanlinessStatus ?? '');

  const [prevalentDiseases, setPrevalentDiseases] = useState(initialRecord?.health?.prevalentDiseases ?? '');
  const [healthCareAction, setHealthCareAction] = useState(initialRecord?.health?.healthCareAction ?? '');

  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    diagnosticService
      .getEvaluationQuestions()
      .then((data) => {
        if (active) {
          setQuestions(data);
          setIsLoadingQuestions(false);
        }
      })
      .catch((err) => {
        console.error('Error al cargar preguntas de evaluación', err);
        if (active) setIsLoadingQuestions(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleAddMember = () => {
    setFamilyMembers((prev) => [
      ...prev,
      {
        fullName: '',
        relationship: 'Hijo(a)',
        age: null,
        occupation: '',
        hasDisability: false,
        disabilityType: '',
        disabilityDocument: '',
      },
    ]);
  };

  const handleRemoveMember = (index: number) => {
    setFamilyMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMemberChange = <K extends keyof FamilyMember>(
    index: number,
    field: K,
    value: FamilyMember[K],
  ) => {
    setFamilyMembers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAnswerChange = (questionId: number, answerBoolean: boolean | null) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] ?? { score: '' }),
        answerBoolean,
      },
    }));
  };

  const handleScoreChange = (questionId: number, score: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] ?? { answerBoolean: null }),
        score,
      },
    }));
  };

  const handleSubmit = async (isCompleted: boolean) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const answersPayload = Object.entries(answers).map(([qId, val]) => ({
        evaluationQuestionId: Number(qId),
        answerBoolean: val.answerBoolean,
        score: val.score || null,
      }));

      const payload: SocialDiagnosticInput = {
        formNo: formNo.trim() || null,
        evaluationDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`,
        isCompleted,
        familyMembers: familyMembers.filter((m) => m.fullName.trim() !== ''),
        answers: answersPayload,
        waterHabits: {
          waterSource: waterSource || null,
          containerClean,
          containerStatus: containerStatus || null,
          waterTreatment: waterTreatment || null,
          otherDetails: waterDetails.trim() || null,
        },
        hygiene: {
          greywaterDisposal: greywaterDisposal || null,
          garbageDisposal: garbageDisposal || null,
          cleanlinessStatus: cleanlinessStatus || null,
        },
        health: {
          prevalentDiseases: prevalentDiseases.trim() || null,
          healthCareAction: healthCareAction || null,
        },
      };

      const updated = await diagnosticService.saveSocial(applicationId, payload);
      setSuccessMessage(
        isCompleted
          ? 'Diagnóstico social guardado y marcado como completado.'
          : 'Borrador del diagnóstico social guardado correctamente.',
      );
      onSaveSuccess(updated);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || err?.message || 'Error al guardar el diagnóstico social.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group questions by category
  const groupedQuestions = questions.reduce<Record<string, EvaluationQuestion[]>>((acc, q) => {
    const cat = q.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(q);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header status */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Módulo de Evaluación Social</h2>
            <p className="text-sm text-gray-500">
              Evaluación socioeconómica, demográfica y hábitos de vida familiar.
            </p>
          </div>
          {initialRecord?.socialCompletedAt ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Completado por {initialRecord.socialUserName || 'Evaluador Social'} el{' '}
              {new Date(initialRecord.socialCompletedAt).toLocaleDateString('es-BO')}
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
              Estás visualizando este diagnóstico en modo solo lectura. Solo el Evaluador Social (o el Administrador) asignado puede modificarlo.
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

      {/* 1. Composición Familiar */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
        <FormSection stepNumber={1} title="Composición del Grupo Familiar" withDivider={false}>
          <p className="mb-4 text-sm text-gray-500">
            Registre a todas las personas que residen de forma habitual en la vivienda evaluada.
          </p>

          <div className="space-y-4">
            {familyMembers.map((member, index) => (
              <div
                key={index}
                className="relative rounded-lg border border-gray-200 bg-gray-50/50 p-4 transition-colors hover:border-gray-300"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                  <div className="md:col-span-2">
                    <Input
                      label="Nombres y Apellidos"
                      value={member.fullName}
                      onChange={(e) => handleMemberChange(index, 'fullName', e.target.value)}
                      disabled={!canEdit || isSubmitting}
                      placeholder="Nombre completo"
                    />
                  </div>
                  <div>
                    <Select
                      label="Parentesco"
                      value={member.relationship}
                      onChange={(e) => handleMemberChange(index, 'relationship', e.target.value)}
                      options={RELATIONSHIP_OPTIONS}
                      disabled={!canEdit || isSubmitting}
                    />
                  </div>
                  <div>
                    <Input
                      label="Edad"
                      type="number"
                      value={member.age ?? ''}
                      onChange={(e) =>
                        handleMemberChange(
                          index,
                          'age',
                          e.target.value === '' ? null : Number(e.target.value),
                        )
                      }
                      disabled={!canEdit || isSubmitting}
                      placeholder="Años"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      label="Ocupación / Oficio"
                      value={member.occupation ?? ''}
                      onChange={(e) => handleMemberChange(index, 'occupation', e.target.value)}
                      disabled={!canEdit || isSubmitting}
                      placeholder="Ej. Albañil, Comerciante, Estudiante"
                    />
                  </div>
                  <div>
                    <Select
                      label="¿Tiene Discapacidad?"
                      value={member.hasDisability ? 'true' : 'false'}
                      onChange={(e) =>
                        handleMemberChange(index, 'hasDisability', e.target.value === 'true')
                      }
                      options={[
                        { value: 'false', label: 'No' },
                        { value: 'true', label: 'Sí' },
                      ]}
                      disabled={!canEdit || isSubmitting}
                    />
                  </div>
                  {member.hasDisability && (
                    <div>
                      <Input
                        label="Tipo de Discapacidad"
                        value={member.disabilityType ?? ''}
                        onChange={(e) =>
                          handleMemberChange(index, 'disabilityType', e.target.value)
                        }
                        disabled={!canEdit || isSubmitting}
                        placeholder="Física, Auditiva, etc."
                      />
                    </div>
                  )}
                </div>

                {canEdit && familyMembers.length > 1 && (
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(index)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                    >
                      Eliminar integrante
                    </button>
                  </div>
                )}
              </div>
            ))}

            {canEdit && (
              <div className="pt-2">
                <Button variant="outline" fullWidth={false} onClick={handleAddMember} disabled={isSubmitting}>
                  + Agregar Familiar
                </Button>
              </div>
            )}
          </div>
        </FormSection>
      </div>

      {/* 2. Preguntas de Diagnóstico y Evaluación */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
        <FormSection stepNumber={2} title="Cuestionario Socioeconómico">
          <p className="mb-4 text-sm text-gray-500">
            Responda las preguntas de verificación y evaluación del hogar.
          </p>

          {isLoadingQuestions ? (
            <p className="py-4 text-sm text-gray-400">Cargando cuestionario...</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedQuestions).map(([category, catQuestions]) => (
                <div key={category} className="space-y-3">
                  <h4 className="border-b border-gray-200 pb-1 text-xs font-bold uppercase tracking-wider text-brand-primary">
                    {category}
                  </h4>
                  <div className="divide-y divide-gray-100 rounded-lg border border-gray-100 bg-gray-50/30">
                    {catQuestions.map((q) => {
                      const ans = answers[q.id];
                      return (
                        <div
                          key={q.id}
                          className="flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <span className="text-sm font-medium text-gray-800">
                            {q.questionText}
                          </span>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <label className="flex cursor-pointer items-center gap-1.5 text-xs text-gray-700">
                                <input
                                  type="radio"
                                  name={`q_${q.id}`}
                                  checked={ans?.answerBoolean === true}
                                  onChange={() => handleAnswerChange(q.id, true)}
                                  disabled={!canEdit || isSubmitting}
                                  className="text-brand-primary focus:ring-brand-primary"
                                />
                                Sí
                              </label>
                              <label className="flex cursor-pointer items-center gap-1.5 text-xs text-gray-700">
                                <input
                                  type="radio"
                                  name={`q_${q.id}`}
                                  checked={ans?.answerBoolean === false}
                                  onChange={() => handleAnswerChange(q.id, false)}
                                  disabled={!canEdit || isSubmitting}
                                  className="text-brand-primary focus:ring-brand-primary"
                                />
                                No
                              </label>
                            </div>
                            <div className="w-24">
                              <input
                                type="text"
                                placeholder="Puntaje"
                                value={ans?.score ?? ''}
                                onChange={(e) => handleScoreChange(q.id, e.target.value)}
                                disabled={!canEdit || isSubmitting}
                                className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-900 focus:border-brand-primary focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </FormSection>
      </div>

      {/* 3. Hábitos y Consumo de Agua */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
        <FormSection stepNumber={3} title="Uso y Consumo de Agua">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Fuente Principal de Agua"
              value={waterSource}
              onChange={(e) => setWaterSource(e.target.value)}
              options={WATER_SOURCE_OPTIONS}
              disabled={!canEdit || isSubmitting}
            />
            <Select
              label="Estado de Recipientes de Almacenamiento"
              value={containerStatus}
              onChange={(e) => setContainerStatus(e.target.value)}
              options={CONTAINER_STATUS_OPTIONS}
              disabled={!canEdit || isSubmitting}
            />
            <Select
              label="¿Mantiene los Recipientes Limpios?"
              value={containerClean ? 'true' : 'false'}
              onChange={(e) => setContainerClean(e.target.value === 'true')}
              options={[
                { value: 'true', label: 'Sí, limpios y desinfectados' },
                { value: 'false', label: 'No' },
              ]}
              disabled={!canEdit || isSubmitting}
            />
            <Select
              label="Tratamiento del Agua de Consumo"
              value={waterTreatment}
              onChange={(e) => setWaterTreatment(e.target.value)}
              options={WATER_TREATMENT_OPTIONS}
              disabled={!canEdit || isSubmitting}
            />
            <div className="sm:col-span-2">
              <Input
                label="Otros Detalles del Consumo de Agua"
                value={waterDetails}
                onChange={(e) => setWaterDetails(e.target.value)}
                disabled={!canEdit || isSubmitting}
                placeholder="Observaciones sobre almacenamiento, frecuencia o calidad"
              />
            </div>
          </div>
        </FormSection>
      </div>

      {/* 4. Higiene y Salud */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
        <FormSection stepNumber={4} title="Higiene y Salud Familiar">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Eliminación de Aguas Servidas"
              value={greywaterDisposal}
              onChange={(e) => setGreywaterDisposal(e.target.value)}
              options={GREYWATER_OPTIONS}
              disabled={!canEdit || isSubmitting}
            />
            <Select
              label="Eliminación de Basura"
              value={garbageDisposal}
              onChange={(e) => setGarbageDisposal(e.target.value)}
              options={GARBAGE_OPTIONS}
              disabled={!canEdit || isSubmitting}
            />
            <Select
              label="Estado de Higiene y Limpieza General"
              value={cleanlinessStatus}
              onChange={(e) => setCleanlinessStatus(e.target.value)}
              options={CLEANLINESS_OPTIONS}
              disabled={!canEdit || isSubmitting}
            />
            <Select
              label="Acción ante Problemas de Salud"
              value={healthCareAction}
              onChange={(e) => setHealthCareAction(e.target.value)}
              options={HEALTH_CARE_OPTIONS}
              disabled={!canEdit || isSubmitting}
            />
            <div className="sm:col-span-2">
              <Input
                label="Enfermedades Frecuentes en el Hogar"
                value={prevalentDiseases}
                onChange={(e) => setPrevalentDiseases(e.target.value)}
                disabled={!canEdit || isSubmitting}
                placeholder="Ej. Infecciones respiratorias agudas, diarreas en niños, parasitosis"
              />
            </div>
          </div>
        </FormSection>
      </div>

      {/* Actions */}
      {canEdit && (
        <div className="flex flex-wrap items-center justify-end gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
          <Button
            variant="primary"
            fullWidth={false}
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Diagnóstico Social'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SocialDiagnosisForm;
