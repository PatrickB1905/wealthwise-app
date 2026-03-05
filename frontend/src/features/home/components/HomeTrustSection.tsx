import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import {
  PreviewCard,
  PreviewCardBody,
  PreviewImage,
  SectionEyebrow,
  SectionSurface,
  SoftGridBackground,
  SplitGrid,
} from '@shared/ui/layout/Styled';

import type { TrustItem } from '../types/home';

type Props = {
  trustItems: readonly TrustItem[];
  portfolioScreenshotImg: string;
};

export function HomeTrustSection({ trustItems, portfolioScreenshotImg }: Props) {
  return (
    <SectionSurface>
      <SoftGridBackground />
      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        <SplitGrid>
          <Stack spacing={1.2}>
            <SectionEyebrow>Trust</SectionEyebrow>
            <Typography variant="h4" sx={{ fontWeight: 950, letterSpacing: '-0.03em' }}>
              Engineered for Accuracy and Consistency
            </Typography>
            <Typography color="text.secondary">
              WealthWise is designed with structured data modeling, predictable workflows, and
              reliable market integrations to ensure your portfolio metrics remain accurate and
              consistent.
            </Typography>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              {trustItems.map((i) => {
                const TrustIcon = i.icon.Icon;

                return (
                  <Grid item xs={12} sm={4} key={i.title}>
                    <Stack spacing={0.6}>
                      <Typography
                        sx={{ fontWeight: 950, display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <TrustIcon {...(i.icon.props ?? {})} /> {i.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {i.desc}
                      </Typography>
                    </Stack>
                  </Grid>
                );
              })}
            </Grid>
          </Stack>

          <PreviewCard>
            <PreviewCardBody>
              <Stack spacing={1.2}>
                <PreviewImage src={portfolioScreenshotImg} alt="News preview" />
              </Stack>
            </PreviewCardBody>
          </PreviewCard>
        </SplitGrid>
      </Container>
    </SectionSurface>
  );
}
