import { useState } from 'react';
import Alert from '@mui/material/Alert';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { applicationService } from '../../services/applicationService';
import { getFriendlyErrorMessage } from '../../constants/apiErrorMessages';
import { propertyLabel } from '../../types/property.types';
import { personDisplayName, type Application } from '../../types/application.types';

interface ConfirmPreselectApplicationModalProps {
  open: boolean;
  onClose: () => void;
  /** Recibe la ficha ya preseleccionada, tal como la devolvió el backend. */
  onSuccess: (preselected: Application) => void;
  application: Application | null;
}

/**
 * Confirmación de preselección (PV-38).
 *
 * Pasa el estado de la postulación de 'pending' a 'under_review' (Preseleccionado)
 * tras la visita y evaluación en campo.
 */
export const ConfirmPreselectApplicationModal = ({
  open,
  onClose,
  onSuccess,
  application,
}: ConfirmPreselectApplicationModalProps) => {
  const [isPreselecting, setIsPreselecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [wasOpen, setWasOpen] = useState(false);
  if (open && !wasOpen) {
    setError(null);
    setWasOpen(true);
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

  const handlePreselect = async () => {
    if (!application) return;
    setIsPreselecting(true);
    setError(null);
    try {
      const preselected = await applicationService.preselect(application.id);
      onSuccess(preselected);
      onClose();
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'No se pudo preseleccionar la postulación.'));
    } finally {
      setIsPreselecting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Preseleccionar postulación"
      size="sm"
      footer={
        <>
          <Button type="button" variant="outline" fullWidth={false} onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            fullWidth={false}
            isLoading={isPreselecting}
            onClick={handlePreselect}
          >
            Preseleccionar
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
        pasará al estado <span className="font-semibold text-brand-primary">Preseleccionado</span>.
      </p>

      {application && (
        <p className="mt-3 text-sm text-gray-600">
          Vivienda:{' '}
          <span className="font-medium text-gray-900">{propertyLabel(application.property)}</span>.
        </p>
      )}

      <p className="mt-3 text-xs text-gray-500">
        Esto confirma la evaluación de campo y deja la ficha lista para la revisión y aprobación definitiva por parte de AEVIVIENDA.
      </p>
    </Modal>
  );
};
