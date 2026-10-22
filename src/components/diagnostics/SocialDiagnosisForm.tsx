import { useState, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { FormSection } from '../ui/FormSection';
import { DiagnosticPhotosManager } from './DiagnosticPhotosManager';
import { diagnosticService } from '../../services/diagnosticService';
import type {
  DiagnosticRecord,
  EvaluationQuestion,
  FamilyMember,
  SocialDiagnosticInput,
} from '../../types/diagnostic.types';
import type { ApplicationStatus, Person, PersonData } from '../../types/application.types';

interface SocialDiagnosisFormProps {
  applicationId: string;
  applicationStatus?: ApplicationStatus;
  defaultFormNo?: string | null;
  applicant?: Person | null;
  initialRecord: DiagnosticRecord | null;
  canEdit: boolean;
  onSaveSuccess: (record: DiagnosticRecord) => void;
}

const RELATIONSHIP_OPTIONS = [
  { value: 'Hijo(a)', label: 'Hijo(a)' },
  { value: 'Padre / Madre', label: 'Padre / Madre' },
  { value: 'Hermano(a)', label: 'Hermano(a)' },
  { value: 'Nieto(a)', label: 'Nieto(a)' },
  { value: 'Yerno / Nuera', label: 'Yerno / Nuera' },
  { value: 'Suegro(a)', label: 'Suegro(a)' },
  { value: 'Otro familiar', label: 'Otro familiar' },
];

const DOCUMENT_ISSUED_IN_OPTIONS = [
  { value: 'LP', label: 'LP - La Paz' },
  { value: 'CB', label: 'CB - Cochabamba' },
  { value: 'SC', label: 'SC - Santa Cruz' },
  { value: 'OR', label: 'OR - Oruro' },
  { value: 'PT', label: 'PT - Potosí' },
  { value: 'TJ', label: 'TJ - Tarija' },
  { value: 'CH', label: 'CH - Chuquisaca' },
  { value: 'BE', label: 'BE - Beni' },
  { value: 'PD', label: 'PD - Pando' },
  { value: 'CERTIFICADO DE NACIMIENTO', label: 'CERTIFICADO DE NACIMIENTO' },
];

const SEX_OPTIONS = [
  { value: 'M', label: 'M - Masculino' },
  { value: 'F', label: 'F - Femenino' },
];

const KNOWLEDGE_LEVEL_OPTIONS = ['MUY BIEN', 'BIEN', 'REGULAR'] as const;

function calculateAgeFromBirthDate(birthDate?: string | null): number | null {
  if (!birthDate) return null;
  const parts = birthDate.split('-').map(Number);
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) return null;
  const [y, m, d] = parts;
  const now = new Date();
  let age = now.getFullYear() - y;
  const monthDiff = now.getMonth() + 1 - m;
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < d)) {
    age -= 1;
  }
  return Math.max(0, age);
}

function buildPersonFullName(p: PersonData): string {
  return [p.givenNames, p.paternalSurname, p.maternalSurname].filter(Boolean).join(' ').trim();
}

function isHeadRelationship(rel?: string | null): boolean {
  return (
    rel === 'Solicitante' ||
    rel === 'Beneficiario' ||
    rel === 'Beneficiario(a)' ||
    rel === 'Jefe(a) de Hogar'
  );
}

function buildInitialFamilyMembers(
  initialRecord: DiagnosticRecord | null,
  applicant?: Person | null,
  applicationStatus?: ApplicationStatus,
): FamilyMember[] {
  const headLabel = applicationStatus === 'approved' ? 'Beneficiario' : 'Solicitante';
  const fixedMembers: FamilyMember[] = [];

  if (applicant) {
    const savedHead = initialRecord?.familyMembers?.find(
      (fm) => fm.personId === applicant.id || isHeadRelationship(fm.relationship),
    );
    fixedMembers.push({
      id: savedHead?.id,
      personId: applicant.id,
      relationship: headLabel,
      fullName: buildPersonFullName(applicant),
      documentNo: applicant.documentNo,
      documentIssuedIn: applicant.documentIssuedIn,
      sex: applicant.sex,
      birthDate: applicant.birthDate,
      age: calculateAgeFromBirthDate(applicant.birthDate),
      occupation: applicant.occupation ?? savedHead?.occupation ?? '',
      hasDisability: savedHead?.hasDisability ?? false,
      disabilityType: savedHead?.disabilityType ?? '',
      disabilityDocument: savedHead?.disabilityDocument ?? '',
    });

    if (applicant.spouse) {
      const savedSpouse = initialRecord?.familyMembers?.find(
        (fm) =>
          fm.personId === applicant.spouse?.id || fm.relationship === 'Cónyuge / Conviviente',
      );
      fixedMembers.push({
        id: savedSpouse?.id,
        personId: applicant.spouse.id,
        relationship: 'Cónyuge / Conviviente',
        fullName: buildPersonFullName(applicant.spouse),
        documentNo: applicant.spouse.documentNo,
        documentIssuedIn: applicant.spouse.documentIssuedIn,
        sex: applicant.spouse.sex,
        birthDate: applicant.spouse.birthDate,
        age: calculateAgeFromBirthDate(applicant.spouse.birthDate),
        occupation: applicant.spouse.occupation ?? savedSpouse?.occupation ?? '',
        hasDisability: savedSpouse?.hasDisability ?? false,
        disabilityType: savedSpouse?.disabilityType ?? '',
        disabilityDocument: savedSpouse?.disabilityDocument ?? '',
      });
    }
  }

  const extraMembers: FamilyMember[] = (initialRecord?.familyMembers ?? [])
    .filter((fm) => {
      if (applicant && (fm.personId === applicant.id || isHeadRelationship(fm.relationship))) {
        return false;
      }
      // Solo se omite si ya se precargó desde datos generales; si no, se muestra
      // para que no se pierda en silencio al guardar.
      if (applicant?.spouse && fm.relationship === 'Cónyuge / Conviviente') {
        return false;
      }
      return true;
    })
    .map((fm) => {
      const birthDate = fm.birthDate || '';
      const computedAge = calculateAgeFromBirthDate(birthDate) ?? fm.age ?? null;
      return {
        ...fm,
        personId: null,
        documentNo:
          fm.documentIssuedIn === 'CERTIFICADO DE NACIMIENTO' ? '' : (fm.documentNo ?? ''),
        documentIssuedIn: fm.documentIssuedIn ?? 'LP',
        sex: fm.sex ?? '',
        birthDate,
        age: computedAge,
        occupation: fm.occupation ?? '',
      };
    });

  if (fixedMembers.length > 0 || extraMembers.length > 0) {
    return [...fixedMembers, ...extraMembers];
  }

  return [];
}

