import { useOutletContext } from 'react-router-dom';
import type { Application } from '../../types/application.types';

/**
 * Pestaña del proyecto desde la que se está mirando una ficha.
 *
 * La misma ficha se alcanza desde las dos —`/proyectos/:id/solicitantes/:aid`
 * y `/proyectos/:id/beneficiarios/:aid`— y no es una duplicación caprichosa:
 * es lo que mantiene marcada la pestaña de la que se entró y lo que hace que
 * *volver* devuelva a la lista correcta.
 */
export type ProjectSection = 'solicitantes' | 'beneficiarios';

/** Lo que la ficha comparte con sus pestañas. */
export interface ApplicationOutletContext {
  application: Application;
  /** Desde dónde se entró, para que los enlaces internos vuelvan ahí. */
  section: ProjectSection;
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
