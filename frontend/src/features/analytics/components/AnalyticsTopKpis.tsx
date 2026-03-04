import React from 'react';
import Typography from '@mui/material/Typography';

import type { Summary, Tone } from '../types/analytics';
import {
  Grid3,
  MetricCard,
  MetricHeaderRow,
  MetricValue,
  SectionContent,
  SectionHeader,
} from '@shared/ui';
import { TitleWithTip } from './AnalyticsInfoTip';

type Props = {
  summary: Summary;
  plTone: Tone;
  pctTone: Tone;
  money: (val: unknown) => string;
  pct: (val: unknown) => string;
};

export const AnalyticsTopKpis: React.FC<Props> = ({ summary, plTone, pctTone, money, pct }) => {
  return (
    <Grid3>
      <MetricCard>
        <SectionHeader
          title={
            <MetricHeaderRow>
              <TitleWithTip
                label="Total Invested"
                tip="Total cost basis across all tracked positions (buy price × quantity)."
              />
            </MetricHeaderRow>
          }
          subheader="Capital currently tracked"
        />
        <SectionContent>
          <MetricValue tone="neutral" variant="h4">
            ${money(summary.invested)}
          </MetricValue>
          <Typography variant="body2" color="text.secondary">
            Open positions: {summary.openCount} • Closed positions: {summary.closedCount}
          </Typography>
        </SectionContent>
      </MetricCard>

      <MetricCard>
        <SectionHeader
          title={
            <TitleWithTip
              label="Total P/L"
              tip="Profit/loss in dollars across all tracked positions."
            />
          }
          subheader="Profit / loss in dollars"
        />
        <SectionContent>
          <MetricValue tone={plTone} variant="h4">
            ${money(summary.totalPL)}
          </MetricValue>
          <Typography variant="body2" color="text.secondary">
            Aggregated across all tracked positions
          </Typography>
        </SectionContent>
      </MetricCard>

      <MetricCard>
        <SectionHeader
          title={
            <TitleWithTip
              label="Total Return"
              tip="Total P/L divided by invested capital (portfolio-level return)."
            />
          }
          subheader="Profit / loss in percent"
        />
        <SectionContent>
          <MetricValue tone={pctTone} variant="h4">
            {pct(summary.totalPLPercent)}%
          </MetricValue>
          <Typography variant="body2" color="text.secondary">
            Based on invested capital
          </Typography>
        </SectionContent>
      </MetricCard>
    </Grid3>
  );
};