const WATER_SOURCE_OTHER = 'OTROS';

const WATER_SOURCE_OPTIONS = [
  { value: 'VERTIENTE', label: 'VERTIENTE' },
  { value: 'ARROYO/QUEBRADA', label: 'ARROYO/QUEBRADA' },
  { value: 'COSECHA DE LLUVIA', label: 'COSECHA DE LLUVIA' },
  { value: 'PILETA PUBLICA', label: 'PILETA PÚBLICA' },
  { value: 'RIOS', label: 'RÍOS' },
  { value: 'RED PUBLICA', label: 'RED PÚBLICA' },
  { value: WATER_SOURCE_OTHER, label: 'OTROS' },
];

const CONTAINER_STATUS_OPTIONS = [
  { value: 'ESTAN CUBIERTOS', label: 'ESTÁN CUBIERTOS' },
  { value: 'ESTAN TAPADOS', label: 'ESTÁN TAPADOS' },
  { value: 'ESTAN LIMPIOS', label: 'ESTÁN LIMPIOS' },
  { value: 'MAS/MENOS LIMPIOS', label: 'MÁS/MENOS LIMPIOS' },
  { value: 'SUCIOS', label: 'SUCIOS' },
];

const WATER_TREATMENT_OPTIONS = [
  { value: 'FILTRAN EL AGUA', label: 'FILTRAN EL AGUA' },
  { value: 'HIERVEN EL AGUA', label: 'HIERVEN EL AGUA' },
  { value: 'CLORAN', label: 'CLORAN' },
];

/** Descarta valores guardados con el catálogo anterior para no reenviarlos. */
const optionOrEmpty = (options: { value: string }[], value?: string | null) =>
  value && options.some((o) => o.value === value) ? value : '';

const GREYWATER_OPTIONS = [
  { value: 'PATIO DE CASA', label: 'PATIO DE CASA' },
  { value: 'CAMPO ABIERTO', label: 'CAMPO ABIERTO' },
  { value: 'RIO O ACEQUIA', label: 'RÍO O ACEQUIA' },
];

const GARBAGE_OPTIONS = [
  { value: 'PATIO DE LA CASA', label: 'PATIO DE LA CASA' },
  { value: 'CAMPO ABIERTO', label: 'CAMPO ABIERTO' },
  { value: 'EN EL RIO', label: 'EN EL RÍO' },
  { value: 'CARRO BASURERO', label: 'CARRO BASURERO' },
  { value: 'LA ENTIERRAN', label: 'LA ENTIERRAN' },
];

/** Mismas opciones para los ambientes (dormitorios y cocina) y para el patio. */
const CLEANLINESS_OPTIONS = [
  { value: 'LIMPIO', label: 'LIMPIO' },
  { value: 'SUCIO CON BASURA', label: 'SUCIO CON BASURA' },
  { value: 'SUCIO CON HECES Y BASURA', label: 'SUCIO CON HECES Y BASURA' },
];

const PREVALENT_DISEASE_OPTIONS = [
  { value: 'DOLOR DE BARRIGA', label: 'DOLOR DE BARRIGA' },
  { value: 'DIARREA O VOMITOS', label: 'DIARREA O VÓMITOS' },
  { value: 'PARASITOS INTESTINALES', label: 'PARÁSITOS INTESTINALES' },
  { value: 'RASCA O SARNA', label: 'RASCA O SARNA' },
  { value: 'ENFERMEDADES RESPIRATORIAS', label: 'ENFERMEDADES RESPIRATORIAS' },
  { value: 'ENFERMEDADES OCULARES', label: 'ENFERMEDADES OCULARES' },
];

const HEALTH_CARE_OPTIONS = [
  { value: 'NADA HASTA QUE SE LE PASE', label: 'NADA HASTA QUE SE LE PASE' },
  { value: 'PREPARAN REMEDIO CASERO', label: 'PREPARAN REMEDIO CASERO' },
  { value: 'ACUDEN A LA MEDICINA TRADICIONAL', label: 'ACUDEN A LA MEDICINA TRADICIONAL' },
  { value: 'LO(S) LLEVAN AL MEDICO DEL CENTRO DE SALUD', label: 'LO(S) LLEVAN AL MÉDICO DEL CENTRO DE SALUD' },
];

