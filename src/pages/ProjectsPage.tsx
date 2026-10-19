import { useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import MuiButton from '@mui/material/Button';
import { Table, type Column } from '../components/ui/Table';
import { Pagination } from '../components/ui/Pagination';
import { Button } from '../components/ui/Button';
import { useProjects } from '../hooks/useProjects';
import { useAuth } from '../hooks/useAuth';
import type { Project } from '../types/project.types';

const ProjectIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
);

const PlusIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

/**
 * Listado de proyectos.
 *
 * La tabla se queda con lo que identifica al proyecto —título y número de
 * contrato— y el resto (ubicación, entidad financiadora y fechas) se ve en el
 * detalle: son datos largos que ensanchaban la tabla y obligaban a desplazarla
 * en pantallas pequeñas.
 *
 * De cada fila se ofrece una sola acción, *Ver*, que lleva al detalle del
 * proyecto. Editar y consultar el padrón viven allí, junto a los datos sobre
 * los que actúan: tres botones por fila obligaban a decidir a qué se entra
 * antes de haber visto nada.
 *
 * No hay acción de eliminar: el backend no expone `DELETE /projects/:id`.
 * El orden y la búsqueda quedan para su ticket: `useProjects` ya acepta los
 * filtros (ver `ProjectFilters`), falta la UI que los controle.
 */
export const ProjectsPage = () => {
  const navigate = useNavigate();
  const { projects, meta, page, limit, isLoading, error, goToPage, changeLimit } = useProjects();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const openDetail = (project: Project) => navigate(`/proyectos/${project.id}`);

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
        <MuiButton
          size="small"
          // La fila ya navega: sin esto el clic en el botón dispara los dos
          // manejadores y el detalle entra dos veces en el historial.
          onClick={(event) => {
            event.stopPropagation();
            openDetail(project);
          }}
          aria-label={`Ver ${project.name}`}
        >
          Ver
        </MuiButton>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary"
          >
            {ProjectIcon}
          </span>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Proyectos</h2>
            <p className="text-sm text-gray-500">
              Proyectos de vivienda social registrados en el sistema.
            </p>
          </div>
        </div>
        {isAdmin && (
          <Button fullWidth={false} onClick={() => navigate('/proyectos/nuevo')} icon={PlusIcon}>
            Nuevo proyecto
          </Button>
        )}
      </div>

      {error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <Table
            columns={columns}
            data={projects}
            rowKey="id"
            isLoading={isLoading}
            emptyMessage="No hay proyectos registrados."
            onRowClick={openDetail}
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
    </div>
  );
};

export default ProjectsPage;
