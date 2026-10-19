import { useState, type FormEvent } from 'react';
import Alert from '@mui/material/Alert';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { userService } from '../../services/userService';
import { getApiErrorMessage, getApiFieldErrors } from '../../lib/axios';
import { isValidEmail } from '../../utils/validators';
import { USER_ROLE_OPTIONS } from '../../constants/userRoles';
import type {
  CreateUserInput,
  UpdateUserInput,
  User,
  UserFormErrors,
  UserRole,
} from '../../types/user.types';

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  /** Se invoca tras crear/editar con éxito (para refrescar el listado). */
  onSuccess: () => void;
  /** Usuario a editar; null/undefined para crear uno nuevo. */
  user?: User | null;
}

interface FormState {
  name: string;
  email: string;
  password: string;
  role: UserRole | '';
}

const emptyForm: FormState = { name: '', email: '', password: '', role: '' };

/** Campos que el backend puede reportar en `error.details[]`. */
const FIELD_KEYS = ['name', 'email', 'password', 'role'] as const;

/**
 * Modal de creación/edición de usuario. El mismo formulario sirve para ambos:
 * en edición se precargan los datos y la contraseña es opcional (solo se envía
 * si se escribe). La validación de cliente replica las reglas del backend.
 */
export const UserFormModal = ({ open, onClose, onSuccess, user }: UserFormModalProps) => {
  const isEdit = Boolean(user);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<UserFormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  // Resetea el formulario cuando el modal pasa de cerrado a abierto. Patrón
  // recomendado por React: derivar el estado del prop durante el render en
  // lugar de un efecto ("You Might Not Need an Effect"). Cada apertura parte
  // del usuario actual (editar) o de un formulario vacío (crear).
  const [wasOpen, setWasOpen] = useState(false);
  if (open && !wasOpen) {
    setForm(
      user
        ? { name: user.name, email: user.email, password: '', role: user.role }
        : emptyForm,
    );
    setErrors({});
    setWasOpen(true);
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof UserFormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const next: UserFormErrors = {};
    const name = form.name.trim();

    if (!name) next.name = 'El nombre es requerido.';
    else if (name.length > 150) next.name = 'El nombre no puede superar 150 caracteres.';

    if (!form.email.trim()) next.email = 'El correo electrónico es requerido.';
    else if (!isValidEmail(form.email)) next.email = 'Ingresa un correo electrónico válido.';

    // En creación la contraseña es obligatoria; en edición, solo si se escribe.
    if (!isEdit || form.password) {
      if (form.password.length < 8 || form.password.length > 128) {
        next.password = 'La contraseña debe tener entre 8 y 128 caracteres.';
      }
    }

    if (!form.role) next.role = 'Selecciona un rol.';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const applyServerErrors = (err: unknown) => {
    const fieldErrors = getApiFieldErrors(err);
    const next: UserFormErrors = {};
    for (const key of FIELD_KEYS) {
      if (fieldErrors[key]) next[key] = fieldErrors[key];
    }
    // Si no vino detalle por campo (ej. 409 email duplicado), mensaje general.
    if (Object.keys(next).length === 0) {
      next.general = getApiErrorMessage(err, 'No se pudo guardar el usuario.');
    }
    setErrors(next);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    setErrors({});
    try {
      if (isEdit && user) {
        const payload: UpdateUserInput = {
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role as UserRole,
        };
        if (form.password) payload.password = form.password;
        await userService.update(user.id, payload);
      } else {
        const payload: CreateUserInput = {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role as UserRole,
        };
        await userService.create(payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      applyServerErrors(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar usuario' : 'Nuevo usuario'}
      footer={
        <>
          <Button type="button" variant="outline" fullWidth={false} onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="user-form" fullWidth={false} isLoading={isSaving}>
            {isEdit ? 'Guardar cambios' : 'Crear usuario'}
          </Button>
        </>
      }
    >
      <form id="user-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        {errors.general && (
          <Alert severity="error">{errors.general}</Alert>
        )}

        <Input
          label="Nombre"
          name="name"
          value={form.name}
          onChange={(e) => updateField('name', e.target.value)}
          error={errors.name}
        />

        <Input
          label="Correo electrónico"
          type="email"
          name="email"
          value={form.email}
          onChange={(e) => updateField('email', e.target.value)}
          error={errors.email}
          autoComplete="off"
        />

        <Input
          label={isEdit ? 'Contraseña (dejar en blanco para no cambiarla)' : 'Contraseña'}
          type="password"
          name="password"
          value={form.password}
          onChange={(e) => updateField('password', e.target.value)}
          error={errors.password}
          autoComplete="new-password"
        />

        <Select
          label="Rol"
          name="role"
          options={USER_ROLE_OPTIONS}
          placeholder="Selecciona un rol"
          value={form.role}
          onChange={(e) => updateField('role', e.target.value as UserRole)}
          error={errors.role}
        />
      </form>
    </Modal>
  );
};
