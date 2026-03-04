import { alpha, createTheme } from '@mui/material/styles';
import type { Shadows } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',

    primary: { main: '#2563EB' },
    secondary: { main: '#334155' },
    success: { main: '#16A34A' },
    warning: { main: '#F59E0B' },
    error: { main: '#DC2626' },

    background: {
      default: '#F6F8FC',
      paper: '#FFFFFF',
    },

    text: {
      primary: '#0F172A',
      secondary: '#475569',
    },

    divider: 'rgba(15, 23, 42, 0.10)',
  },

  typography: {
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
    h4: { fontWeight: 800, letterSpacing: '-0.02em' },
    h5: { fontWeight: 750, letterSpacing: '-0.015em' },
    h6: { fontWeight: 700, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 650 },
    body1: { lineHeight: 1.6 },
    body2: { lineHeight: 1.55 },
    button: { textTransform: 'none', fontWeight: 700, letterSpacing: '-0.01em' },
  },

  shape: {
    borderRadius: 14,
  },

  shadows: [
    'none',
    '0px 1px 2px rgba(15, 23, 42, 0.06)',
    '0px 2px 6px rgba(15, 23, 42, 0.08)',
    '0px 6px 16px rgba(15, 23, 42, 0.10)',
    '0px 10px 24px rgba(15, 23, 42, 0.12)',
    '0px 14px 30px rgba(15, 23, 42, 0.14)',
    ...Array.from({ length: 19 }, () => 'none'),
  ] as unknown as Shadows,

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          colorScheme: 'light',
        },
        body: {
          backgroundColor: '#F6F8FC',
        },
      },
    },

    MuiContainer: {
      defaultProps: {
        maxWidth: 'lg',
      },
    },

    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
          boxShadow: theme.shadows[3],
          borderRadius: (theme.shape.borderRadius as number) * 1.2,
        }),
      },
    },

    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: (theme.shape.borderRadius as number) * 0.9,
          paddingLeft: 14,
          paddingRight: 14,
        }),
        containedPrimary: ({ theme }) => ({
          boxShadow: `0 10px 20px ${alpha(theme.palette.primary.main, 0.18)}`,
        }),
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: (theme.shape.borderRadius as number) * 0.9,
          backgroundColor: theme.palette.background.paper,
          transition: 'box-shadow 120ms ease, border-color 120ms ease',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: alpha(theme.palette.text.primary, 0.22),
          },
          '&.Mui-focused': {
            boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.14)}`,
          },
        }),
        notchedOutline: ({ theme }) => ({
          borderColor: alpha(theme.palette.text.primary, 0.14),
        }),
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },

    MuiChip: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 999,
          fontWeight: 700,
          backgroundColor: alpha(theme.palette.text.primary, 0.04),
        }),
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: (theme.shape.borderRadius as number) * 1.2,
          border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
        }),
      },
    },

    MuiTableContainer: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: (theme.shape.borderRadius as number) * 0.9,
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden',
        }),
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.text.primary, 0.02),
        }),
      },
    },

    MuiTableCell: {
      styleOverrides: {
        head: ({ theme }) => ({
          fontWeight: 800,
          color: theme.palette.text.primary,
        }),
        body: {
          fontVariantNumeric: 'tabular-nums',
        },
      },
    },

    MuiToggleButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: (theme.shape.borderRadius as number) * 0.85,
          textTransform: 'none',
          fontWeight: 700,
        }),
      },
    },

    MuiLink: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontWeight: 650,
          textDecorationColor: alpha(theme.palette.primary.main, 0.35),
          '&:hover': {
            textDecorationColor: theme.palette.primary.main,
          },
        }),
      },
    },

    MuiTooltip: {
      defaultProps: {
        arrow: true,
      },
      styleOverrides: {
        tooltip: () => ({
          backgroundColor: alpha('#0B1220', 0.92),
          border: `1px solid ${alpha('#FFFFFF', 0.08)}`,
          fontWeight: 650,
        }),
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: (theme.shape.borderRadius as number) * 0.9,
        }),
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 999,
          backgroundColor: alpha(theme.palette.primary.main, 0.12),
        }),
        bar: {
          borderRadius: 999,
        },
      },
    },

    MuiSkeleton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: (theme.shape.borderRadius as number) * 0.8,
        }),
      },
    },
  },
});

export default theme;
