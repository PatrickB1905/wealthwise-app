import Skeleton from '@mui/material/Skeleton';

import {
  Grid3,
  Grid4,
  MetricCard,
  PageCard,
  SectionContent,
  SectionHeader,
  SpacedSection,
  StyledContainer,
  MetricValue,
} from '@shared/ui';

export function AnalyticsLoading() {
  return (
    <StyledContainer>
      <Grid3>
        {Array.from({ length: 3 }).map((_, i) => (
          <MetricCard key={`kpi_${i}`}>
            <SectionHeader title={<Skeleton width="45%" />} />
            <SectionContent>
              <MetricValue tone="neutral" variant="h4">
                <Skeleton height={40} width="55%" />
              </MetricValue>
              <Skeleton width="70%" />
            </SectionContent>
          </MetricCard>
        ))}
      </Grid3>

      <SpacedSection>
        <Grid4>
          {Array.from({ length: 4 }).map((_, i) => (
            <MetricCard key={`risk_${i}`}>
              <SectionHeader title={<Skeleton width="55%" />} />
              <SectionContent>
                <Skeleton height={36} width="45%" />
              </SectionContent>
            </MetricCard>
          ))}
        </Grid4>
      </SpacedSection>

      <SpacedSection>
        <PageCard>
          <SectionHeader title={<Skeleton width="40%" />} />
          <SectionContent>
            <Skeleton height={320} />
          </SectionContent>
        </PageCard>
      </SpacedSection>
    </StyledContainer>
  );
}
