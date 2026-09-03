import { useState, type FormEvent } from 'react';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { applicationService } from '../../services/applicationService';
import {
  getFriendlyErrorMessage,
} from '../../constants/apiErrorMessages';
import { REJECTION_REASON_MAX_LENGTH } from '../../constants/applications';
import { personDisplayName, type Application } from '../../types/application.types';

interface RejectApplicationModalProps {
  open: boolean;
  onClose: () => void;
  /** Recibe la ficha ya rechazada, tal como la devolvió el backend. */
  onSuccess: (rejected: Application) => void;
  application: Application | null;
}

/**
 * Rechazo de una ficha, con su motivo. Solo lo ven `admin` y
 * `project_supervisor`.
 *
 * **El motivo es obligatorio** y el backend lo exige igualmente: un rechazo sin
 * explicación es una fila que nadie puede justificar seis meses después, que es
 * cuando llega la auditoría del programa. Se valida aquí además para no gastar
 * un viaje y para poder señalar el campo.
 *
 * El campo es multilínea, así que usa el `TextField` de MUI directamente en vez
 * del `Input` de la app, que es de una sola línea por diseño.
 */
export const RejectApplicationModal = ({
  open,
  onClose,
  onSuccess,
  application,
}: RejectApplicationModalProps) => {
  const [reason, setReason] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cada apertura arranca en blanco: el motivo de un rechazo que se descartó no
  // debe reaparecer en el siguiente, que es de otra persona.
  const [wasOpen, setWasOpen] = useState(false);
  if (open && !wasOpen) {
    setReason('');
    setFieldError(null);
    setError(null);
    setWasOpen(true);
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!application) return;

    // Se recorta antes de validar: el backend hace lo mismo, así que unos
    // espacios no cuentan como motivo ni aquí ni allá.
    const rejectionReason = reason.trim();
    if (!rejectionReason) {
      setFieldError('Indica por qué se rechaza la ficha.');
      return;
    }

    setIsRejecting(true);
    setError(null);
    try {
      const rejected = await applicationService.reject(application.id, { rejectionReason });
      onSuccess(rejected);
      onClose();
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'No se pudo rechazar la ficha.'));
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Rechazar la ficha"
      size="md"
      footer={
        <>
          <Button type="button" variant="outline" fullWidth={false} onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="reject-application-form"
            variant="danger"
            fullWidth={false}
            isLoading={isRejecting}
          >
            Rechazar
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
        Se rechazará la ficha de{' '}
        <span className="font-semibold text-gray-900">
          {application ? personDisplayName(application.person) : ''}
        </span>
        .
      </p>

      {/* El formulario envuelve solo el campo: el botón vive en el pie del
          modal y lo envía por `form=`, así Enter en el campo también funciona. */}
      <form id="reject-application-form" onSubmit={handleSubmit} className="mt-4">
        <TextField
          label="Motivo del rechazo"
          value={reason}
          onChange={(event) => {
            setReason(event.target.value);
            if (fieldError) setFieldError(null);
          }}
          error={Boolean(fieldError)}
          helperText={
            fieldError ?? `Quedará guardado en la ficha. ${reason.length}/${REJECTION_REASON_MAX_LENGTH}`
          }
          slotProps={{ htmlInput: { maxLength: REJECTION_REASON_MAX_LENGTH } }}
          multiline
          minRows={3}
          fullWidth
          autoFocus
          required
        />
      </form>

      <p className="mt-3 text-xs text-gray-500">
        La ficha no se elimina: queda en el padrón como rechazada, con este motivo y a tu nombre.
      </p>
    </Modal>
  );
};
