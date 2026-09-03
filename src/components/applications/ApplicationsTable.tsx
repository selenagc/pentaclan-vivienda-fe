import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import MuiButton from '@mui/material/Button';
import { Table, type Column } from '../ui/Table';
import { Pagination } from '../ui/Pagination';
import { useApplications } from '../../hooks/useApplications';
import { APPLICATION_STATUS_COLORS, APPLICATION_STATUS_LABELS } from '../../constants/applications';
import { propertyLabel } from '../../types/property.types';
import {
  applicantFullName,
  fullDocument,
  type Application,
  type ApplicationStatus,
} from '../../types/application.types';
import type { ProjectSection } from './applicationOutlet';

interface ApplicationsTableProps {
  /** Proyecto del que cuelgan las fichas. Viene de la URL. */
  projectId: string | undefined;
  /** Pestaña que la muestra: fija la ruta de las fichas y a dónde vuelven. */
  section: ProjectSection;
  /**
   * Estados que entran en la lista, en OR. `['approved']` es, literalmente,
   * la lista de beneficiarios.
   *
   * El filtro lo aplica el servidor y no este componente porque el `total` y
   * las páginas los cuenta él: descartar filas ya recibidas descuadraría el
   * pie de la tabla.
   */
  statuses?: ApplicationStatus[];
  /** Oculta la columna de estado cuando el filtro ya lo fija para todas. */
  showStatus?: boolean;
  emptyMessage: string;
  /** Singular y plural para el pie de paginación. */
  itemLabel: { singular: string; plural: string };
  /** Acción principal del panel (el alta), alineada a la derecha sobre la tabla. */
  action?: ReactNode;
}

/**
 * Padrón de fichas de un proyecto: la tabla que comparten las pestañas de
 * *Solicitantes* y *Beneficiarios*.
 *
 * Son la misma lista con distinto filtro —un beneficiario es una ficha en
 * estado `approved`, no otra entidad— así que comparten componente en vez de
 * duplicar columnas y paginación. Lo que cambia entre ambas se pasa por props.
 *
 * De cada fila solo se ofrece *Ver*: corregir y dar de baja viven en la ficha,
 * junto a los datos sobre los que actúan, y así el listado se lee de un
 * vistazo. La fila entera es clicable por lo mismo.
 */
export const ApplicationsTable = ({
  projectId,
  section,
  statuses,
  showStatus = true,
  emptyMessage,
  itemLabel,
  action,
}: ApplicationsTableProps) => {
  const navigate = useNavigate();
  const { applications, meta, page, limit, isLoading, error, goToPage, changeLimit } =
    useApplications({ projectId, status: statuses });

  // La ficha se abre bajo la pestaña desde la que se entró, para que al volver
  // se caiga en la lista correcta y no siempre en solicitantes.
  const openDetail = (application: Application) =>
    navigate(`/proyectos/${projectId}/${section}/${application.id}`);

  const columns: Column<Application>[] = [
    {
      key: 'applicant',
      header: 'Solicitante',
      render: (application) => (
        <span className="font-medium text-gray-900">
          {applicantFullName(application.person)}
        </span>
      ),
    },
    {
      key: 'document',
      header: 'Documento',
      render: (application) => fullDocument(application.person),
    },
    {
      key: 'property',
      header: 'Vivienda',
      render: (application) => propertyLabel(application.property),
    },
    ...(showStatus
      ? [
          {
            key: 'status',
            header: 'Estado',
            render: (application: Application) => (
              <Chip
                size="small"
                label={APPLICATION_STATUS_LABELS[application.status]}
                color={APPLICATION_STATUS_COLORS[application.status]}
              />
            ),
          },
        ]
      : []),
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (application) => (
        <MuiButton
          size="small"
          // La fila ya navega: sin esto el clic en el botón dispara los dos
          // manejadores y la ficha entra dos veces en el historial.
          onClick={(event) => {
            event.stopPropagation();
            openDetail(application);
          }}
          aria-label={`Ver la ficha de ${applicantFullName(application.person)}`}
        >
          Ver
        </MuiButton>
      ),
    },
  ];

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <div className="space-y-4">
      {action && <div className="flex justify-end">{action}</div>}

      <Table
        columns={columns}
        data={applications}
        rowKey="id"
        isLoading={isLoading}
        emptyMessage={emptyMessage}
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
          itemLabel={itemLabel}
        />
      )}
    </div>
  );
};
