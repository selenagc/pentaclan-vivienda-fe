import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { isValidEmail } from '../utils/validators';
import { getApiErrorMessage } from '../lib/axios';
import type { LoginCredentials, LoginFormErrors } from '../types/auth.types';

export const useLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: LoginFormErrors = {};

    if (!credentials.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido.';
    } else if (!isValidEmail(credentials.email)) {
      newErrors.email = 'Por favor, ingresa un correo electrónico válido.';
    }

    if (!credentials.password) {
      newErrors.password = 'La contraseña es requerida.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateField = <K extends keyof LoginCredentials>(
    field: K,
    value: LoginCredentials[K]
  ) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
    // Limpia el error del campo al editar
    if (errors[field as keyof LoginFormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await login(credentials);
      navigate('/inicio', { replace: true });
    } catch (error) {
      setErrors({
        general: getApiErrorMessage(error, 'No se pudo iniciar sesión. Verifica tus credenciales.'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    credentials,
    errors,
    isLoading,
    updateField,
    handleSubmit,
  };
};
