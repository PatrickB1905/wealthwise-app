import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import {
  CTAButton,
  FeatureCardLayout,
  SectionEyebrow,
  SectionWrap,
} from '@shared/ui/layout/Styled';

type Props = {
  onRegister: () => void;
};

export function HomePlansSection({ onRegister }: Props) {
  return (
    <>
      <Box id="plans" />
      <SectionWrap maxWidth="lg">
        <Stack spacing={1.2} sx={{ textAlign: 'center', alignItems: 'center' }}>
          <SectionEyebrow>Plans</SectionEyebrow>
          <Typography variant="h4" sx={{ fontWeight: 950, letterSpacing: '-0.03em' }}>
            Flexible Plans for Every Stage
          </Typography>
        </Stack>

        <Grid container spacing={3} sx={{ mt: 2.5 }} justifyContent="center" alignItems="stretch">
          <Grid item xs={12} md={5} sx={{ display: 'flex' }}>
            <FeatureCardLayout
              sx={{
                flex: 1,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Stack spacing={1} sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 950 }}>
                  Free
                </Typography>
                <Typography color="text.secondary">
                  Full portfolio visibility at no cost.
                </Typography>

                <Divider sx={{ my: 1.5 }} />

                <Stack spacing={0.8}>
                  {[
                    'Create and manage your account',
                    'Add and track equity and crypto positions',
                    'View real-time portfolio valuation',
                    'Access core performance and risk metrics',
                  ].map((x) => (
                    <Typography key={x} variant="body2" color="text.secondary">
                      • {x}
                    </Typography>
                  ))}
                </Stack>

                <Box sx={{ mt: 'auto' }}>
                  <CTAButton fullWidth size="large" variant="contained" onClick={onRegister}>
                    Get Started
                  </CTAButton>
                </Box>
              </Stack>
            </FeatureCardLayout>
          </Grid>

          <Grid item xs={12} md={5} sx={{ display: 'flex' }}>
            <FeatureCardLayout
              sx={{
                flex: 1,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderColor: 'rgba(37,99,235,0.28)',
                boxShadow: '0px 18px 52px rgba(37,99,235,0.14)',
              }}
            >
              <Stack spacing={1} sx={{ flex: 1 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="h6" sx={{ fontWeight: 950 }}>
                    Pro
                  </Typography>
                  <Chip
                    label="Coming soon"
                    size="small"
                    sx={{
                      fontWeight: 900,
                      borderColor: 'rgba(37,99,235,0.28)',
                      backgroundColor: 'rgba(37,99,235,0.06)',
                    }}
                    variant="outlined"
                  />
                </Stack>

                <Typography color="text.secondary">
                  Advanced analytics for deeper portfolio intelligence.
                </Typography>

                <Divider sx={{ my: 1.5 }} />

                <Stack spacing={0.8}>
                  {[
                    'Expanded risk and correlation analysis',
                    'Advanced portfolio filtering and custom dashboards',
                    'Watchlists and alerting workflows',
                    'Exportable reporting and performance summaries',
                  ].map((x) => (
                    <Typography key={x} variant="body2" color="text.secondary">
                      • {x}
                    </Typography>
                  ))}
                </Stack>

                <Box sx={{ mt: 'auto' }}>
                  <CTAButton fullWidth size="large" variant="outlined" onClick={onRegister}>
                    Join the Waitlist
                  </CTAButton>
                </Box>
              </Stack>
            </FeatureCardLayout>
          </Grid>
        </Grid>
      </SectionWrap>
    </>
  );
}
