import { useNavigate } from 'react-router-dom';
import { Table, type Column } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { useProyectos } from '../hooks/useProyectos';
import { useAuth } from '../hooks/useAuth';
import { ubicacionCompleta, type Proyecto } from '../types/proyecto.types';

const PlusIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

/** Fecha corta en formato boliviano. El backend manda ISO en UTC. */
const formatFecha = (iso: string): string =>
  new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' });

/**
 * Listado de proyectos.
 *
 * No hay acción de eliminar: el backend no expone `DELETE /proyectos/:id`.
 * La paginación, el orden y la búsqueda quedan para su ticket (el backend ya
 * los soporta; ver `ListProyectosParams`).
 */
export const ProyectosPage = () => {
  const navigate = useNavigate();
  const { proyectos, isLoading, error } = useProyectos();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const columns: Column<Proyecto>[] = [
    {
      key: 'nombre',
      header: 'Proyecto',
      render: (proyecto) => (
        <span className="font-medium text-gray-900">{proyecto.nombre}</span>
      ),
    },
    { key: 'nroContrato', header: 'Nº de contrato' },
    {
      key: 'ubicacion',
      header: 'Ubicación',
      // El backend ya devuelve la cadena completa hasta el departamento.
      render: (proyecto) => ubicacionCompleta(proyecto.municipio),
    },
    {
      key: 'entidadPublica',
      header: 'Entidad financiadora',
      render: (proyecto) => proyecto.entidadPublica.nombre,
    },
    { key: 'usuarioNombre', header: 'Registrado por' },
    {
      key: 'createdAt',
      header: 'Fecha',
      align: 'right',
      render: (proyecto) => formatFecha(proyecto.createdAt),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Proyectos</h2>
          <p className="text-sm text-gray-500">
            Proyectos de vivienda social registrados en el sistema.
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
          data={proyectos}
          rowKey="id"
          isLoading={isLoading}
          emptyMessage="No hay proyectos registrados."
        />
      )}
    </div>
  );
};

export default ProyectosPage;