export const SocialDiagnosisForm = ({
  applicationId,
  applicationStatus,
  defaultFormNo,
  applicant,
  initialRecord,
  canEdit,
  onSaveSuccess,
}: SocialDiagnosisFormProps) => {
  const formNo = initialRecord?.formNo ?? defaultFormNo ?? '';
  const headRoleLabel = applicationStatus === 'approved' ? 'Beneficiario' : 'Solicitante';

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() =>
    buildInitialFamilyMembers(initialRecord, applicant, applicationStatus),
  );

  useEffect(() => {
    setFamilyMembers((prev) =>
      prev.map((fm, idx) =>
        idx === 0 && (fm.personId === applicant?.id || isHeadRelationship(fm.relationship))
          ? { ...fm, relationship: headRoleLabel }
          : fm,
      ),
    );
  }, [headRoleLabel, applicant?.id]);

  const createEmptyDraftMember = (): FamilyMember => ({
    personId: null,
    fullName: '',
    relationship: 'Hijo(a)',
    documentNo: '',
    documentIssuedIn: 'LP',
    sex: '',
    birthDate: '',
    age: null,
    occupation: '',
    hasDisability: false,
    disabilityType: '',
    disabilityDocument: '',
  });

  const [draftMember, setDraftMember] = useState<FamilyMember>(createEmptyDraftMember);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [memberFormError, setMemberFormError] = useState<string | null>(null);

  const [questions, setQuestions] = useState<EvaluationQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, { answerBoolean: boolean | null; score: string }>>(
    () => {
      const initialMap: Record<number, { answerBoolean: boolean | null; score: string }> = {};
      if (initialRecord?.answers) {
        for (const ans of initialRecord.answers) {
          const validScore =
            ans.answerBoolean === true &&
            KNOWLEDGE_LEVEL_OPTIONS.includes(ans.score as (typeof KNOWLEDGE_LEVEL_OPTIONS)[number])
              ? (ans.score ?? '')
              : '';
          initialMap[ans.evaluationQuestionId] = {
            answerBoolean: ans.answerBoolean ?? null,
            score: validScore,
          };
        }
      }
      return initialMap;
    },
  );

  const [constructionKnowledgeObservations, setConstructionKnowledgeObservations] = useState(
    initialRecord?.constructionKnowledgeObservations ?? '',
  );

  const [waterSource, setWaterSource] = useState(
    optionOrEmpty(WATER_SOURCE_OPTIONS, initialRecord?.waterHabits?.waterSource),
  );
  const [waterSourceOther, setWaterSourceOther] = useState(initialRecord?.waterHabits?.waterSourceOther ?? '');
  const [containerClean, setContainerClean] = useState<boolean | null>(
    initialRecord?.waterHabits?.containerClean ?? null,
  );
  const [containerStatus, setContainerStatus] = useState(
    optionOrEmpty(CONTAINER_STATUS_OPTIONS, initialRecord?.waterHabits?.containerStatus),
  );
  const [waterTreatment, setWaterTreatment] = useState(
    optionOrEmpty(WATER_TREATMENT_OPTIONS, initialRecord?.waterHabits?.waterTreatment),
  );
  const [waterDetails, setWaterDetails] = useState(initialRecord?.waterHabits?.otherDetails ?? '');

  const [greywaterDisposal, setGreywaterDisposal] = useState(
    optionOrEmpty(GREYWATER_OPTIONS, initialRecord?.hygiene?.greywaterDisposal),
  );
  const [garbageDisposal, setGarbageDisposal] = useState(
    optionOrEmpty(GARBAGE_OPTIONS, initialRecord?.hygiene?.garbageDisposal),
  );
  const [roomsCleanlinessStatus, setRoomsCleanlinessStatus] = useState(
    optionOrEmpty(CLEANLINESS_OPTIONS, initialRecord?.hygiene?.roomsCleanlinessStatus),
  );
  const [yardCleanlinessStatus, setYardCleanlinessStatus] = useState(
    optionOrEmpty(CLEANLINESS_OPTIONS, initialRecord?.hygiene?.yardCleanlinessStatus),
  );

  const [prevalentDiseases, setPrevalentDiseases] = useState(
    optionOrEmpty(PREVALENT_DISEASE_OPTIONS, initialRecord?.health?.prevalentDiseases),
  );
  const [healthCareAction, setHealthCareAction] = useState(
    optionOrEmpty(HEALTH_CARE_OPTIONS, initialRecord?.health?.healthCareAction),
  );

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

  const handleDraftChange = <K extends keyof FamilyMember>(
    field: K,
    value: FamilyMember[K],
  ) => {
    setMemberFormError(null);
    setDraftMember((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDraftMember = () => {
    if (!draftMember.fullName.trim()) {
      setMemberFormError('Ingrese el nombre completo del integrante antes de agregarlo a la lista.');
      return;
    }
    setMemberFormError(null);

    const normalizedMember: FamilyMember = {
      ...draftMember,
      fullName: draftMember.fullName.trim(),
      documentNo:
        draftMember.documentIssuedIn === 'CERTIFICADO DE NACIMIENTO'
          ? ''
          : (draftMember.documentNo?.trim() ?? ''),
      age: calculateAgeFromBirthDate(draftMember.birthDate) ?? draftMember.age ?? null,
      occupation: draftMember.occupation?.trim() ?? '',
      disabilityType: draftMember.hasDisability ? (draftMember.disabilityType?.trim() ?? '') : '',
      disabilityDocument: draftMember.hasDisability
        ? (draftMember.disabilityDocument?.trim() ?? '')
        : '',
    };

    if (editingIndex !== null) {
      setFamilyMembers((prev) => {
        const copy = [...prev];
        copy[editingIndex] = normalizedMember;
        return copy;
      });
      setEditingIndex(null);
    } else {
      setFamilyMembers((prev) => [...prev, normalizedMember]);
    }

    setDraftMember(createEmptyDraftMember());
  };

  const handleEditMember = (index: number) => {
    const target = familyMembers[index];
    if (!target) return;
    setMemberFormError(null);
    setEditingIndex(index);
    setDraftMember({
      ...target,
      documentIssuedIn: target.documentIssuedIn ?? 'LP',
      documentNo: target.documentNo ?? '',
      sex: target.sex ?? '',
      birthDate: target.birthDate ?? '',
      occupation: target.occupation ?? '',
      disabilityType: target.disabilityType ?? '',
      disabilityDocument: target.disabilityDocument ?? '',
    });
  };

  const handleCancelEditMember = () => {
    setMemberFormError(null);
    setEditingIndex(null);
    setDraftMember(createEmptyDraftMember());
  };

  const handleRemoveMember = (index: number) => {
    setFamilyMembers((prev) => prev.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setDraftMember(createEmptyDraftMember());
    } else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex(editingIndex - 1);
    }
  };

  const handleAnswerChange = (questionId: number, answerBoolean: boolean | null) => {
    setAnswers((prev) => {
      const currentScore = prev[questionId]?.score ?? '';
      return {
        ...prev,
        [questionId]: {
          answerBoolean,
          score: answerBoolean === true ? currentScore : '',
        },
      };
    });
  };

  const handleScoreChange = (questionId: number, score: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        answerBoolean: true,
        score,
      },
    }));
  };

  const handleSubmit = async (isCompleted: boolean) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const missingGradeQuestion = questions.find((q) => {
      const ans = answers[q.id];
      return (
        ans?.answerBoolean === true &&
        !KNOWLEDGE_LEVEL_OPTIONS.includes(ans.score as (typeof KNOWLEDGE_LEVEL_OPTIONS)[number])
      );
    });

    if (missingGradeQuestion) {
      setErrorMessage(
        `Debe seleccionar el grado de conocimiento (MUY BIEN, BIEN o REGULAR) para: "${missingGradeQuestion.questionText}".`,
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const answersPayload = Object.entries(answers).map(([qId, val]) => ({
        evaluationQuestionId: Number(qId),
        answerBoolean: val.answerBoolean,
        score: val.answerBoolean === true ? val.score || null : null,
      }));

      let membersToSave = [...familyMembers];
      if (draftMember.fullName.trim() !== '') {
        const pendingMember: FamilyMember = {
          ...draftMember,
          fullName: draftMember.fullName.trim(),
          documentNo:
            draftMember.documentIssuedIn === 'CERTIFICADO DE NACIMIENTO'
              ? ''
              : (draftMember.documentNo?.trim() ?? ''),
          age: calculateAgeFromBirthDate(draftMember.birthDate) ?? draftMember.age ?? null,
          occupation: draftMember.occupation?.trim() ?? '',
          disabilityType: draftMember.hasDisability
            ? (draftMember.disabilityType?.trim() ?? '')
            : '',
          disabilityDocument: draftMember.hasDisability
            ? (draftMember.disabilityDocument?.trim() ?? '')
            : '',
        };
        if (editingIndex !== null) {
          membersToSave[editingIndex] = pendingMember;
        } else {
          membersToSave.push(pendingMember);
        }
        setFamilyMembers(membersToSave);
        setEditingIndex(null);
        setDraftMember(createEmptyDraftMember());
      }

      const payload: SocialDiagnosticInput = {
        formNo: formNo.trim() || null,
        evaluationDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`,
        isCompleted,
        familyMembers: membersToSave.filter((m) => m.fullName.trim() !== ''),
        answers: answersPayload,
        constructionKnowledgeObservations: constructionKnowledgeObservations.trim() || null,
        waterHabits: {
          waterSource: waterSource || null,
          waterSourceOther: waterSource === WATER_SOURCE_OTHER ? waterSourceOther.trim() || null : null,
          containerClean,
          containerStatus: containerStatus || null,
          waterTreatment: waterTreatment || null,
          otherDetails: waterDetails.trim() || null,
        },
        hygiene: {
          greywaterDisposal: greywaterDisposal || null,
          garbageDisposal: garbageDisposal || null,
          roomsCleanlinessStatus: roomsCleanlinessStatus || null,
          yardCleanlinessStatus: yardCleanlinessStatus || null,
        },
        health: {
          prevalentDiseases: prevalentDiseases || null,
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
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
        <FormSection stepNumber={1} title="Composición del Grupo Familiar" withDivider={false}>
          <p className="mb-4 text-sm text-gray-500">
            Lista del grupo familiar que reside en la vivienda. El {headRoleLabel} y Cónyuge (si corresponde) se muestran precargados en la tabla.
          </p>

          {/* Tabla tipo Excel con los miembros registrados */}
          <div className="overflow-x-auto rounded-xl border border-gray-300 shadow-2xs">
            <table className="min-w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-800 text-[11px] font-bold tracking-wider text-white uppercase">
                  <th className="border border-slate-700 px-2.5 py-2 text-center">#</th>
                  <th className="border border-slate-700 px-3 py-2">Parentesco</th>
                  <th className="border border-slate-700 px-3 py-2">Nombre Completo</th>
                  <th className="border border-slate-700 px-3 py-2">Doc. Registro</th>
                  <th className="border border-slate-700 px-2.5 py-2 text-center">Sexo</th>
                  <th className="border border-slate-700 px-3 py-2 text-center">Fecha Nac.</th>
                  <th className="border border-slate-700 px-2.5 py-2 text-center">Edad</th>
                  <th className="border border-slate-700 px-3 py-2">Ocupación</th>
                  <th className="border border-slate-700 px-3 py-2">Discapacidad</th>
                  {canEdit && (
                    <th className="border border-slate-700 px-3 py-2 text-center">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {familyMembers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={canEdit ? 10 : 9}
                      className="border border-gray-200 bg-gray-50 px-4 py-6 text-center text-xs text-gray-500"
                    >
                      No hay integrantes registrados en la lista.
                    </td>
                  </tr>
                ) : (
                  familyMembers.map((member, index) => {
                    const isFixedFromGeneralData =
                      Boolean(member.personId) ||
                      isHeadRelationship(member.relationship) ||
                      (Boolean(applicant?.spouse) && member.relationship === 'Cónyuge / Conviviente');
                    const memberAge =
                      calculateAgeFromBirthDate(member.birthDate) ?? member.age ?? null;
                    const isCertNac =
                      member.documentIssuedIn === 'CERTIFICADO DE NACIMIENTO';
                    const docDisplay = isCertNac
                      ? 'CERTIFICADO DE NACIMIENTO'
                      : [member.documentNo, member.documentIssuedIn].filter(Boolean).join(' ');
                    const isBeingEdited = editingIndex === index;

                    return (
                      <tr
                        key={index}
                        className={
                          isFixedFromGeneralData
                            ? 'bg-purple-100/80'
                            : isBeingEdited
                              ? 'bg-amber-100/80 font-medium'
                              : 'bg-white hover:bg-sky-50/60'
                        }
                      >
                        <td className="border border-gray-300 px-2.5 py-2 text-center font-bold text-gray-800">
                          {index + 1}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 font-semibold text-gray-900">
                          {member.relationship || '—'}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 font-medium text-gray-900">
                          {member.fullName || '—'}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 font-mono text-gray-800">
                          {docDisplay || '—'}
                        </td>
                        <td className="border border-gray-300 px-2.5 py-2 text-center font-bold text-gray-800">
                          {member.sex || '—'}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-center text-gray-800">
                          {member.birthDate || '—'}
                        </td>
                        <td className="border border-gray-300 px-2.5 py-2 text-center font-bold text-purple-950">
                          {memberAge !== null ? `${memberAge} años` : '—'}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-gray-800">
                          {member.occupation || '—'}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-gray-800">
                          {member.hasDisability ? (
                            <span className="inline-flex flex-col">
                              <span className="font-bold text-rose-700">
                                Sí{member.disabilityType ? `: ${member.disabilityType}` : ''}
                              </span>
                              {member.disabilityDocument && (
                                <span className="text-[10px] text-gray-600">
                                  Doc: {member.disabilityDocument}
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-gray-500">No</span>
                          )}
                        </td>
                        {canEdit && (
                          <td className="border border-gray-300 px-2.5 py-2 text-center whitespace-nowrap">
                            {isFixedFromGeneralData ? (
                              <span className="text-[11px] font-medium text-purple-800/80 italic">
                                Datos Generales
                              </span>
                            ) : (
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEditMember(index)}
                                  disabled={isSubmitting}
                                  className="rounded bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100"
                                >
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMember(index)}
                                  disabled={isSubmitting}
                                  className="rounded bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100"
                                >
                                  Quitar
                                </button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Formulario limpio para agregar (o editar) un miembro familiar */}
          {canEdit && (
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50/70 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-2">
                <h4 className="text-xs font-bold tracking-wide text-gray-800 uppercase">
                  {editingIndex !== null
                    ? `Editando Integrante #${editingIndex + 1} de la Tabla`
                    : 'Agregar Nuevo Miembro a la Lista Familiar'}
                </h4>
                {editingIndex !== null && (
                  <button
                    type="button"
                    onClick={handleCancelEditMember}
                    className="text-xs font-semibold text-gray-600 hover:text-gray-900"
                  >
                    Cancelar edición
                  </button>
                )}
              </div>

              {memberFormError && (
                <div className="mb-3">
                  <Alert severity="warning">{memberFormError}</Alert>
                </div>
              )}

              {(() => {
                const isCertificadoNacimiento =
                  draftMember.documentIssuedIn === 'CERTIFICADO DE NACIMIENTO';
                const draftCalculatedAge =
                  calculateAgeFromBirthDate(draftMember.birthDate) ?? draftMember.age ?? null;

                return (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
                    {/* 1. PARENTESCO */}
                    <div className="rounded-xl border border-purple-200 bg-purple-100/70 p-2.5 shadow-2xs lg:col-span-2 [&_.MuiOutlinedInput-root]:bg-white/90">
                      <Select
                        label="Parentesco"
                        value={draftMember.relationship}
                        onChange={(e) => handleDraftChange('relationship', e.target.value)}
                        options={RELATIONSHIP_OPTIONS}
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* 2. NOMBRE COMPLETO */}
                    <div className="rounded-xl border border-sky-200 bg-sky-100/70 p-2.5 shadow-2xs lg:col-span-3 [&_.MuiOutlinedInput-root]:bg-white/90">
                      <Input
                        label="Nombre Completo"
                        value={draftMember.fullName}
                        onChange={(e) => handleDraftChange('fullName', e.target.value)}
                        disabled={isSubmitting}
                        placeholder="Nombres y apellidos"
                      />
                    </div>

                    {/* 3. DOC. REGISTRO */}
                    <div className="rounded-xl border border-purple-200 bg-purple-100/70 p-2.5 shadow-2xs lg:col-span-3 [&_.MuiOutlinedInput-root]:bg-white/90">
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <Select
                          label="Expedido / Tipo Doc."
                          value={draftMember.documentIssuedIn ?? 'LP'}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleDraftChange('documentIssuedIn', val);
                            if (val === 'CERTIFICADO DE NACIMIENTO') {
                              handleDraftChange('documentNo', '');
                            }
                          }}
                          options={DOCUMENT_ISSUED_IN_OPTIONS}
                          disabled={isSubmitting}
                        />
                        <Input
                          label="Doc. Registro (C.I.)"
                          value={isCertificadoNacimiento ? '' : (draftMember.documentNo ?? '')}
                          onChange={(e) => handleDraftChange('documentNo', e.target.value)}
                          disabled={isSubmitting || isCertificadoNacimiento}
                          placeholder={isCertificadoNacimiento ? 'Sin C.I. (Cert. Nac.)' : 'Ej. 10086482'}
                        />
                      </div>
                    </div>

                    {/* 4. SEXO */}
                    <div className="rounded-xl border border-sky-200 bg-sky-100/70 p-2.5 shadow-2xs lg:col-span-1 [&_.MuiOutlinedInput-root]:bg-white/90">
                      <Select
                        label="Sexo"
                        value={draftMember.sex ?? ''}
                        onChange={(e) => handleDraftChange('sex', e.target.value)}
                        options={SEX_OPTIONS}
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* 5. FECHA DE NACIMIENTO + EDAD AUTOMÁTICA */}
                    <div className="rounded-xl border border-purple-200 bg-purple-100/70 p-2.5 shadow-2xs lg:col-span-3 [&_.MuiOutlinedInput-root]:bg-white/90">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <Input
                            label="Fecha de Nacimiento"
                            type="date"
                            value={draftMember.birthDate ?? ''}
                            onChange={(e) => {
                              const newBirth = e.target.value;
                              handleDraftChange('birthDate', newBirth);
                              handleDraftChange('age', calculateAgeFromBirthDate(newBirth));
                            }}
                            disabled={isSubmitting}
                          />
                        </div>
                        <div className="col-span-1 flex flex-col justify-center rounded-lg border border-purple-200 bg-white/90 px-2 py-1 text-center">
                          <span className="text-[10px] font-bold tracking-wider text-purple-900 uppercase">
                            Edad
                          </span>
                          <span className="text-sm font-extrabold text-gray-900">
                            {draftCalculatedAge !== null ? `${draftCalculatedAge} años` : '—'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 6. OCUPACIÓN + DISCAPACIDAD */}
                    <div className="rounded-xl border border-sky-200 bg-sky-100/70 p-2.5 shadow-2xs lg:col-span-4 [&_.MuiOutlinedInput-root]:bg-white/90">
                      <Input
                        label="Ocupación / Oficio"
                        value={draftMember.occupation ?? ''}
                        onChange={(e) => handleDraftChange('occupation', e.target.value)}
                        disabled={isSubmitting}
                        placeholder="Ej. Albañil, Comerciante, Estudiante"
                      />
                    </div>

                    <div className="rounded-xl border border-purple-200 bg-purple-100/70 p-2.5 shadow-2xs lg:col-span-3 [&_.MuiOutlinedInput-root]:bg-white/90">
                      <Select
                        label="¿Tiene Discapacidad?"
                        value={draftMember.hasDisability ? 'true' : 'false'}
                        onChange={(e) => {
                          const hasDis = e.target.value === 'true';
                          handleDraftChange('hasDisability', hasDis);
                          if (!hasDis) {
                            handleDraftChange('disabilityType', '');
                            handleDraftChange('disabilityDocument', '');
                          }
                        }}
                        options={[
                          { value: 'false', label: 'No' },
                          { value: 'true', label: 'Sí' },
                        ]}
                        disabled={isSubmitting}
                      />
                    </div>

                    {draftMember.hasDisability && (
                      <>
                        <div className="rounded-xl border border-sky-200 bg-sky-100/70 p-2.5 shadow-2xs lg:col-span-3 [&_.MuiOutlinedInput-root]:bg-white/90">
                          <Input
                            label="Tipo de Discapacidad"
                            value={draftMember.disabilityType ?? ''}
                            onChange={(e) => handleDraftChange('disabilityType', e.target.value)}
                            disabled={isSubmitting}
                            placeholder="Física, Auditiva, etc."
                          />
                        </div>
                        <div className="rounded-xl border border-purple-200 bg-purple-100/70 p-2.5 shadow-2xs lg:col-span-2 [&_.MuiOutlinedInput-root]:bg-white/90">
                          <Input
                            label="Doc. Discapacidad"
                            value={draftMember.disabilityDocument ?? ''}
                            onChange={(e) =>
                              handleDraftChange('disabilityDocument', e.target.value)
                            }
                            disabled={isSubmitting}
                            placeholder="N° Carnet CONALPEDIS"
                          />
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}

              <div className="mt-3 flex justify-end gap-2">
                {editingIndex !== null && (
                  <Button
                    variant="outline"
                    fullWidth={false}
                    onClick={handleCancelEditMember}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                )}
                <Button
                  variant="outline"
                  fullWidth={false}
                  onClick={handleSaveDraftMember}
                  disabled={isSubmitting}
                >
                  {editingIndex !== null ? 'Actualizar Miembro en la Lista' : '+ Agregar Miembro'}
                </Button>
              </div>
            </div>
          )}
        </FormSection>
      </div>

      {/* 2. Hábitos y Consumo de Agua */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
        <FormSection stepNumber={2} title="Uso y Consumo de Agua">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <div className="space-y-3 rounded-xl border border-purple-200 bg-purple-100/70 p-3 shadow-2xs [&_.MuiOutlinedInput-root]:bg-white/90">
              <p className="text-sm font-medium text-gray-800">
                ¿Cuál es la fuente de procedencia principal de abastecimiento de agua?
              </p>
              <Select
                label="Fuente de agua"
                value={waterSource}
                onChange={(e) => setWaterSource(e.target.value)}
                options={WATER_SOURCE_OPTIONS}
                placeholder="Seleccione una opción"
                disabled={!canEdit || isSubmitting}
              />
              {waterSource === WATER_SOURCE_OTHER && (
                <Input
                  label="Especifique la otra fuente"
                  value={waterSourceOther}
                  onChange={(e) => setWaterSourceOther(e.target.value)}
                  disabled={!canEdit || isSubmitting}
                  maxLength={150}
                  placeholder="Ej. Pozo, carro cisterna..."
                />
              )}
            </div>
            <div className="space-y-3 rounded-xl border border-sky-200 bg-sky-100/70 p-3 shadow-2xs [&_.MuiOutlinedInput-root]:bg-white/90">
              <p className="text-sm font-medium text-gray-800">
                ¿El o los recipientes de agua están ubicados en lugar limpio?{' '}
                <span className="text-xs font-semibold text-gray-500">(OBSERVAR)</span>
              </p>
              <div className="inline-flex items-center gap-1.5">
                {[
                  { value: true, label: 'SI' },
                  { value: false, label: 'NO' },
                ].map((opt) => {
                  const isSelected = containerClean === opt.value;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      disabled={!canEdit || isSubmitting}
                      onClick={() => setContainerClean(opt.value)}
                      className={`min-w-[44px] rounded-full border px-3 py-1 text-xs font-bold transition ${
                        isSelected
                          ? opt.value
                            ? 'border-sky-700 bg-sky-600 text-white shadow-2xs ring-2 ring-sky-200'
                            : 'border-slate-700 bg-slate-700 text-white shadow-2xs ring-2 ring-slate-200'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              <Select
                label="Estado de los recipientes"
                value={containerStatus}
                onChange={(e) => setContainerStatus(e.target.value)}
                options={CONTAINER_STATUS_OPTIONS}
                placeholder="Seleccione una opción"
                disabled={!canEdit || isSubmitting}
              />
            </div>
            <div className="space-y-3 rounded-xl border border-purple-200 bg-purple-100/70 p-3 shadow-2xs [&_.MuiOutlinedInput-root]:bg-white/90">
              <p className="text-sm font-medium text-gray-800">
                ¿Su familia antes de tomar agua realiza alguna forma de tratamiento o desinfección?
              </p>
              <Select
                label="Tratamiento o desinfección"
                value={waterTreatment}
                onChange={(e) => setWaterTreatment(e.target.value)}
                options={WATER_TREATMENT_OPTIONS}
                placeholder="Seleccione una opción"
                disabled={!canEdit || isSubmitting}
              />
            </div>
            <div className="lg:col-span-3 rounded-xl border border-sky-200 bg-sky-100/70 p-3 shadow-2xs [&_.MuiOutlinedInput-root]:bg-white/90">
              <Input
                label="Observaciones"
                value={waterDetails}
                onChange={(e) => setWaterDetails(e.target.value)}
                disabled={!canEdit || isSubmitting}
                maxLength={255}
                placeholder="Observaciones sobre el uso y consumo de agua..."
              />
            </div>
          </div>
        </FormSection>
      </div>

      {/* 3. Higiene y Salud */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
        <FormSection stepNumber={3} title="Higiene y Salud Familiar">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-600">Higiene de la vivienda</h4>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="space-y-3 rounded-xl border border-purple-200 bg-purple-100/70 p-3 shadow-2xs [&_.MuiOutlinedInput-root]:bg-white/90">
              <p className="text-sm font-medium text-gray-800">
                ¿Dónde echan las aguas grises?{' '}
                <span className="text-xs font-semibold text-gray-500">(Agua del lavado de ropa y utensilios)</span>
              </p>
              <Select
                label="Aguas grises"
                value={greywaterDisposal}
                onChange={(e) => setGreywaterDisposal(e.target.value)}
                options={GREYWATER_OPTIONS}
                placeholder="Seleccione una opción"
                disabled={!canEdit || isSubmitting}
              />
            </div>
            <div className="space-y-3 rounded-xl border border-sky-200 bg-sky-100/70 p-3 shadow-2xs [&_.MuiOutlinedInput-root]:bg-white/90">
              <p className="text-sm font-medium text-gray-800">
                ¿Cómo se elimina la basura de su vivienda habitualmente?
              </p>
              <Select
                label="Eliminación de basura"
                value={garbageDisposal}
                onChange={(e) => setGarbageDisposal(e.target.value)}
                options={GARBAGE_OPTIONS}
                placeholder="Seleccione una opción"
                disabled={!canEdit || isSubmitting}
              />
            </div>
            <div className="space-y-3 rounded-xl border border-purple-200 bg-purple-100/70 p-3 shadow-2xs [&_.MuiOutlinedInput-root]:bg-white/90">
              <p className="text-sm font-medium text-gray-800">
                ¿En qué estado se encuentran los ambientes de la vivienda (dormitorios y cocina)?{' '}
                <span className="text-xs font-semibold text-gray-500">(OBSERVE Y REGISTRE)</span>
              </p>
              <Select
                label="Estado de los ambientes"
                value={roomsCleanlinessStatus}
                onChange={(e) => setRoomsCleanlinessStatus(e.target.value)}
                options={CLEANLINESS_OPTIONS}
                placeholder="Seleccione una opción"
                disabled={!canEdit || isSubmitting}
              />
            </div>
            <div className="space-y-3 rounded-xl border border-sky-200 bg-sky-100/70 p-3 shadow-2xs [&_.MuiOutlinedInput-root]:bg-white/90">
              <p className="text-sm font-medium text-gray-800">
                ¿En qué estado se encuentra el patio de la casa?{' '}
                <span className="text-xs font-semibold text-gray-500">(OBSERVE Y REGISTRE)</span>
              </p>
              <Select
                label="Estado del patio"
                value={yardCleanlinessStatus}
                onChange={(e) => setYardCleanlinessStatus(e.target.value)}
                options={CLEANLINESS_OPTIONS}
                placeholder="Seleccione una opción"
                disabled={!canEdit || isSubmitting}
              />
            </div>
          </div>

          <h4 className="mt-6 mb-3 text-xs font-bold uppercase tracking-wide text-gray-600">Aspecto salud</h4>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="space-y-3 rounded-xl border border-purple-200 bg-purple-100/70 p-3 shadow-2xs [&_.MuiOutlinedInput-root]:bg-white/90">
              <p className="text-sm font-medium text-gray-800">
                ¿Cuál de estas enfermedades se manifiestan más en sus hijos?
              </p>
              <Select
                label="Enfermedad más frecuente"
                value={prevalentDiseases}
                onChange={(e) => setPrevalentDiseases(e.target.value)}
                options={PREVALENT_DISEASE_OPTIONS}
                placeholder="Seleccione una opción"
                disabled={!canEdit || isSubmitting}
              />
            </div>
            <div className="space-y-3 rounded-xl border border-sky-200 bg-sky-100/70 p-3 shadow-2xs [&_.MuiOutlinedInput-root]:bg-white/90">
              <p className="text-sm font-medium text-gray-800">
                ¿Cuándo alguno de los niños(as) se enferman, qué hacen?
              </p>
              <Select
                label="Acción ante la enfermedad"
                value={healthCareAction}
                onChange={(e) => setHealthCareAction(e.target.value)}
                options={HEALTH_CARE_OPTIONS}
                placeholder="Seleccione una opción"
                disabled={!canEdit || isSubmitting}
              />
            </div>
          </div>
        </FormSection>
      </div>

      {/* 4. Nivel de Conocimiento acerca de Construcción de Viviendas */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
        <FormSection
          stepNumber={4}
          title={`Nivel de Conocimiento del ${headRoleLabel} acerca de Construcción de Viviendas`}
        >
          <p className="mb-4 text-sm text-gray-500">
            ¿Conoce de construcción? Seleccione <strong>SÍ</strong> o <strong>NO</strong>. En caso que la respuesta sea{' '}
            <strong>SÍ</strong>, indique el grado de conocimiento (<strong>MUY BIEN</strong>, <strong>BIEN</strong> o{' '}
            <strong>REGULAR</strong>).
          </p>

          {isLoadingQuestions ? (
            <p className="py-4 text-sm text-gray-400">Cargando cuestionario...</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-300 shadow-2xs">
              <table className="min-w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-800 text-[11px] font-bold tracking-wider text-white uppercase">
                    <th className="border border-slate-700 px-3.5 py-2.5">
                      Ítem de Construcción
                    </th>
                    <th className="w-36 border border-slate-700 px-3 py-2.5 text-center">
                      ¿Conoce? (SÍ / NO)
                    </th>
                    <th className="border border-slate-700 px-3 py-2.5 text-center">
                      Grado de Conocimiento (Si responde SÍ)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q) => {
                    const ans = answers[q.id];
                    const isYes = ans?.answerBoolean === true;
                    const isNo = ans?.answerBoolean === false;

                    return (
                      <tr
                        key={q.id}
                        className={
                          isYes
                            ? 'bg-sky-50/70'
                            : 'bg-white hover:bg-gray-50/70'
                        }
                      >
                        <td className="border border-gray-300 px-3.5 py-2 font-semibold text-gray-900">
                          {q.questionText}
                        </td>

                        {/* Columna SI / NO */}
                        <td className="border border-gray-300 px-3 py-2 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={!canEdit || isSubmitting}
                              onClick={() => handleAnswerChange(q.id, true)}
                              className={`min-w-[44px] rounded-full border px-3 py-1 text-xs font-bold transition ${
                                isYes
                                  ? 'border-sky-700 bg-sky-600 text-white shadow-2xs ring-2 ring-sky-200'
                                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                              } disabled:cursor-not-allowed disabled:opacity-60`}
                            >
                              SI
                            </button>
                            <button
                              type="button"
                              disabled={!canEdit || isSubmitting}
                              onClick={() => handleAnswerChange(q.id, false)}
                              className={`min-w-[44px] rounded-full border px-3 py-1 text-xs font-bold transition ${
                                isNo
                                  ? 'border-slate-700 bg-slate-700 text-white shadow-2xs ring-2 ring-slate-200'
                                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                              } disabled:cursor-not-allowed disabled:opacity-60`}
                            >
                              NO
                            </button>
                          </div>
                        </td>

                        {/* Columna MUY BIEN | BIEN | REGULAR */}
                        <td className="border border-gray-300 px-3 py-2">
                          <div className="grid grid-cols-3 gap-2">
                            {KNOWLEDGE_LEVEL_OPTIONS.map((level) => {
                              const isSelected = isYes && ans?.score === level;
                              return (
                                <button
                                  key={level}
                                  type="button"
                                  disabled={!canEdit || isSubmitting || !isYes}
                                  onClick={() => handleScoreChange(q.id, level)}
                                  className={`rounded-full border px-2.5 py-1 text-center text-[11px] font-bold transition ${
                                    isSelected
                                      ? 'border-purple-700 bg-purple-600 text-white shadow-2xs ring-2 ring-purple-200'
                                      : isYes
                                        ? 'border-purple-200 bg-white text-gray-800 hover:bg-purple-50'
                                        : 'border-gray-200 bg-gray-100 text-gray-400'
                                  } disabled:cursor-not-allowed`}
                                >
                                  {level}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 rounded-xl border border-purple-200 bg-purple-100/70 p-3 shadow-2xs [&_.MuiOutlinedInput-root]:bg-white/90">
            <Input
              label="Observaciones"
              value={constructionKnowledgeObservations}
              onChange={(e) => setConstructionKnowledgeObservations(e.target.value)}
              disabled={!canEdit || isSubmitting}
              placeholder="Observaciones generales sobre el conocimiento en construcción del solicitante..."
            />
          </div>
        </FormSection>
      </div>

      {/* 5. Fotografías */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
        <FormSection stepNumber={5} title="Fotografías">
          <p className="mb-4 text-sm text-gray-500">
            Registre la <strong>FOTOGRAFÍA DEL CONJUNTO</strong> y la{' '}
            <strong>FOTOGRAFÍA DEL {headRoleLabel.toUpperCase()}</strong>.
          </p>

          <DiagnosticPhotosManager
            applicationId={applicationId}
            category="social"
            initialPhotos={initialRecord?.photos ?? []}
            canEdit={canEdit}
          />
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
