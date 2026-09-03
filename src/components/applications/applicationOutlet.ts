import { useOutletContext } from 'react-router-dom';
import type { Application } from '../../types/application.types';

/** Lo que la ficha comparte con sus pestañas. */
export interface ApplicationOutletContext {
  application: Application;
}

/**
 * La ficha ya cargada, para las pestañas que cuelgan de ella.
 *
 * `ApplicationDetailPage` la pide una vez y la pasa por el contexto del
 * `<Outlet />`, y solo monta las pestañas cuando llegó: por eso aquí la ficha
 * nunca es nula y ningún panel tiene que repetir la petición al cambiar de
 * pestaña.
 */
export const useApplicationOutlet = (): ApplicationOutletContext =>
  useOutletContext<ApplicationOutletContext>();
