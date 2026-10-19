import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ApplicationsTable } from '../components/applications/ApplicationsTable';
import { useAuth } from '../hooks/useAuth';
import { APPLICANT_STATUSES, CAN_WRITE_APPLICATIONS } from '../constants/applications';

const PlusIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

/**
 * Pestaña *Solicitantes* del proyecto: `/proyectos/:projectId/solicitantes`.
 *
 * Es el padrón de quienes postularon y todavía no son beneficiarios. Cuelga
 * del proyecto y no del menú lateral porque una postulación no existe suelta:
 * siempre es *a* un proyecto, y su vivienda tiene que estar en el municipio
 * donde se ejecuta la obra. Entrar por el proyecto deja ese contexto fijado.
 *
 * **Las aprobadas no salen aquí**: pasan a *Beneficiarios* y solo se ven allí.
 * Se consigue pidiendo los otros cuatro estados (`APPLICANT_STATUSES`), no
 * descartando filas ya recibidas: el `total` y las páginas los cuenta el
 * servidor y filtrar en el cliente los descuadraría. Es la razón de que
 * `GET /applications` acepte varios estados.
 *
 * Las rechazadas **sí** se quedan en esta lista, con su chip en rojo. No
 * desaparecen del padrón: poder explicar un rechazo meses después es requisito
 * de auditoría del programa.
 *
 * El proyecto no se pide aquí: lo carga `ProjectDetailPage` para la tarjeta de
 * cabecera, así que cambiar de pestaña no dispara la misma petición otra vez.
 *
 * Registrar es trabajo de campo: admin y los dos líderes. El supervisor lee
 * pero no escribe (el backend responde 403 igualmente; esto evita ofrecer un
 * botón que va a fallar).
 */
export const ProjectApplicantsPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const canWrite = CAN_WRITE_APPLICATIONS.includes(
    user?.role as (typeof CAN_WRITE_APPLICATIONS)[number],
  );

  return (
    <ApplicationsTable
      projectId={projectId}
      section="solicitantes"
      statuses={APPLICANT_STATUSES}
      emptyMessage="Este proyecto todavía no tiene solicitantes."
      itemLabel={{ singular: 'solicitante', plural: 'solicitantes' }}
      action={
        canWrite && (
          <Button
            fullWidth={false}
            onClick={() => navigate(`/proyectos/${projectId}/solicitantes/nuevo`)}
            icon={PlusIcon}
          >
            Nuevo solicitante
          </Button>
        )
      }
    />
  );
};

export default ProjectApplicantsPage;
