import { NavLink } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { navItems } from './navItems';

interface SidebarProps {
  /** En móvil controla si el panel está desplegado. */
  open: boolean;
  /** Cierra el panel (al tocar overlay o un ítem en móvil). */
  onClose: () => void;
}

/**
 * Barra lateral de navegación. Fija en escritorio (lg+) y tipo drawer con
 * overlay en móvil. La lista de ítems vive en navItems.
 */
export const Sidebar = ({ open, onClose }: SidebarProps) => {
  return (
    <>
      {/* Overlay (solo móvil, cuando está abierto) */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-brand-dark-deep text-gray-100 transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-white/10 px-6">
          <Logo variant="light" size={36} />
        </div>

        {/* Navegación */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-primary text-white'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Pie */}
        <div className="border-t border-white/10 px-6 py-4 text-xs text-gray-400">
          AE Vivienda · v0.1
        </div>
      </aside>
    </>
  );
};
