import { createTheme } from '@mui/material/styles';

/**
 * Tema de MUI con la identidad de la aplicación.
 *
 * ⚠️ Los colores están **también** en el bloque `@theme` de `src/index.css`,
 * que es de donde los toma Tailwind (`bg-brand-primary`, `text-error`…). Son
 * dos motores distintos y ninguno lee las variables del otro: Tailwind v4
 * resuelve su `@theme` en tiempo de compilación y MUI necesita los valores en
 * JavaScript. Si cambias un color, cámbialo en los dos sitios.
 *
 * Tailwind se conserva para el maquetado (rejillas, espaciados, utilidades en
 * las páginas); MUI aporta los componentes.
 */

/** Morado de marca. Igual que `--color-brand-primary` en index.css. */
const BRAND_PRIMARY = '#6B21A8';
const BRAND_PRIMARY_DARK = '#581C87';
const BRAND_PRIMARY_LIGHT = '#8B5CF6';
const ERROR = '#DC2626';

/** Radio de `rounded-lg` en Tailwind, el que ya usaban inputs y botones. */
const RADIUS = 8;

export const theme = createTheme({
  palette: {
    primary: {
      main: BRAND_PRIMARY,
      dark: BRAND_PRIMARY_DARK,
      light: BRAND_PRIMARY_LIGHT,
      contrastText: '#FFFFFF',
    },
    error: { main: ERROR },
    text: {
      // Equivalen a gray-900 y gray-500 de Tailwind, que es lo que usaba la
      // interfaz antes de MUI.
      primary: '#111827',
      secondary: '#6B7280',
    },
    divider: '#E5E7EB',
  },

  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    // La interfaz estaba construida en 14px (`text-sm`), no en los 16px que
    // MUI trae por defecto; sin esto todo crecería de golpe.
    fontSize: 14,
    button: { textTransform: 'none', fontWeight: 500 },
  },

  shape: { borderRadius: RADIUS },

  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { paddingBlock: 10, paddingInline: 16 },
      },
    },

    // Los formularios usan campos compactos y a ancho completo, como antes.
    MuiTextField: {
      defaultProps: { size: 'small', fullWidth: true },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: { backgroundColor: '#FFFFFF' },
      },
    },

    MuiPaper: {
      styleOverrides: {
        // El contorno gris claro de las tarjetas de la app.
        outlined: { borderColor: '#E5E7EB' },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 500, color: '#4B5563', backgroundColor: '#F9FAFB' },
      },
    },
  },
});
