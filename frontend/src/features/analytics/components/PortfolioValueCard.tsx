import React from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { CHART_Y_AXIS_WIDTH } from '../constants';
import type { PerformanceResponse } from '../types/analytics';
import { AnalyticsChartFrame, PageCard, SectionContent, SectionHeader } from '@shared/ui';
import { TitleWithTip } from './AnalyticsInfoTip';

type ChartConfig = {
  gridStroke: string;
  axisTick: { fill: string; fontSize: number; fontWeight: number };
  softTooltipStyle: React.CSSProperties;
  tooltipCursor: { stroke: string; strokeOpacity: number; strokeDasharray: string };
  primary: string;
  textPrimary: string;
};

type Props = {
  days: number;
  perf: PerformanceResponse;
  chart: ChartConfig;
};

export const PortfolioValueCard: React.FC<Props> = ({ days, perf, chart }) => {
  return (
    <PageCard>
      <SectionHeader
        title={
          <TitleWithTip
            label={`Portfolio Value (${days}D)`}
            tip="Portfolio value series for the selected window."
          />
        }
        subheader="Value series for the selected window"
      />

      <SectionContent>
        <AnalyticsChartFrame>
          <ResponsiveContainer>
            <LineChart data={perf.points ?? []} margin={{ top: 10, right: 12, left: 6, bottom: 8 }}>
              <CartesianGrid
                stroke={chart.gridStroke}
                strokeOpacity={0.6}
                strokeDasharray="2 6"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                tick={chart.axisTick}
                tickLine={false}
                axisLine={false}
                minTickGap={18}
                height={28}
              />

              <YAxis
                width={CHART_Y_AXIS_WIDTH}
                tick={chart.axisTick}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val: number) => `$${Number(val).toFixed(0)}`}
                domain={['auto', 'auto']}
              />

              <RechartsTooltip
                cursor={chart.tooltipCursor}
                contentStyle={chart.softTooltipStyle}
                labelStyle={{ fontWeight: 900 }}
                itemStyle={{ color: chart.textPrimary, fontWeight: 700 }}
                formatter={(val: number) => [`$${Number(val).toFixed(2)}`, 'Value']}
              />

              <Line
                type="monotone"
                dataKey="portfolioValue"
                stroke={chart.primary}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </AnalyticsChartFrame>
      </SectionContent>
    </PageCard>
  );
};
