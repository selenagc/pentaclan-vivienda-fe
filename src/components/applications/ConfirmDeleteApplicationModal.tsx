import { useState } from 'react';
import Alert from '@mui/material/Alert';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { applicationService } from '../../services/applicationService';
import { getFriendlyErrorMessage } from '../../constants/apiErrorMessages';
import { personDisplayName, type Application } from '../../types/application.types';

interface ConfirmDeleteApplicationModalProps {
  open: boolean;
  onClose: () => void;
  /** Se invoca tras eliminar con éxito (para refrescar el listado). */
  onSuccess: () => void;
  application: Application | null;
}

/**
 * Confirmación de baja de una postulación. Solo la ve un administrador: el
 * backend responde 403 al resto, porque un líder que se equivoca pide la baja,
 * no la ejecuta.
 *
 * El texto insiste en que **no se pierde nada**, y no es un tecnicismo: el
 * borrado es lógico, la fila queda en la base con su fecha de baja porque en
 * un programa con fondos públicos no puede desaparecer evidencia. La persona y
 * la vivienda tampoco se borran, que pueden estar en otras fichas.
 */
export const ConfirmDeleteApplicationModal = ({
  open,
  onClose,
  onSuccess,
  application,
}: ConfirmDeleteApplicationModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleDelete = async () => {
    if (!application) return;
    setIsDeleting(true);
    setError(null);
    try {
      await applicationService.remove(application.id);
      onSuccess();
      onClose();
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'No se pudo eliminar la ficha.'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Dar de baja la ficha"
      size="sm"
      footer={
        <>
          <Button type="button" variant="outline" fullWidth={false} onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            fullWidth={false}
            isLoading={isDeleting}
            onClick={handleDelete}
          >
            Dar de baja
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
        ¿Seguro que deseas dar de baja la ficha de{' '}
        <span className="font-semibold text-gray-900">
          {application ? personDisplayName(application.person) : ''}
        </span>
        ? Saldrá del listado del proyecto.
      </p>
      <p className="mt-3 text-xs text-gray-500">
        La ficha queda registrada en la base para la auditoría del programa, y ni la persona ni la
        vivienda se eliminan.
      </p>
    </Modal>
  );
};
