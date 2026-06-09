import { useContext } from 'react';
import { AuthContext } from '../context/auth-context';

/** Acceso al estado de sesión. Debe usarse dentro de <AuthProvider>. */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  }
  return ctx;
};
