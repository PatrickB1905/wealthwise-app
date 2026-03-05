import React from 'react';

import {
  InlineErrorAlert,
  InlineInfoAlert,
  PageCard,
  SectionContent,
  SectionHeader,
  SpacedSection,
  StyledContainer,
  CenteredStack,
  EmptyStateTitle,
  EmptyStateText,
} from '@shared/ui';
import { useAnalyticsPage } from '../hooks/useAnalyticsPage';
import { AnalyticsLoading } from '../components/AnalyticsLoading';
import { AnalyticsControls } from '../components/AnalyticsControls';
import { AnalyticsTopKpis } from '../components/AnalyticsTopKpis';
import { AnalyticsRiskKpis } from '../components/AnalyticsRiskKpis';
import { ProfitHistoryCard } from '../components/ProfitHistoryCard';
import { PortfolioValueCard } from '../components/PortfolioValueCard';
import { HoldingsAllocationCard } from '../components/HoldingsAllocationCard';

const AnalyticsPage: React.FC = () => {
  const vm = useAnalyticsPage();

  if (!vm.user) {
    return (
      <StyledContainer>
        <InlineInfoAlert severity="info">Please log in to view analytics.</InlineInfoAlert>
      </StyledContainer>
    );
  }

  if (vm.anyLoading && !vm.ready) {
    return <AnalyticsLoading />;
  }

  return (
    <StyledContainer>
      {vm.errorMsg ? <InlineErrorAlert severity="error">{vm.errorMsg}</InlineErrorAlert> : null}

      <AnalyticsControls
        benchmark={vm.benchmark}
        onBenchmarkChange={vm.setBenchmark}
        days={vm.days}
        onDaysChange={vm.setDays}
        updatedLabel={vm.updatedLabel}
      />

      {!vm.ready || !vm.summary || !vm.overview || !vm.perf || !vm.risk ? (
        <PageCard>
          <SectionHeader title="Analytics" subheader="We couldn’t load your analytics yet." />
          <SectionContent>
            <CenteredStack>
              <EmptyStateTitle variant="h6">Preparing your dashboard</EmptyStateTitle>
              <EmptyStateText variant="body2">
                This usually resolves in a few seconds. If it persists, try refreshing.
              </EmptyStateText>
            </CenteredStack>
          </SectionContent>
        </PageCard>
      ) : (
        <>
          <AnalyticsTopKpis
            summary={vm.summary}
            plTone={vm.plTone}
            pctTone={vm.pctTone}
            money={vm.money}
            pct={vm.pct}
          />

          <SpacedSection>
            <AnalyticsRiskKpis risk={vm.risk} num={vm.num} fixed={vm.fixed} pct={vm.pct} />
          </SpacedSection>

          <SpacedSection>
            <ProfitHistoryCard
              rangeMonths={vm.rangeMonths}
              onRangeMonthsChange={vm.setRangeMonths}
              history={vm.history}
              chart={vm.chart}
            />
          </SpacedSection>

          <SpacedSection>
            <PortfolioValueCard days={vm.days} perf={vm.perf} chart={vm.chart} />
          </SpacedSection>

          <SpacedSection>
            <HoldingsAllocationCard
              overview={vm.overview}
              num={vm.num}
              money={vm.money}
              pct={vm.pct}
              fixed={vm.fixed}
              toneFromNumber={vm.toneFromNumber}
            />
          </SpacedSection>
        </>
      )}
    </StyledContainer>
  );
};

export default AnalyticsPage;
