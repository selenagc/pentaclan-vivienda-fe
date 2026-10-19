import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  /** Roles con permiso para acceder a esta ruta. Si no se especifica, solo requiere sesión. */
  allowedRoles?: string[];
  /** Ruta a la que redirigir si el usuario no tiene el rol necesario (por defecto /inicio). */
  redirectTo?: string;
}

/**
 * Envuelve las rutas que requieren sesión y opcionalmente roles autorizados.
 * Si no hay usuario autenticado, redirige a /login.
 * Si no cumple con los roles requeridos, redirige a redirectTo (/inicio).
 */
export const ProtectedRoute = ({
  allowedRoles,
  redirectTo = '/inicio',
}: ProtectedRouteProps = {}) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

