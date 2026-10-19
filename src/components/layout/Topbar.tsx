import { useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useAuth } from '../../hooks/useAuth';
import { CONTENT_MAX_WIDTH } from './contentWidth';

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

  // El borde inferior cruza toda la pantalla, pero el contenido va dentro del
  // mismo contenedor que el `main`: si no, el título quedaría más a la
  // izquierda que las tarjetas de abajo.
  return (
    <header className="border-b border-gray-200 bg-white">
      <Container
        maxWidth={CONTENT_MAX_WIDTH}
        className="flex h-16 items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          {/* Botón menú (solo móvil) */}
          <IconButton
            onClick={onMenuClick}
            aria-label="Abrir menú"
            size="small"
            className="lg:hidden"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </IconButton>
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

          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14 }}>
            {initial}
          </Avatar>

          <Tooltip title="Cerrar sesión">
            <IconButton
              onClick={handleLogout}
              aria-label="Cerrar sesión"
              size="small"
              sx={{ '&:hover': { color: 'error.main' } }}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </IconButton>
          </Tooltip>
        </div>
      </Container>
    </header>
  );
};
