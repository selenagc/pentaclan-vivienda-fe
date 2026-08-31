import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import type { ReactNode } from 'react';

interface ModalProps {
  /** Controla la visibilidad. */
  open: boolean;
  /** Se invoca al cerrar (Esc, click en el overlay o botón ✕). */
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  /** Zona de acciones (botones) al pie del modal. */
  footer?: ReactNode;
  /** Ancho máximo del panel. */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Anchos en píxeles en lugar de los `maxWidth` de MUI (444/600/900): son los
 * que ya tenía la aplicación (`max-w-sm/md/lg` de Tailwind) y cambiarlos
 * ensancharía todos los modales de golpe.
 */
const sizeMap = {
  sm: 384,
  md: 448,
  lg: 512,
} as const;

const CloseIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

/**
 * Modal genérico y reutilizable, sobre el `Dialog` de MUI: overlay, cierre con
 * Esc / click fuera, bloqueo del scroll del fondo y foco atrapado dentro
 * mientras está abierto. Sirve para formularios (crear/editar) y
 * confirmaciones en cualquier módulo.
 *
 * El cuerpo tiene scroll propio y la cabecera y el pie quedan fijos, para que
 * un formulario largo no se salga de la pantalla.
 */
export const Modal = ({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}: ModalProps) => (
  <Dialog
    open={open}
    onClose={onClose}
    fullWidth
    maxWidth={false}
    slotProps={{ paper: { sx: { maxWidth: sizeMap[size] } } }}
  >
    <DialogTitle
      component="h2"
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}
    >
      {title}
      <IconButton onClick={onClose} aria-label="Cerrar" size="small" edge="end">
        {CloseIcon}
      </IconButton>
    </DialogTitle>

    <DialogContent dividers>{children}</DialogContent>

    {footer && <DialogActions>{footer}</DialogActions>}
  </Dialog>
);
