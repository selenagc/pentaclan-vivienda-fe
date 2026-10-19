import { useState } from 'react';
import Alert from '@mui/material/Alert';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { userService } from '../../services/userService';
import { getApiErrorMessage } from '../../lib/axios';
import type { User } from '../../types/user.types';

interface ConfirmDeleteModalProps {
  open: boolean;
  onClose: () => void;
  /** Se invoca tras eliminar con éxito (para refrescar el listado). */
  onSuccess: () => void;
  user: User | null;
}

/**
 * Confirmación de borrado. El backend aplica reglas de negocio que devuelven
 * 409 (no borrarte a ti mismo, no borrar al último admin); ese mensaje se
 * muestra tal cual en el modal sin cerrarlo.
 */
export const ConfirmDeleteModal = ({
  open,
  onClose,
  onSuccess,
  user,
}: ConfirmDeleteModalProps) => {
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
    if (!user) return;
    setIsDeleting(true);
    setError(null);
    try {
      await userService.remove(user.id);
      onSuccess();
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo eliminar el usuario.'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Eliminar usuario"
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
            Eliminar
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
        ¿Seguro que deseas eliminar a{' '}
        <span className="font-semibold text-gray-900">{user?.name}</span>? Esta
        acción no se puede deshacer.
      </p>
    </Modal>
  );
};
