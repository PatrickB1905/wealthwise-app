import React, { useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import ToggleButton from '@mui/material/ToggleButton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { useTheme } from '@mui/material/styles'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useQuery } from '@tanstack/react-query'

import AnalyticsAPI from '../api/analyticsClient'
import { useAuth } from '../context/useAuth'
import { usePositionWS } from '../hooks/usePositionWS'
import {
  AnalyticsChartBox,
  AnalyticsRangeToggleGroup,
  CenteredBox,
  MetricCard,
  MetricValue,
  PageCard,
  PageContainer,
  SectionContent,
  SectionHeader,
  StyledContainer,
} from '../components/layout/Styled'

type Summary = {
  invested: number
  totalPL: number
  totalPLPercent: number
  openCount: number
  closedCount: number
}

type HistoryItem = {
  date: string
  value: number
}

type HoldingItem = {
  ticker: string
  quantity: number
  avgCost: number
  currentPrice: number | null
  marketValue: number | null
  unrealizedPL: number | null
  unrealizedPLPercent: number | null
  weight: number | null
}

type Overview = {
  summary: Summary
  holdings: HoldingItem[]
  concentration: {
    top5WeightPercent: number
    hhi: number
  }
}

type PerformancePoint = {
  date: string
  portfolioValue: number
  cumulativeReturnPercent: number
}

type PerformanceResponse = {
  days: number
  points: PerformancePoint[]
}

type RiskResponse = {
  days: number
  benchmark: string
  volatilityAnnualized: number
  maxDrawdownPercent: number
  sharpeAnnualized: number
  beta: number
  correlation: number
}

type Tone = 'positive' | 'negative' | 'neutral'

function toneFromNumber(val: number): Tone {
  if (val > 0) return 'positive'
  if (val < 0) return 'negative'
  return 'neutral'
}

function isFiniteNumber(val: unknown): val is number {
  return typeof val === 'number' && Number.isFinite(val)
}

function num(val: unknown, fallback = 0): number {
  return isFiniteNumber(val) ? val : fallback
}

function money(val: unknown): string {
  return num(val).toFixed(2)
}

function pct(val: unknown): string {
  return num(val).toFixed(2)
}

function fixed(val: unknown, digits: number, fallback = 0): string {
  return num(val, fallback).toFixed(digits)
}

const RANGE_OPTIONS = [
  { label: '12 M', months: 12 },
  { label: '6 M', months: 6 },
  { label: '3 M', months: 3 },
  { label: '1 M', months: 1 },
] as const

const AnalyticsPage: React.FC = () => {
  const theme = useTheme()
  const { user } = useAuth()
  usePositionWS()

  const [range, setRange] = useState<number>(12)

  const commonQueryOpts = {
    enabled: Boolean(user),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    staleTime: 10_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
  } as const

  const summaryQuery = useQuery<Summary, Error>({
    queryKey: ['analytics', 'summary'],
    queryFn: () => AnalyticsAPI.get<Summary>('/analytics/summary').then((res) => res.data),
    ...commonQueryOpts,
  })

  const historyQuery = useQuery<HistoryItem[], Error>({
    queryKey: ['analytics', 'history', range],
    queryFn: () =>
      AnalyticsAPI.get<HistoryItem[]>('/analytics/history', {
        params: { months: range },
      }).then((res) => res.data),
    ...commonQueryOpts,
  })

  const overviewQuery = useQuery<Overview, Error>({
    queryKey: ['analytics', 'overview'],
    queryFn: () => AnalyticsAPI.get<Overview>('/analytics/overview').then((res) => res.data),
    ...commonQueryOpts,
  })

  const perfQuery = useQuery<PerformanceResponse, Error>({
    queryKey: ['analytics', 'performance', 365],
    queryFn: () =>
      AnalyticsAPI.get<PerformanceResponse>('/analytics/performance', {
        params: { days: 365 },
      }).then((res) => res.data),
    ...commonQueryOpts,
  })

  const riskQuery = useQuery<RiskResponse, Error>({
    queryKey: ['analytics', 'risk', 365, 'SPY'],
    queryFn: () =>
      AnalyticsAPI.get<RiskResponse>('/analytics/risk', {
        params: { days: 365, benchmark: 'SPY' },
      }).then((res) => res.data),
    ...commonQueryOpts,
  })

  const summary = summaryQuery.data
  const history = historyQuery.data ?? []
  const overview = overviewQuery.data
  const perf = perfQuery.data
  const risk = riskQuery.data

  const loading =
    summaryQuery.isLoading ||
    historyQuery.isLoading ||
    overviewQuery.isLoading ||
    perfQuery.isLoading ||
    riskQuery.isLoading

  const errorMsg =
    summaryQuery.error?.message ||
    historyQuery.error?.message ||
    overviewQuery.error?.message ||
    perfQuery.error?.message ||
    riskQuery.error?.message

  const plTone = useMemo(() => toneFromNumber(num(summary?.totalPL, 0)), [summary?.totalPL])
  const pctTone = useMemo(
    () => toneFromNumber(num(summary?.totalPLPercent, 0)),
    [summary?.totalPLPercent]
  )

  const tooltipStyle = useMemo(
    () => ({
      borderRadius: theme.shape.borderRadius,
      boxShadow: theme.shadows[2],
      borderColor: theme.palette.divider,
    }),
    [theme]
  )

  const readyToRender = Boolean(summary) && Boolean(overview) && Boolean(perf) && Boolean(risk)

  return (
    <PageContainer>
      <StyledContainer>
        {loading ? (
          <CenteredBox>
            <CircularProgress />
          </CenteredBox>
        ) : errorMsg ? (
          <Alert severity="error">{errorMsg}</Alert>
        ) : readyToRender && summary && overview && perf && risk ? (
          <>
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                mb: 2,
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              }}
            >
              <MetricCard>
                <SectionHeader
                  title="Total Money Invested"
                  titleTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                />
                <SectionContent>
                  <MetricValue tone="neutral">${money(summary.invested)}</MetricValue>
                </SectionContent>
              </MetricCard>

              <MetricCard>
                <SectionHeader
                  title="Total P/L ($)"
                  titleTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                />
                <SectionContent>
                  <MetricValue tone={plTone}>${money(summary.totalPL)}</MetricValue>
                </SectionContent>
              </MetricCard>

              <MetricCard>
                <SectionHeader
                  title="Total P/L (%)"
                  titleTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                />
                <SectionContent>
                  <MetricValue tone={pctTone}>{pct(summary.totalPLPercent)}%</MetricValue>
                </SectionContent>
              </MetricCard>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gap: 2,
                mb: 2,
                gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
              }}
            >
              <MetricCard>
                <SectionHeader
                  title="Annual Volatility"
                  titleTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                />
                <SectionContent>
                  <MetricValue tone="neutral">
                    {fixed(num(risk.volatilityAnnualized) * 100, 2)}%
                  </MetricValue>
                </SectionContent>
              </MetricCard>

              <MetricCard>
                <SectionHeader
                  title="Max Drawdown"
                  titleTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                />
                <SectionContent>
                  <MetricValue tone="negative">{pct(risk.maxDrawdownPercent)}%</MetricValue>
                </SectionContent>
              </MetricCard>

              <MetricCard>
                <SectionHeader
                  title="Sharpe (Annual)"
                  titleTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                />
                <SectionContent>
                  <MetricValue tone="neutral">{fixed(risk.sharpeAnnualized, 2)}</MetricValue>
                </SectionContent>
              </MetricCard>

              <MetricCard>
                <SectionHeader
                  title="Beta vs SPY"
                  titleTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                />
                <SectionContent>
                  <MetricValue tone="neutral">{fixed(risk.beta, 2)}</MetricValue>
                </SectionContent>
              </MetricCard>
            </Box>

            <CenteredBox>
              <AnalyticsRangeToggleGroup
                value={range}
                exclusive
                onChange={(_, val: number | null) => {
                  if (val) setRange(val)
                }}
                aria-label="time range"
              >
                {RANGE_OPTIONS.map((opt) => (
                  <ToggleButton key={opt.months} value={opt.months}>
                    {opt.label}
                  </ToggleButton>
                ))}
              </AnalyticsRangeToggleGroup>
            </CenteredBox>

            <PageCard>
              <SectionHeader
                title={`Profit Over Last ${range} Month${range > 1 ? 's' : ''}`}
                titleTypographyProps={{ variant: 'h6' }}
              />
              <SectionContent>
                <AnalyticsChartBox>
                  <ResponsiveContainer>
                    <LineChart data={history}>
                      <CartesianGrid stroke={theme.palette.divider} strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                      />
                      <YAxis
                        tickFormatter={(val: number) => `$${Number(val).toFixed(0)}`}
                        tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                      />
                      <Tooltip
                        formatter={(val: number) => [`$${Number(val).toFixed(2)}`, 'P/L']}
                        contentStyle={tooltipStyle}
                        labelStyle={{ fontWeight: 600 }}
                        itemStyle={{ color: theme.palette.text.primary }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={theme.palette.primary.main}
                        strokeWidth={3}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </AnalyticsChartBox>
              </SectionContent>
            </PageCard>

            <PageCard>
              <SectionHeader
                title="Portfolio Value (Last 12 Months)"
                titleTypographyProps={{ variant: 'h6' }}
              />
              <SectionContent>
                <AnalyticsChartBox>
                  <ResponsiveContainer>
                    <LineChart data={perf.points ?? []}>
                      <CartesianGrid stroke={theme.palette.divider} strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                      />
                      <YAxis
                        tickFormatter={(val: number) => `$${Number(val).toFixed(0)}`}
                        tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                      />
                      <Tooltip
                        formatter={(val: number) => [`$${Number(val).toFixed(2)}`, 'Value']}
                        contentStyle={tooltipStyle}
                        labelStyle={{ fontWeight: 600 }}
                        itemStyle={{ color: theme.palette.text.primary }}
                      />
                      <Line
                        type="monotone"
                        dataKey="portfolioValue"
                        stroke={theme.palette.primary.main}
                        strokeWidth={3}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </AnalyticsChartBox>
              </SectionContent>
            </PageCard>

            <PageCard>
              <SectionHeader title="Holdings Allocation" titleTypographyProps={{ variant: 'h6' }} />
              <SectionContent>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Concentration — Top 5 Weight: {fixed(overview.concentration?.top5WeightPercent, 2)}
                  % • HHI: {fixed(overview.concentration?.hhi, 4)}
                </Alert>

                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Ticker</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Avg Cost</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Market Value</TableCell>
                      <TableCell align="right">Unrealized P/L</TableCell>
                      <TableCell align="right">Weight</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(overview.holdings ?? []).map((h) => (
                      <TableRow key={h.ticker}>
                        <TableCell>{h.ticker}</TableCell>
                        <TableCell align="right">{fixed(h.quantity, 4)}</TableCell>
                        <TableCell align="right">${money(h.avgCost)}</TableCell>
                        <TableCell align="right">
                          {h.currentPrice != null ? `$${money(h.currentPrice)}` : '—'}
                        </TableCell>
                        <TableCell align="right">
                          {h.marketValue != null ? `$${money(h.marketValue)}` : '—'}
                        </TableCell>
                        <TableCell align="right">
                          {h.unrealizedPL != null
                            ? `$${money(h.unrealizedPL)} (${pct(h.unrealizedPLPercent)}%)`
                            : '—'}
                        </TableCell>
                        <TableCell align="right">
                          {h.weight != null ? `${pct(h.weight)}%` : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </SectionContent>
            </PageCard>
          </>
        ) : (
          <Alert severity="info">Analytics data is not available yet. Please try again in a moment.</Alert>
        )}
      </StyledContainer>
    </PageContainer>
  )
}

export default AnalyticsPage