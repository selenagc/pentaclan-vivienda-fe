import { useState } from 'react';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import MuiButton from '@mui/material/Button';
import { ProjectCard } from './ProjectCard';
import { useMyProjects } from '../../hooks/useMyProjects';
import type { Project } from '../../types/project.types';

interface MyProjectsViewProps {
  title?: string;
  subtitle?: string;
  onProjectSelect?: (project: Project) => void;
}

/** Ilustración amigable de estado vacío (Empty State) */
const EmptyIllustration = () => (
  <svg
    className="h-32 w-32 text-purple-200"
    viewBox="0 0 128 128"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect x="24" y="32" width="80" height="72" rx="12" fill="currentColor" fillOpacity="0.35" />
    <rect x="16" y="24" width="80" height="72" rx="12" fill="currentColor" fillOpacity="0.6" />
    <rect x="8" y="16" width="80" height="72" rx="12" className="fill-brand-primary" fillOpacity="0.12" stroke="#6B21A8" strokeWidth="2" strokeDasharray="4 4" />
    <path
      d="M36 44h24M36 56h32M36 68h20"
      stroke="#6B21A8"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <circle cx="76" cy="68" r="14" fill="white" stroke="#6B21A8" strokeWidth="2" />
    <path d="M72 68h8M76 64v8" stroke="#6B21A8" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const SearchIcon = (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const RefreshIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

export const MyProjectsView = ({
  title = 'Mis Proyectos Asignados',
  subtitle = 'Selecciona un proyecto para gestionar sus postulaciones y fichas de campo.',
  onProjectSelect,
}: MyProjectsViewProps) => {
  const { projects, isLoading, error, refetch } = useMyProjects();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = projects.filter((p) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.contractNo.toLowerCase().includes(term) ||
      (p.municipality?.name ?? '').toLowerCase().includes(term) ||
      (p.municipality?.department?.name ?? '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Cabecera y buscador */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            {title}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        </div>

        {/* Buscador rápido solo si hay 2 o más proyectos */}
        {projects.length > 1 && (
          <div className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              {SearchIcon}
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar proyecto o municipio..."
              className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 focus:border-brand-primary focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>
        )}
      </div>

      {/* Estado de Error */}
      {error && (
        <Alert
          severity="error"
          action={
            <MuiButton color="inherit" size="small" onClick={refetch}>
              Reintentar
            </MuiButton>
          }
        >
          {error}
        </Alert>
      )}

      {/* Estado de Carga */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CircularProgress size={44} thickness={4} className="text-brand-primary" />
          <p className="mt-4 text-sm font-medium text-gray-600 animate-pulse">
            Cargando tus proyectos asignados...
          </p>
        </div>
      )}

      {/* Estado Vacío (Empty State) según criterio de aceptación de PV-35 */}
      {!isLoading && !error && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-purple-200 bg-purple-50/40 p-8 sm:p-12 text-center">
          <EmptyIllustration />
          <h3 className="mt-4 text-lg font-bold text-gray-900">
            Aún no tienes proyectos asignados.
          </h3>
          <p className="mt-1 max-w-md text-sm text-gray-500">
            Contacta al administrador para que registre tus asignaciones de evaluación técnica o social.
          </p>
          <div className="mt-6">
            <MuiButton
              variant="outlined"
              startIcon={RefreshIcon}
              onClick={refetch}
              className="text-brand-primary border-brand-primary/40 hover:bg-brand-primary/5"
            >
              Comprobar de nuevo
            </MuiButton>
          </div>
        </div>
      )}

      {/* Si hay proyectos pero el filtro no encuentra nada */}
      {!isLoading && !error && projects.length > 0 && filteredProjects.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">
            No se encontraron proyectos asignados que coincidan con "{searchTerm}".
          </p>
          <MuiButton size="small" onClick={() => setSearchTerm('')} className="mt-2 text-brand-primary">
            Limpiar filtro
          </MuiButton>
        </div>
      )}

      {/* Lista de Proyectos en Cuadrícula Mobile-First */}
      {!isLoading && !error && filteredProjects.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={onProjectSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};
