import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ApplicationsTable } from '../components/applications/ApplicationsTable';
import { useAuth } from '../hooks/useAuth';
import { CAN_WRITE_APPLICATIONS } from '../constants/applications';

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
 * ⚠️ **Pendiente de backend.** Al aprobarse, una ficha debería salir de esta
 * lista y aparecer solo en *Beneficiarios*, pero `GET /applications` acepta un
 * único `status` y no permite excluir uno: para pedir «todas menos las
 * aprobadas» hace falta que el endpoint admita varios estados (o un
 * `notStatus`). Filtrar aquí las filas ya recibidas no vale, porque el total y
 * las páginas los cuenta el servidor y quedarían descuadrados. Hoy no se nota
 * —ninguna ficha puede estar aprobada todavía—, pero hay que resolverlo antes
 * del ticket de aprobación.
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
