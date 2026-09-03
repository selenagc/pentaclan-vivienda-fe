import { useParams } from 'react-router-dom';
import { ApplicationsTable } from '../components/applications/ApplicationsTable';

/**
 * Pestaña *Beneficiarios* del proyecto: `/proyectos/:projectId/beneficiarios`.
 *
 * No es otra entidad ni otro endpoint: un beneficiario es una ficha del mismo
 * padrón en estado `approved`, así que esto es la tabla de solicitantes con
 * `status: 'approved'`. La columna de estado se oculta porque el filtro ya lo
 * fija para todas las filas.
 *
 * Hasta que exista la aprobación —su propio ticket— la lista sale vacía, y el
 * texto lo explica en vez de dejar al usuario pensando que se perdieron datos.
 */
export const ProjectBeneficiariesPage = () => {
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        Un beneficiario es un solicitante cuya ficha fue aprobada.
      </p>

      <ApplicationsTable
        projectId={projectId}
        status="approved"
        showStatus={false}
        emptyMessage="Todavía no hay fichas aprobadas en este proyecto."
        itemLabel={{ singular: 'beneficiario', plural: 'beneficiarios' }}
      />
    </div>
  );
};

export default ProjectBeneficiariesPage;
