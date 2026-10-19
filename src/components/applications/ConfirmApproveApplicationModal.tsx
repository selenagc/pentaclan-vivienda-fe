import { useState } from 'react';
import Alert from '@mui/material/Alert';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { applicationService } from '../../services/applicationService';
import { getFriendlyErrorMessage } from '../../constants/apiErrorMessages';
import { propertyLabel } from '../../types/property.types';
import { personDisplayName, type Application } from '../../types/application.types';

interface ConfirmApproveApplicationModalProps {
  open: boolean;
  onClose: () => void;
  /** Recibe la ficha ya aprobada, tal como la devolvió el backend. */
  onSuccess: (approved: Application) => void;
  application: Application | null;
}

/**
 * Confirmación de aprobación. Solo la ven `admin` y `project_supervisor`: al
 * resto el backend le responde 403.
 *
 * Se confirma en vez de aprobar de un clic porque **la decisión no se puede
 * deshacer**: una ficha aprobada ya no admite otra decisión (409) y tampoco se
 * puede eliminar. El texto lo dice en esos términos, que son los que importan
 * al operador, y no en los de la base de datos.
 *
 * Se recuerda la vivienda porque es donde está el riesgo real de equivocarse:
 * solo puede haber un beneficiario aprobado por vivienda y proyecto, así que
 * aprobar al cónyuge equivocado bloquea al que correspondía.
 */
export const ConfirmApproveApplicationModal = ({
  open,
  onClose,
  onSuccess,
  application,
}: ConfirmApproveApplicationModalProps) => {
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Limpia el error de un intento previo cuando el modal vuelve a abrirse.
  // (Estado derivado del prop durante el render, no en un efecto.)
  const [wasOpen, setWasOpen] = useState(false);
  if (open && !wasOpen) {
    setError(null);
    setWasOpen(true);
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

  const handleApprove = async () => {
    if (!application) return;
    setIsApproving(true);
    setError(null);
    try {
      const approved = await applicationService.approve(application.id);
      onSuccess(approved);
      onClose();
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'No se pudo aprobar la ficha.'));
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Aprobar la ficha"
      size="sm"
      footer={
        <>
          <Button type="button" variant="outline" fullWidth={false} onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            fullWidth={false}
            isLoading={isApproving}
            onClick={handleApprove}
          >
            Aprobar
          </Button>
        </>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <p className="text-sm text-gray-600">
        <span className="font-semibold text-gray-900">
          {application ? personDisplayName(application.person) : ''}
        </span>{' '}
        pasará a ser <span className="font-semibold">beneficiario</span> de este proyecto y su
        ficha se moverá a esa pestaña.
      </p>

      {application && (
        <p className="mt-3 text-sm text-gray-600">
          Vivienda:{' '}
          <span className="font-medium text-gray-900">{propertyLabel(application.property)}</span>.
          Solo puede haber un beneficiario aprobado por vivienda en el proyecto.
        </p>
      )}

      <p className="mt-3 text-xs text-gray-500">
        La aprobación queda registrada a tu nombre y no se puede deshacer.
      </p>
    </Modal>
  );
};
