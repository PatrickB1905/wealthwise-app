import type { SxProps, Theme } from '@mui/material/styles';

export type HomePageStyles = {
  mobileMenuPaperSx: SxProps<Theme>;
  heroTitleSx: SxProps<Theme>;
  heroTaglineSx: SxProps<Theme>;
};

export function buildHomePageStyles(): HomePageStyles {
  return {
    mobileMenuPaperSx: {
      mt: 1,
      minWidth: 220,
      borderRadius: 3,
      border: '1px solid rgba(255,255,255,0.14)',
      backgroundColor: 'rgba(15, 23, 42, 0.92)',
      backdropFilter: 'blur(14px)',
      color: 'rgba(255,255,255,0.92)',
    },
    heroTitleSx: {
      fontWeight: 950,
      letterSpacing: '-0.055em',
      lineHeight: 1.02,
      fontSize: { xs: 44, sm: 58, md: 70 },
    },
    heroTaglineSx: {
      maxWidth: 700,
      fontSize: { xs: 16.5, sm: 18, md: 18.5 },
      lineHeight: 1.6,
    },
  };
}
