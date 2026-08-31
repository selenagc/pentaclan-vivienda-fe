import type { Breakpoint } from '@mui/material/styles';

/**
 * Ancho máximo del contenido del área autenticada (`lg` = 1200px), el ancho
 * habitual de un panel de administración: a pantalla completa, un listado de
 * pocas columnas queda perdido de extremo a extremo.
 *
 * Lo comparten `AppLayout` y `Topbar` a propósito. Si cada uno llevara el suyo
 * y se cambiara solo uno, el título de la barra dejaría de estar alineado con
 * las tarjetas de abajo, que es justo el defecto que este contenedor corrige.
 */
export const CONTENT_MAX_WIDTH: Breakpoint = 'lg';
