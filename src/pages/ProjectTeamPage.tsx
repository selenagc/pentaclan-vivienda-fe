import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import MuiButton from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Table, type Column } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { AssignEvaluatorModal } from '../components/projects/AssignEvaluatorModal';
import { projectService } from '../services/projectService';
import { useAuth } from '../hooks/useAuth';
import { USER_ROLE_LABELS } from '../constants/userRoles';
import type { UserRole } from '../types/user.types';
import type { ProjectAssignment } from '../types/project.types';

const PlusIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const UserGroupIcon = (
  <svg className="h-5 w-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
  </svg>
);

const TrashIcon = (
  <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

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

export const ProjectTeamPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [assignments, setAssignments] = useState<ProjectAssignment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [unassignTarget, setUnassignTarget] = useState<ProjectAssignment | null>(null);
  const [isUnassigning, setIsUnassigning] = useState(false);

  // Solo los administradores pueden gestionar el equipo del proyecto
  if (!isAdmin) {
    return <Navigate to={`/proyectos/${projectId}/solicitantes`} replace />;
  }

  const loadAssignments = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await projectService.getAssignments(projectId);
      setAssignments(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar las asignaciones del proyecto.');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const handleConfirmUnassign = async () => {
    if (!projectId || !unassignTarget) return;
    setIsUnassigning(true);
    try {
      await projectService.unassignUser(projectId, unassignTarget.userId);
      setUnassignTarget(null);
      await loadAssignments();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo desasignar al evaluador.');
    } finally {
      setIsUnassigning(false);
    }
  };

  const technicalCount = useMemo(
    () => assignments.filter((a) => a.user?.role === 'technical_lead').length,
    [assignments],
  );

  const socialCount = useMemo(
    () => assignments.filter((a) => a.user?.role === 'social_lead').length,
    [assignments],
  );

  const filteredAssignments = useMemo(() => {
    if (!searchTerm.trim()) return assignments;
    const term = searchTerm.toLowerCase();
    return assignments.filter(
      (a) =>
        (a.user?.name ?? '').toLowerCase().includes(term) ||
        (a.user?.email ?? '').toLowerCase().includes(term),
    );
  }, [assignments, searchTerm]);

  const columns: Column<ProjectAssignment>[] = [
    {
      key: 'user',
      header: 'Evaluador',
      render: (item) => {
        const isTechnical = item.user?.role === 'technical_lead';
        return (
          <div className="flex items-center gap-3">
            <Avatar
              sx={{
                width: 34,
                height: 34,
                fontSize: '0.8rem',
                fontWeight: 700,
                bgcolor: isTechnical ? '#0284C7' : '#7C3AED',
              }}
            >
              {getInitials(item.user?.name ?? 'Ev')}
            </Avatar>
            <div>
              <p className="font-semibold text-gray-900">{item.user?.name ?? 'Usuario sin nombre'}</p>
              <p className="text-xs text-gray-500">{item.user?.email ?? item.userId}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'role',
      header: 'Rol de Campo',
      render: (item) => {
        const role = item.user?.role as UserRole | undefined;
        return (
          <Chip
            label={role ? USER_ROLE_LABELS[role] ?? role : 'Evaluador'}
            size="small"
            color={role === 'technical_lead' ? 'info' : 'secondary'}
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: '0.75rem' }}
          />
        );
      },
    },
    {
      key: 'assignedAt',
      header: 'Fecha de Asignación',
      render: (item) => (
        <span className="text-sm text-gray-600">
          {item.assignedAt
            ? new Date(item.assignedAt).toLocaleDateString('es-BO', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            : 'N/D'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (item) => (
        <MuiButton
          size="small"
          color="error"
          startIcon={TrashIcon}
          onClick={() => setUnassignTarget(item)}
          aria-label={`Desasignar ${item.user?.name}`}
        >
          Desasignar
        </MuiButton>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Tarjetas de Métricas de Asignación */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-2xs">
          <p className="text-xs font-medium text-gray-500">Total Evaluadores Asignados</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{assignments.length}</p>
        </div>
        <div className="rounded-xl border border-sky-100 bg-sky-50/40 p-4 shadow-2xs">
          <p className="text-xs font-medium text-sky-700">Líderes Técnicos</p>
          <p className="mt-1 text-2xl font-bold text-sky-900">{technicalCount}</p>
        </div>
        <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-4 shadow-2xs">
          <p className="text-xs font-medium text-brand-primary">Líderes Sociales</p>
          <p className="mt-1 text-2xl font-bold text-brand-primary">{socialCount}</p>
        </div>
      </div>

      {/* Cabecera y acciones */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
            {UserGroupIcon}
          </span>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Equipo de Evaluadores</h2>
            <p className="text-xs text-gray-500">
              Personal técnico y social autorizado para gestionar fichas y postulaciones en este proyecto.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {assignments.length > 2 && (
            <div className="relative w-48 sm:w-60">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                {SearchIcon}
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar por nombre..."
                className="w-full rounded-xl border border-gray-200 bg-white py-1.5 pl-9 pr-3 text-xs text-gray-800 placeholder-gray-400 focus:border-brand-primary focus:outline-hidden focus:ring-1 focus:ring-brand-primary"
              />
            </div>
          )}

          <Button
            fullWidth={false}
            icon={PlusIcon}
            onClick={() => setIsAssignModalOpen(true)}
          >
            Asignar evaluador
          </Button>
        </div>
      </div>

      {error && <Alert severity="error">{error}</Alert>}

      {/* Tabla de miembros asignados */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-14">
          <CircularProgress size={36} className="text-brand-primary" />
          <p className="mt-3 text-sm text-gray-500">Cargando equipo del proyecto...</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 p-8 sm:p-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-brand-primary">
            {UserGroupIcon}
          </span>
          <h3 className="mt-3 text-base font-bold text-gray-900">
            No hay evaluadores asignados a este proyecto
          </h3>
          <p className="mt-1 max-w-md text-xs text-gray-500">
            Los técnicos y trabajadores sociales no podrán ver este proyecto hasta que los asignes aquí.
          </p>
          <div className="mt-5">
            <Button
              fullWidth={false}
              icon={PlusIcon}
              onClick={() => setIsAssignModalOpen(true)}
            >
              Asignar primer evaluador
            </Button>
          </div>
        </div>
      ) : (
        <Table
          columns={columns}
          data={filteredAssignments}
          rowKey="id"
          emptyMessage={`No hay evaluadores que coincidan con "${searchTerm}".`}
        />
      )}

      {/* Modal de Asignación de Evaluadores */}
      {projectId && (
        <AssignEvaluatorModal
          open={isAssignModalOpen}
          projectId={projectId}
          assignedUserIds={assignments.map((a) => a.userId)}
          onClose={() => setIsAssignModalOpen(false)}
          onSuccess={loadAssignments}
        />
      )}

      {/* Diálogo de Confirmación de Desasignación */}
      <Dialog
        open={unassignTarget !== null}
        onClose={isUnassigning ? undefined : () => setUnassignTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle className="font-bold text-gray-900">Confirmar desasignación</DialogTitle>
        <DialogContent className="pt-2 text-sm text-gray-600">
          ¿Seguro que deseas remover a{' '}
          <span className="font-semibold text-gray-900">
            {unassignTarget?.user?.name ?? 'este evaluador'}
          </span>{' '}
          de este proyecto? Ya no tendrá acceso para ver ni registrar postulaciones asociadas a este proyecto.
        </DialogContent>
        <DialogActions className="px-6 py-4 border-t border-gray-100">
          <Button
            variant="outline"
            fullWidth={false}
            disabled={isUnassigning}
            onClick={() => setUnassignTarget(null)}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            fullWidth={false}
            isLoading={isUnassigning}
            disabled={isUnassigning}
            onClick={handleConfirmUnassign}
          >
            Desasignar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProjectTeamPage;
