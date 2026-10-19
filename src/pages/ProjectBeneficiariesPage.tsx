import { useParams } from 'react-router-dom';
import { ApplicationsTable } from '../components/applications/ApplicationsTable';

const InfoIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
);

/**
 * Pestaña *Beneficiarios* del proyecto: `/proyectos/:projectId/beneficiarios`.
 *
 * No es otra entidad ni otro endpoint: un beneficiario es una ficha del mismo
 * padrón en estado `approved`, así que esto es la tabla de solicitantes con
 * `status: 'approved'`. La columna de estado se oculta porque el filtro ya lo
 * fija para todas las filas.
 *
 * Lo que sí cambia al entrar por aquí es la ficha: solo un beneficiario tiene
 * los dos diagnósticos, social y técnico.
 *
 * Las fichas llegan a esta lista al aprobarse desde *Solicitantes*; aquí no se
 * dan de alta, y por eso el panel no tiene botón de crear.
 */
export const ProjectBeneficiariesPage = () => {
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-brand-teal/30 bg-brand-teal/5 px-4 py-3">
        <span aria-hidden="true" className="mt-0.5 flex-shrink-0 text-brand-teal">
          {InfoIcon}
        </span>
        <p className="text-sm text-gray-700">
          Un beneficiario es un solicitante cuya ficha fue{' '}
          <span className="font-semibold">aprobada</span> desde la pestaña de solicitantes. Solo
          aquí se levantan los diagnósticos social y técnico.
        </p>
      </div>

      <ApplicationsTable
        projectId={projectId}
        section="beneficiarios"
        statuses={['approved']}
        showStatus={false}
        emptyMessage="Todavía no hay fichas aprobadas en este proyecto."
        itemLabel={{ singular: 'beneficiario', plural: 'beneficiarios' }}
      />
    </div>
  );
};

export default ProjectBeneficiariesPage;
