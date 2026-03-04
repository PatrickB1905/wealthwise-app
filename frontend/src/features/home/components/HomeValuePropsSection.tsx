import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import {
  FeatureCardLayout,
  SectionBodyText,
  SectionEyebrow,
  SectionSurface,
  SoftGridBackground,
} from '@shared/ui/layout/Styled';

import type { ValuePropItem } from '../types/home';

type Props = {
  items: readonly ValuePropItem[];
};

export function HomeValuePropsSection({ items }: Props) {
  return (
    <SectionSurface>
      <SoftGridBackground />
      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        <Stack spacing={1.2} sx={{ textAlign: 'center', alignItems: 'center' }}>
          <SectionEyebrow>Built for clarity</SectionEyebrow>
          <Typography variant="h4" sx={{ fontWeight: 950, letterSpacing: '-0.03em' }}>
            Portfolio Intelligence Without the Noise
          </Typography>
          <SectionBodyText variant="body1" color="text.secondary" align="center">
            WealthWise consolidates your positions, live market data, performance metrics, and risk
            analytics into a single, unified platform. No spreadsheets. No fragmented tools. Just
            clear, structured insight into your investments.
          </SectionBodyText>
        </Stack>

        <Grid
          container
          spacing={2.5}
          justifyContent="center"
          sx={{ mt: 3.5, textAlign: 'center' }}
          alignItems="stretch"
        >
          {items.map((item) => {
            const Icon = item.icon.Icon;

            return (
              <Grid
                item
                xs={12}
                md={4}
                key={item.title}
                sx={{
                  display: 'flex',
                  width: '80%',
                }}
              >
                <FeatureCardLayout
                  sx={{
                    flex: 1,
                    width: '100%',
                    maxWidth: 'none',
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Stack direction="row" spacing={1.2} alignItems="center" justifyContent="center">
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2.2,
                        display: 'grid',
                        placeItems: 'center',
                        background:
                          'linear-gradient(135deg, rgba(37,99,235,0.14), rgba(37,99,235,0.05))',
                        border: '1px solid rgba(37,99,235,0.18)',
                      }}
                    >
                      <Icon {...(item.icon.props ?? {})} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 950 }}>
                      {item.title}
                    </Typography>
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1, textAlign: 'center' }}
                  >
                    {item.desc}
                  </Typography>
                </FeatureCardLayout>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </SectionSurface>
  );
}
