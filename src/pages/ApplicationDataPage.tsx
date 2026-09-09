import { ApplicationDetails } from '../components/applications/ApplicationDetails';
import { useApplicationOutlet } from '../components/applications/applicationOutlet';

/**
 * Datos generales de la ficha: lo que se capturó al registrar al solicitante
 * —titular, cónyuge, vivienda y trámite— en solo lectura.
 *
 * Para un solicitante es todo lo que hay, y se ve sin barra de pestañas: los
 * diagnósticos son del beneficiario. Para un beneficiario es la primera de las
 * tres pestañas.
 *
 * Corregir se hace desde el botón *Editar* de la tarjeta de cabecera, que
 * lleva al formulario completo.
 */
export const ApplicationDataPage = () => {
  const { application } = useApplicationOutlet();

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <ApplicationDetails application={application} />
    </div>
  );
};

export default ApplicationDataPage;
