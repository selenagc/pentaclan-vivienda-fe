import { useOutletContext } from 'react-router-dom';
import type { Project } from '../../types/project.types';

/** Lo que el detalle del proyecto comparte con todo lo que abre dentro. */
export interface ProjectOutletContext {
  /** `null` mientras se pide. */
  project: Project | null;
  isLoadingProject: boolean;
}

/**
 * El proyecto de la pantalla contenedora, para las pestañas y los formularios
 * que se abren dentro de ella.
 *
 * Existe para que el alta de un solicitante no vuelva a pedir el proyecto que
 * ya está pintado en la tarjeta de arriba: al abrirse dentro del contenedor,
 * el dato ya está en pantalla y repetir la petición solo añade una espera.
 */
export const useProjectOutlet = (): ProjectOutletContext =>
  useOutletContext<ProjectOutletContext>();
