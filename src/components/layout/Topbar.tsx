import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface TopbarProps {
  /** Título de la página actual. */
  title: string;
  /** Abre el sidebar en móvil. */
  onMenuClick: () => void;
}

/**
 * Barra superior: botón de menú (móvil), título de la página, datos del
 * usuario autenticado y acción de cerrar sesión.
 */
export const Topbar = ({ title, onMenuClick }: TopbarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const initial = user?.name?.trim().charAt(0).toUpperCase() || 'U';

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Botón menú (solo móvil) */}
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          aria-label="Abrir menú"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden flex-col items-end leading-tight sm:flex">
          <span className="text-sm font-medium text-gray-900">
            {user?.name ?? 'Usuario'}
          </span>
          {user?.email && (
            <span className="text-xs text-gray-500">{user.email}</span>
          )}
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary text-sm font-semibold text-white">
          {initial}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-error"
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
        </button>
      </div>
    </header>
  );
};
