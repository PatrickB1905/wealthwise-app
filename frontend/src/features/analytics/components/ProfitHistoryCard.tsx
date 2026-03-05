import React from 'react';
import ToggleButton from '@mui/material/ToggleButton';

import { RANGE_OPTIONS, CHART_Y_AXIS_WIDTH } from '../constants';
import type { HistoryItem } from '../types/analytics';
import {
  AnalyticsChartFrame,
  AnalyticsHeaderActions,
  AnalyticsHeaderRow,
  AnalyticsLabelInline,
  AnalyticsRangeToggleGroup,
  ControlsLabel,
  PageCard,
  SectionContent,
  SectionHeader,
} from '@shared/ui';
import { TitleWithTip, InfoTip } from './AnalyticsInfoTip';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';

type ChartConfig = {
  gridStroke: string;
  axisTick: { fill: string; fontSize: number; fontWeight: number };
  softTooltipStyle: React.CSSProperties;
  tooltipCursor: { stroke: string; strokeOpacity: number; strokeDasharray: string };
  primary: string;
  textPrimary: string;
  areaFillId: string;
};

type Props = {
  rangeMonths: number;
  onRangeMonthsChange: (next: number) => void;
  history: HistoryItem[];
  chart: ChartConfig;
};

export const ProfitHistoryCard: React.FC<Props> = ({
  rangeMonths,
  onRangeMonthsChange,
  history,
  chart,
}) => {
  const title = `Profit Over Last ${rangeMonths} Month${rangeMonths > 1 ? 's' : ''}`;

  return (
    <PageCard>
      <SectionHeader
        title={
          <AnalyticsHeaderRow>
            <TitleWithTip
              label={title}
              tip="Rolling profit series for the selected range. Values are aggregated across tracked positions."
            />

            <AnalyticsHeaderActions>
              <AnalyticsLabelInline>
                <ControlsLabel
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Profit history range
                </ControlsLabel>
                <InfoTip
                  ariaLabel="Profit history range info"
                  title="Controls how far back the profit history chart looks (e.g., 3M vs 12M)."
                />
              </AnalyticsLabelInline>

              <AnalyticsRangeToggleGroup
                value={rangeMonths}
                exclusive
                onChange={(_, val: number | null) => {
                  if (val) onRangeMonthsChange(val);
                }}
                aria-label="time range"
                sx={{
                  width: { xs: '100%', sm: 'auto' },
                  '& .MuiToggleButton-root': {
                    flex: { xs: 1, sm: 'initial' },
                    borderRadius: 2,
                    py: 1,
                  },
                }}
              >
                {RANGE_OPTIONS.map((opt) => (
                  <ToggleButton key={opt.months} value={opt.months} sx={{ fontWeight: 700 }}>
                    {opt.label}
                  </ToggleButton>
                ))}
              </AnalyticsRangeToggleGroup>
            </AnalyticsHeaderActions>
          </AnalyticsHeaderRow>
        }
        subheader="Rolling profit for the selected range"
      />

      <SectionContent>
        <AnalyticsChartFrame>
          <ResponsiveContainer>
            <AreaChart data={history} margin={{ top: 10, right: 12, left: 6, bottom: 8 }}>
              <defs>
                <linearGradient id={chart.areaFillId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chart.primary} stopOpacity={0.22} />
                  <stop offset="60%" stopColor={chart.primary} stopOpacity={0.08} />
                  <stop offset="100%" stopColor={chart.primary} stopOpacity={0} />
                </linearGradient>
              </defs>

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
                formatter={(val: number) => [`$${Number(val).toFixed(2)}`, 'P/L']}
              />

              <Area
                type="monotone"
                dataKey="value"
                stroke={chart.primary}
                strokeWidth={3}
                fill={`url(#${chart.areaFillId})`}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </AnalyticsChartFrame>
      </SectionContent>
    </PageCard>
  );
};
