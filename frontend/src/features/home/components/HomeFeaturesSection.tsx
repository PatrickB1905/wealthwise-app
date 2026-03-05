import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import {
  FeatureCardLayout,
  FeaturesSection,
  IconBadge,
  PreviewCard,
  PreviewCardBody,
  PreviewImage,
  SectionEyebrow,
  SplitGrid,
} from '@shared/ui/layout/Styled';

import type { FeatureCard, HighlightItem } from '../types/home';

type Props = {
  featureCards: readonly FeatureCard[];
  highlights: readonly HighlightItem[];
  analyticsScreenshotImg: string;
};

export function HomeFeaturesSection({ featureCards, highlights, analyticsScreenshotImg }: Props) {
  return (
    <>
      <Box id="features" />
      <FeaturesSection component="section" maxWidth="lg">
        <Container maxWidth="lg">
          <Stack spacing={1.2} sx={{ textAlign: 'center', alignItems: 'center' }}>
            <SectionEyebrow>Features</SectionEyebrow>
            <Typography variant="h4" sx={{ fontWeight: 950, letterSpacing: '-0.03em' }}>
              A Complete Portfolio Intelligence Stack
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ maxWidth: 760, mx: 'auto', width: '100%', textAlign: 'center' }}
            >
              From live pricing to benchmark correlation and contextual news, WealthWise connects
              the data that drives your investment decisions into one cohesive platform.
            </Typography>
          </Stack>

          <Grid container spacing={3} justifyContent="center" sx={{ mt: 2.5 }} alignItems="stretch">
            {featureCards.map((f) => {
              const AccentIcon = f.accentIcon.Icon;

              return (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  key={f.title}
                  sx={{
                    display: 'flex',
                    width: '84%',
                  }}
                >
                  <FeatureCardLayout
                    sx={{
                      flex: 1,
                      maxWidth: 'none',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      <IconBadge>
                        <AccentIcon {...(f.accentIcon.props ?? {})} />
                      </IconBadge>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 950 }} gutterBottom>
                          {f.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {f.description}
                        </Typography>
                      </Box>
                    </Stack>
                  </FeatureCardLayout>
                </Grid>
              );
            })}
          </Grid>

          <Box sx={{ mt: 5 }}>
            <SplitGrid>
              <Stack spacing={1.2}>
                <SectionEyebrow>Highlights</SectionEyebrow>
                <Typography variant="h4" sx={{ fontWeight: 950, letterSpacing: '-0.03em' }}>
                  See What Matters, Instantly
                </Typography>
                <Typography color="text.secondary">
                  WealthWise surfaces the changes, exposures, and risks that require your attention
                  — so you can understand your position in seconds, not minutes.
                </Typography>

                <Stack spacing={1.2} sx={{ mt: 1 }}>
                  {highlights.map((row) => {
                    const RowIcon = row.icon.Icon;

                    return (
                      <Stack key={row.title} direction="row" spacing={1.2} alignItems="flex-start">
                        <Box
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: 2,
                            display: 'grid',
                            placeItems: 'center',
                            border: '1px solid rgba(37,99,235,0.16)',
                            background:
                              'linear-gradient(135deg, rgba(37,99,235,0.10), rgba(37,99,235,0.04))',
                            mt: 0.2,
                          }}
                        >
                          <RowIcon {...(row.icon.props ?? {})} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 950, letterSpacing: '-0.02em' }}>
                            {row.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {row.desc}
                          </Typography>
                        </Box>
                      </Stack>
                    );
                  })}
                </Stack>
              </Stack>

              <PreviewCard>
                <PreviewCardBody>
                  <Stack spacing={1.2}>
                    <PreviewImage src={analyticsScreenshotImg} alt="Portfolio preview" />
                  </Stack>
                </PreviewCardBody>
              </PreviewCard>
            </SplitGrid>
          </Box>
        </Container>
      </FeaturesSection>
    </>
  );
}
