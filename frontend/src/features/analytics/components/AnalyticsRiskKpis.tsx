import React from 'react';
import Typography from '@mui/material/Typography';

import type { RiskResponse } from '../types/analytics';
import {
  Grid4,
  MetricCard,
  MetricValue,
  SectionContent,
  SectionHeader,
  AppTooltip,
} from '@shared/ui';
import { TitleWithTip } from './AnalyticsInfoTip';

type Props = {
  risk: RiskResponse;
  num: (val: unknown, fallback?: number) => number;
  fixed: (val: unknown, digits: number, fallback?: number) => string;
  pct: (val: unknown) => string;
};

export const AnalyticsRiskKpis: React.FC<Props> = ({ risk, num, fixed, pct }) => {
  return (
    <Grid4>
      <MetricCard>
        <SectionHeader
          title={
            <TitleWithTip
              label="Volatility (Annual)"
              tip="Annualized volatility estimate (higher = more swing)."
            />
          }
          subheader="Risk measure"
        />
        <SectionContent>
          <MetricValue tone="neutral" variant="h5">
            {fixed(num(risk.volatilityAnnualized) * 100, 2)}%
          </MetricValue>
        </SectionContent>
      </MetricCard>

      <MetricCard>
        <SectionHeader
          title={
            <TitleWithTip
              label="Max Drawdown"
              tip="Largest peak-to-trough decline over the selected window."
            />
          }
          subheader="Peak-to-trough loss"
        />
        <SectionContent>
          <MetricValue tone="negative" variant="h5">
            {pct(risk.maxDrawdownPercent)}%
          </MetricValue>
        </SectionContent>
      </MetricCard>

      <MetricCard>
        <SectionHeader
          title={
            <TitleWithTip
              label="Sharpe (Annual)"
              tip="Risk-adjusted return estimate (higher is better)."
            />
          }
          subheader="Return vs risk"
        />
        <SectionContent>
          <MetricValue tone="neutral" variant="h5">
            {fixed(risk.sharpeAnnualized, 2)}
          </MetricValue>
        </SectionContent>
      </MetricCard>

      <MetricCard>
        <SectionHeader
          title={
            <TitleWithTip
              label={`Correlation (${risk.benchmark})`}
              tip="How closely your portfolio moves with the selected benchmark (1.00 = very similar)."
            />
          }
          subheader="Market relationship"
        />
        <SectionContent>
          <MetricValue tone="neutral" variant="h5">
            {fixed(risk.correlation, 2)}
          </MetricValue>
          <Typography variant="body2" color="text.secondary">
            <AppTooltip title="Beta estimates sensitivity to the benchmark (1.0 ≈ moves in line with the benchmark).">
              <span>Beta: {fixed(risk.beta, 2)}</span>
            </AppTooltip>
          </Typography>
        </SectionContent>
      </MetricCard>
    </Grid4>
  );
};
