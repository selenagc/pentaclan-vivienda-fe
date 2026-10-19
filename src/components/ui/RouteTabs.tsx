import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { Link, useLocation } from 'react-router-dom';

export interface RouteTab {
  /** Etiqueta visible de la pestaña. */
  label: string;
  /** Ruta absoluta del panel que abre. */
  to: string;
}

interface RouteTabsProps {
  tabs: RouteTab[];
  /** Describe el grupo para lectores de pantalla ("Secciones del proyecto"). */
  ariaLabel: string;
}

/** La pestaña cubre la ruta actual si es esa misma o una sección por debajo. */
const covers = (pathname: string, to: string): boolean =>
  pathname === to || pathname.startsWith(`${to}/`);

/**
 * Pestañas cableadas al router: cada una es un enlace y la activa se deduce de
 * la URL, no de un `useState`.
 *
 * Se hace así —y no con estado local— porque la pestaña forma parte de dónde
 * está el usuario: `/proyectos/:id/beneficiarios` se puede compartir, recargar
 * y volver atrás con el botón del navegador. Con estado, las tres cosas se
 * pierden.
 *
 * Cuando varias pestañas cubren la ruta gana la más específica, que es el caso
 * de una pestaña índice —la ficha del solicitante— conviviendo con sus
 * secciones (`.../diagnostico-social`). Que una pestaña siga marcada mientras
 * se mira una ficha o se llena un formulario es deliberado: son pantallas
 * *dentro* de ella.
 */
export const RouteTabs = ({ tabs, ariaLabel }: RouteTabsProps) => {
  const { pathname } = useLocation();

  const active = tabs
    .filter((tab) => covers(pathname, tab.to))
    .sort((a, b) => b.to.length - a.to.length)[0];

  return (
    <div className="rounded-xl border border-gray-200 bg-brand-primary/5 px-2">
      {/* `value={false}` cuando ninguna coincide: MUI avisa por consola si el
          valor no corresponde a ninguna pestaña montada. */}
      <Tabs
        value={active?.to ?? false}
        aria-label={ariaLabel}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          '& .MuiTab-root': { fontWeight: 500, color: 'text.secondary' },
          '& .Mui-selected': { fontWeight: 600 },
          '& .MuiTabs-indicator': { height: 3, borderRadius: 3 },
        }}
      >
        {tabs.map((tab) => (
          <Tab key={tab.to} value={tab.to} label={tab.label} component={Link} to={tab.to} />
        ))}
      </Tabs>
    </div>
  );
};
