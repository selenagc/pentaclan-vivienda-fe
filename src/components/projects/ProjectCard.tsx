import { useNavigate } from 'react-router-dom';
import type { Project } from '../../types/project.types';

interface ProjectCardProps {
  project: Project;
  onSelect?: (project: Project) => void;
}

const LocationIcon = (
  <svg className="h-4 w-4 shrink-0 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

const EntityIcon = (
  <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
  </svg>
);

const ArrowRightIcon = (
  <svg className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

/**
 * Tarjeta táctil mobile-first para proyectos asignados.
 * Muestra nombre, contrato, municipio y entidad. Al pulsarla, guarda
 * el proyecto en localStorage y redirige a su lista de solicitantes.
 */
export const ProjectCard = ({ project, onSelect }: ProjectCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    localStorage.setItem('selectedProjectId', project.id);
    localStorage.setItem('selectedProjectName', project.name);
    if (onSelect) {
      onSelect(project);
    } else {
      navigate(`/proyectos/${project.id}/solicitantes`);
    }
  };

  const municipalityText = project.municipality
    ? `${project.municipality.name}${project.municipality.department ? ` (${project.municipality.department.name})` : ''}`
    : 'Ubicación no disponible';

  return (
    <article
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-primary/40 hover:shadow-md active:scale-[0.99] cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-brand-primary"
      aria-label={`Ver solicitantes del proyecto ${project.name}`}
    >
      {/* Cabecera: Contrato y Financiador */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="inline-flex items-center rounded-md bg-purple-50 px-2.5 py-1 text-xs font-semibold text-brand-primary ring-1 ring-purple-500/10">
            {project.contractNo}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500 truncate max-w-[200px]" title={project.publicEntity?.name}>
            {EntityIcon}
            <span className="truncate">{project.publicEntity?.name ?? 'AEVivienda'}</span>
          </span>
        </div>

        {/* Nombre del Proyecto */}
        <h3 className="text-base sm:text-lg font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-brand-primary transition-colors">
          {project.name}
        </h3>

        {/* Ubicación: Municipio y Departamento */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          {LocationIcon}
          <span className="font-medium text-gray-700">{municipalityText}</span>
        </div>
      </div>

      {/* Botón inferior / acción de tocar */}
      <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-brand-primary text-sm font-semibold">
        <span>Ver Solicitantes</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors">
          {ArrowRightIcon}
        </span>
      </div>
    </article>
  );
};
