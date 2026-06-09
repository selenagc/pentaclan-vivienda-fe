import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Placeholder mínimo tras iniciar sesión. Solo confirma que el login
 * funciona y muestra los datos del usuario autenticado. El resto de la
 * aplicación se construirá en sus propios tickets.
 */
export const HomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Sesión iniciada{user?.name ? `, ${user.name}` : ''}
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          El login está conectado al backend. {user?.email}
        </p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-primary-dark"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default HomePage;
