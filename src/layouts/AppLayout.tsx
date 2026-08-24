import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { navItems } from '../components/layout/navItems';

/**
 * Plantilla principal del área autenticada: sidebar + topbar + contenido.
 * Las rutas protegidas se renderizan en el <Outlet />. El título se deriva
 * de la ruta activa según navItems.
 */
export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  const current = navItems.find((item) => pathname.startsWith(item.to));
  const title = current?.label ?? 'Inicio';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
