import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Container from '@mui/material/Container';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { navItems } from '../components/layout/navItems';
import { CONTENT_MAX_WIDTH } from '../components/layout/contentWidth';

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
        {/* `Container` aporta el ancho máximo, el centrado y el relleno
            horizontal responsivo (16px, 24px desde `sm`), que es el mismo que
            tenían las clases `px-4 sm:px-6` que sustituye. */}
        <Container component="main" maxWidth={CONTENT_MAX_WIDTH} className="flex-1 py-6">
          <Outlet />
        </Container>
      </div>
    </div>
  );
};
