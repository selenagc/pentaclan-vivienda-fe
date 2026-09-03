import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, type Column } from '../components/ui/Table';
import { Pagination } from '../components/ui/Pagination';
import { Button } from '../components/ui/Button';
import { ProjectDetailModal } from '../components/projects/ProjectDetailModal';
import { ProjectFormModal } from '../components/projects/ProjectFormModal';
import { useProjects } from '../hooks/useProjects';
import { useAuth } from '../hooks/useAuth';
import type { Project } from '../types/project.types';

const PlusIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

/**
 * Listado de proyectos.
 *
 * La tabla se queda con lo que identifica al proyecto —título y número de
 * contrato— y el resto (ubicación, entidad financiadora y fechas) se consulta
 * en el detalle: son datos largos que ensanchaban la tabla y obligaban a
 * desplazarla en pantallas pequeñas.
 *
 * No hay acción de eliminar: el backend no expone `DELETE /projects/:id`.
 * El orden y la búsqueda quedan para su ticket: `useProjects` ya acepta los
 * filtros (ver `ProjectFilters`), falta la UI que los controle.
 */
export const ProjectsPage = () => {
  const navigate = useNavigate();
  const { projects, meta, page, limit, isLoading, error, refresh, goToPage, changeLimit } =
    useProjects();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [viewing, setViewing] = useState<Project | null>(null);
  const [editing, setEditing] = useState<Project | null>(null);

  /** Desde el detalle se salta a editar: se cierra uno y se abre el otro. */
  const openEdit = (project: Project) => {
    setViewing(null);
    setEditing(project);
  };

  const columns: Column<Project>[] = [
    {
      key: 'name',
      header: 'Proyecto',
      render: (project) => (
        <span className="font-medium text-gray-900">{project.name}</span>
      ),
    },
    { key: 'contractNo', header: 'Nº de contrato' },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (project) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={() => setViewing(project)}
            className="rounded-md px-2.5 py-1.5 text-sm font-medium text-brand-primary transition-colors hover:bg-brand-primary/5"
            aria-label={`Ver ${project.name}`}
          >
            Ver
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setEditing(project)}
              className="rounded-md px-2.5 py-1.5 text-sm font-medium text-brand-primary transition-colors hover:bg-brand-primary/5"
              aria-label={`Editar ${project.name}`}
            >
              Editar
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
          <p className="text-sm text-gray-500">
            Projects de vivienda social registrados en el sistema.
          </p>
        </div>
        {isAdmin && (
          <Button fullWidth={false} onClick={() => navigate('/proyectos/nuevo')} icon={PlusIcon}>
            Nuevo proyecto
          </Button>
        )}
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error"
        >
          {error}
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            data={projects}
            rowKey="id"
            isLoading={isLoading}
            emptyMessage="No hay proyectos registrados."
          />
          {meta && (
            <Pagination
              page={page}
              totalPages={meta.totalPages}
              total={meta.total}
              limit={limit}
              isLoading={isLoading}
              onPageChange={goToPage}
              onLimitChange={changeLimit}
              itemLabel={{ singular: 'proyecto', plural: 'proyectos' }}
            />
          )}
        </>
      )}

      <ProjectDetailModal
        open={viewing !== null}
        onClose={() => setViewing(null)}
        project={viewing}
        onEdit={isAdmin ? openEdit : undefined}
      />

      {editing && (
        <ProjectFormModal
          onClose={() => setEditing(null)}
          onSuccess={refresh}
          project={editing}
        />
      )}
    </div>
  );
};

export default ProjectsPage;
