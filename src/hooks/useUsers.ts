import { useCallback, useEffect, useState } from 'react';
import { userService } from '../services/userService';
import { getApiErrorMessage } from '../lib/axios';
import type { User } from '../types/user.types';

/**
 * Carga el listado de usuarios y expone su estado.
 *
 * La paginación se difiere a su propio ticket: por ahora se solicita
 * `limit: 100` (máximo del backend) para mostrar el listado completo.
 */
export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await userService.list({ limit: 100 });
      setUsers(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudieron cargar los usuarios.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Carga inicial. `fetchUsers` activa el estado de carga de forma síncrona
    // (a propósito, para mostrar el skeleton también al refrescar); ese reset
    // es seguro aquí, de ahí el disable puntual de la regla.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, [fetchUsers]);

  return { users, isLoading, error, refresh: fetchUsers };
};
