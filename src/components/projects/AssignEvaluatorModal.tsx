import { useEffect, useMemo, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import { Button } from '../ui/Button';
import { userService } from '../../services/userService';
import { projectService } from '../../services/projectService';
import { USER_ROLE_LABELS } from '../../constants/userRoles';
import type { User, UserRole } from '../../types/user.types';

interface AssignEvaluatorModalProps {
  open: boolean;
  projectId: string;
  assignedUserIds: string[];
  onClose: () => void;
  onSuccess: () => void;
}

const SearchIcon = (
  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const getInitials = (name: string) => {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
};

export const AssignEvaluatorModal = ({
  open,
  projectId,
  assignedUserIds,
  onClose,
  onSuccess,
}: AssignEvaluatorModalProps) => {
  const [evaluators, setEvaluators] = useState<User[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'technical_lead' | 'social_lead'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setSelectedIds([]);
      setSearchTerm('');
      setRoleFilter('all');
      setError(null);
      return;
    }

    const loadAvailableUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await userService.list({ limit: 100 });
        // Solo usuarios con rol social_lead o technical_lead que aún no estén asignados
        const eligible = res.data.filter(
          (u) =>
            (u.role === 'technical_lead' || u.role === 'social_lead') &&
            !assignedUserIds.includes(u.id),
        );
        setEvaluators(eligible);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al cargar usuarios evaluadores.');
      } finally {
        setIsLoading(false);
      }
    };

    loadAvailableUsers();
  }, [open, assignedUserIds]);

  const filteredEvaluators = useMemo(() => {
    return evaluators.filter((evaluator) => {
      const matchesRole = roleFilter === 'all' || evaluator.role === roleFilter;
      if (!matchesRole) return false;
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        evaluator.name.toLowerCase().includes(term) ||
        evaluator.email.toLowerCase().includes(term)
      );
    });
  }, [evaluators, roleFilter, searchTerm]);

  const handleToggle = (userId: string) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredEvaluators.map((u) => u.id);
    const allSelected = filteredIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await projectService.assignUsers(projectId, selectedIds);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al asignar evaluadores al proyecto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="font-bold text-gray-900 border-b border-gray-100 flex items-center justify-between">
        <span>Asignar Evaluadores al Proyecto</span>
        <span className="text-xs font-normal text-gray-500">
          {evaluators.length} disponibles
        </span>
      </DialogTitle>

      <DialogContent className="pt-4 space-y-4">
        <p className="text-xs text-gray-500">
          Selecciona uno o más evaluadores (Líderes Técnicos o Sociales) para autorizarlos a realizar
          visitas y fichas en este proyecto.
        </p>

        {error && <Alert severity="error">{error}</Alert>}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <CircularProgress size={36} className="text-brand-primary" />
            <span className="mt-3 text-sm text-gray-500">Cargando evaluadores disponibles...</span>
          </div>
        ) : evaluators.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
            No hay más evaluadores técnicos o sociales disponibles para asignar en este momento.
          </div>
        ) : (
          <div className="space-y-3">
            {/* Buscador y filtro por rol */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  {SearchIcon}
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre o correo..."
                  className="w-full rounded-lg border border-gray-200 bg-white py-1.5 pl-9 pr-3 text-xs text-gray-800 placeholder-gray-400 focus:border-brand-primary focus:outline-hidden focus:ring-1 focus:ring-brand-primary"
                />
              </div>

              {/* Botones de filtro de rol */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setRoleFilter('all')}
                  className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                    roleFilter === 'all'
                      ? 'bg-brand-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter('technical_lead')}
                  className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                    roleFilter === 'technical_lead'
                      ? 'bg-brand-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Técnicos
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter('social_lead')}
                  className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                    roleFilter === 'social_lead'
                      ? 'bg-brand-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Sociales
                </button>
              </div>
            </div>

            {/* Acciones de selección masiva */}
            <div className="flex items-center justify-between pb-1 text-xs font-medium text-gray-500">
              <button
                type="button"
                onClick={handleSelectAllFiltered}
                className="text-brand-primary hover:underline font-semibold"
              >
                {filteredEvaluators.every((u) => selectedIds.includes(u.id)) && filteredEvaluators.length > 0
                  ? 'Deseleccionar mostrados'
                  : 'Seleccionar mostrados'}
              </button>
              <span>{selectedIds.length} seleccionados en total</span>
            </div>

            {/* Lista de evaluadores */}
            <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 rounded-xl border border-gray-200">
              {filteredEvaluators.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-500">
                  No se encontraron evaluadores con los filtros seleccionados.
                </div>
              ) : (
                filteredEvaluators.map((evaluator) => {
                  const isSelected = selectedIds.includes(evaluator.id);
                  const isTechnical = evaluator.role === 'technical_lead';
                  return (
                    <label
                      key={evaluator.id}
                      className={`flex items-center gap-3 p-3 transition-colors cursor-pointer hover:bg-purple-50/40 ${
                        isSelected ? 'bg-purple-50/70' : ''
                      }`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleToggle(evaluator.id)}
                        color="primary"
                        size="small"
                      />
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          bgcolor: isTechnical ? '#0284C7' : '#7C3AED',
                        }}
                      >
                        {getInitials(evaluator.name)}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900 truncate">
                            {evaluator.name}
                          </span>
                          <Chip
                            label={USER_ROLE_LABELS[evaluator.role as UserRole] ?? evaluator.role}
                            size="small"
                            color={isTechnical ? 'info' : 'secondary'}
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 truncate">{evaluator.email}</p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        )}
      </DialogContent>

      <DialogActions className="px-6 py-4 border-t border-gray-100">
        <Button
          variant="outline"
          fullWidth={false}
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          fullWidth={false}
          onClick={handleSubmit}
          disabled={isSubmitting || selectedIds.length === 0}
          isLoading={isSubmitting}
        >
          Asignar {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
