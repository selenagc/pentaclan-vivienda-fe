import { useNavigate } from 'react-router-dom';
import { Table, type Column } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { useProjects } from '../hooks/useProjects';
import { useAuth } from '../hooks/useAuth';
import { fullLocation, type Project } from '../types/project.types';

const PlusIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

/** Fecha corta en formato boliviano. El backend manda ISO en UTC. */
const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' });

/**
 * Listado de proyectos.
 *
 * No hay acción de eliminar: el backend no expone `DELETE /projects/:id`.
 * La paginación, el orden y la búsqueda quedan para su ticket (el backend ya
 * los soporta; ver `ListProyectosParams`).
 */
export const ProjectsPage = () => {
  const navigate = useNavigate();
  const { projects, isLoading, error } = useProjects();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

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
      key: 'location',
      header: 'Ubicación',
      // El backend ya devuelve la cadena completa hasta el departamento.
      render: (project) => fullLocation(project.municipality),
    },
    {
      key: 'publicEntity',
      header: 'Entidad financiadora',
      render: (project) => project.publicEntity.name,
    },
    { key: 'userName', header: 'Registrado por' },
    {
      key: 'createdAt',
      header: 'Fecha',
      align: 'right',
      render: (project) => formatDate(project.createdAt),
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
        <Table
          columns={columns}
          data={projects}
          rowKey="id"
          isLoading={isLoading}
          emptyMessage="No hay proyectos registrados."
        />
      )}
    </div>
  );
};

export default ProjectsPage;
