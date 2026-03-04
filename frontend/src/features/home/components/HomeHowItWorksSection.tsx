import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { FeatureCardLayout, SectionEyebrow, SectionWrap } from '@shared/ui/layout/Styled';
import type { StepItem } from '../types/home';

type Props = {
  steps: readonly StepItem[];
};

export function HomeHowItWorksSection({ steps }: Props) {
  return (
    <>
      <Box id="how" />
      <SectionWrap maxWidth="lg">
        <Stack spacing={1.2} sx={{ textAlign: 'center', alignItems: 'center' }}>
          <SectionEyebrow>How it Works</SectionEyebrow>
          <Typography variant="h4" sx={{ fontWeight: 950, letterSpacing: '-0.03em' }}>
            From Setup to Insight in Minutes
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ maxWidth: 760, mx: 'auto', width: 'auto', textAlign: 'center' }}
          >
            A streamlined workflow designed to move you from account creation to portfolio
            intelligence with minimal friction.
          </Typography>
        </Stack>

        <Grid container spacing={3} justifyContent="center" sx={{ mt: 2 }} alignItems="stretch">
          {steps.map((s, idx) => (
            <Grid item xs={12} md={4} key={s.title} sx={{ display: 'flex' }}>
              <FeatureCardLayout sx={{ width: '100%', height: '100%' }}>
                <Typography variant="overline" color="text.secondary">
                  Step {idx + 1}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 950 }} gutterBottom>
                  {s.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {s.desc}
                </Typography>
              </FeatureCardLayout>
            </Grid>
          ))}
        </Grid>
      </SectionWrap>
    </>
  );
}
