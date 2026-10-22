import { useState } from 'react';
import Chip from '@mui/material/Chip';
import type { DiagnosticChangeEntry } from '../../types/diagnostic.types';

interface DiagnosticChangeHistoryProps {
  changeHistory?: DiagnosticChangeEntry[];
}

const FIELD_LABELS: Record<string, string> = {
  requiresImprovement: 'Requiere mejoramiento',
  requiresExpansion: 'Requiere ampliación',
  requiresRenovation: 'Requiere renovación',
  roomsToImprove: 'Ambientes a mejorar',
  bedroomSuggestion: 'Sugerencia dormitorio',
  livingRoomSuggestion: 'Sugerencia sala',
  kitchenSuggestion: 'Sugerencia cocina',
  bathroomSuggestion: 'Sugerencia baño',
  generalObservations: 'Observaciones generales',
  formNo: 'N° de formulario',
  evaluationDate: 'Fecha de evaluación',
  landAccessibility: 'Topografía y accesibilidad',
  basicUtilities: 'Servicios básicos',
  housingCharacteristics: 'Características de la vivienda',
  constructionElements: 'Elementos constructivos',
  photos: 'Fotografías de inspección',
  familyMembers: 'Composición familiar',
  answers: 'Cuestionario socioeconómico',
  waterHabits: 'Consumo y fuentes de agua',
  hygiene: 'Higiene y disposición de residuos',
  health: 'Condiciones de salud',
};

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('es-BO', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export const DiagnosticChangeHistory = ({ changeHistory = [] }: DiagnosticChangeHistoryProps) => {
  const [filterType, setFilterType] = useState<'ALL' | 'TECHNICAL' | 'SOCIAL'>('ALL');

  // Ordenar del más reciente al más antiguo
  const sortedHistory = [...changeHistory].reverse();

  const filteredHistory = sortedHistory.filter((entry) => {
    if (filterType === 'ALL') return true;
    return entry.type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Cabecera y filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Historial de modificaciones del diagnóstico
          </h3>
          <p className="text-xs text-gray-500">
            Registro cronológico de evaluaciones y cambios guardados por líderes técnicos y sociales.
          </p>
        </div>

        {/* Filtros rápidos */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterType === 'ALL'
                ? 'bg-brand-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todos ({changeHistory.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('TECHNICAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterType === 'TECHNICAL'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Técnico ({changeHistory.filter((h) => h.type === 'TECHNICAL').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('SOCIAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterType === 'SOCIAL'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Social ({changeHistory.filter((h) => h.type === 'SOCIAL').length})
          </button>
        </div>
      </div>

      {/* Lista vacía */}
      {filteredHistory.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm font-medium text-gray-700">Sin modificaciones registradas</p>
          <p className="text-xs text-gray-400 mt-1">
            Los cambios que realicen los técnicos o sociales sobre esta ficha aparecerán aquí.
          </p>
        </div>
      )}

      {/* Timeline de cambios */}
      {filteredHistory.length > 0 && (
        <div className="space-y-4">
          {filteredHistory.map((entry, idx) => {
            const isTechnical = entry.type === 'TECHNICAL';
            const isInitial = entry.action === 'INITIAL_SAVE';
            const hasDiff = entry.diff && Object.keys(entry.diff).length > 0;
            const isCrossEvaluator =
              entry.summary?.toLowerCase().includes('previamente evaluado') ||
              entry.summary?.toLowerCase().includes('anteriormente');

            return (
              <div
                key={entry.id || idx}
                className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden transition-all hover:border-gray-300"
              >
                {/* Cabecera de la tarjeta */}
                <div className="bg-gray-50/75 px-4 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Chip
                      size="small"
                      label={isTechnical ? 'Ficha Técnica' : 'Ficha Social'}
                      color={isTechnical ? 'primary' : 'success'}
                      sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={isInitial ? 'Registro inicial' : 'Modificación'}
                      color={isInitial ? 'default' : 'warning'}
                      sx={{ fontSize: '0.7rem' }}
                    />
                    <span className="text-gray-500 font-mono">
                      {formatDate(entry.timestamp)}
                    </span>
                  </div>

                  <div className="text-gray-600 flex items-center gap-2">
                    <span>
                      Por: <strong className="text-gray-900">{entry.performedByName}</strong>{' '}
                      <span className="text-gray-400 font-normal">({entry.performedByRole})</span>
                    </span>
                  </div>
                </div>

                {/* Contenido del evento */}
                <div className="p-4 space-y-3">
                  {/* Resumen del cambio */}
                  <div className="flex items-start gap-2">
                    {isCrossEvaluator && (
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800"
                        title="Este registro fue modificado por un profesional diferente al evaluador original"
                      >
                        ⚠️ Cambio de evaluador
                      </span>
                    )}
                    <span className="text-xs text-gray-800 font-medium">{entry.summary}</span>
                  </div>

                  {/* Chips de campos modificados */}
                  {entry.changedFields && entry.changedFields.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap text-xs">
                      <span className="text-gray-400 font-medium">Campos alterados:</span>
                      <div className="flex flex-wrap gap-1">
                        {entry.changedFields.map((field) => (
                          <Chip
                            key={field}
                            size="small"
                            variant="outlined"
                            label={FIELD_LABELS[field] ?? field}
                            sx={{ fontSize: '0.7rem', height: 22 }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tabla de diferencias (Diff) */}
                  {hasDiff && (
                    <div className="overflow-x-auto rounded-lg border border-gray-100 mt-2">
                      <table className="min-w-full text-xs divide-y divide-gray-200">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                          <tr>
                            <th className="px-3 py-2 text-left">Campo</th>
                            <th className="px-3 py-2 text-left">Valor anterior</th>
                            <th className="px-3 py-2 text-left">Nuevo valor asignado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {Object.entries(entry.diff!).map(([field, delta]) => {
                            const beforeStr =
                              delta.before === null || delta.before === undefined
                                ? '(vacío)'
                                : typeof delta.before === 'boolean'
                                  ? delta.before
                                    ? 'Sí'
                                    : 'No'
                                  : String(delta.before);

                            const afterStr =
                              delta.after === null || delta.after === undefined
                                ? '(vacío)'
                                : typeof delta.after === 'boolean'
                                  ? delta.after
                                    ? 'Sí'
                                    : 'No'
                                  : String(delta.after);

                            return (
                              <tr key={field} className="bg-amber-50/40">
                                <td className="px-3 py-2 text-gray-700 font-medium">
                                  {FIELD_LABELS[field] ?? field}
                                </td>
                                <td className="px-3 py-2 text-gray-400 line-through decoration-rose-400">
                                  {beforeStr}
                                </td>
                                <td className="px-3 py-2 text-blue-700 font-semibold">
                                  {afterStr}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DiagnosticChangeHistory;
