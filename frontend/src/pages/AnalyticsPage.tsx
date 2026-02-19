import React, { useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import ToggleButton from '@mui/material/ToggleButton'
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

type Tone = 'positive' | 'negative' | 'neutral'

function toneFromNumber(val: number): Tone {
  if (val > 0) return 'positive'
  if (val < 0) return 'negative'
  return 'neutral'
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

  const summaryQuery = useQuery<Summary, Error>({
    queryKey: ['analytics', 'summary', user?.id],
    queryFn: () =>
      AnalyticsAPI.get<Summary>('/analytics/summary', { params: { userId: user!.id } }).then(
        (res) => res.data
      ),
    enabled: Boolean(user),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  })

  const historyQuery = useQuery<HistoryItem[], Error>({
    queryKey: ['analytics', 'history', user?.id, range],
    queryFn: () =>
      AnalyticsAPI.get<HistoryItem[]>('/analytics/history', {
        params: { userId: user!.id, months: range },
      }).then((res) => res.data),
    enabled: Boolean(user),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  })

  const summary = summaryQuery.data
  const history = historyQuery.data ?? []
  const loading = summaryQuery.isLoading || historyQuery.isLoading
  const errorMsg = summaryQuery.error?.message || historyQuery.error?.message

  const plTone = useMemo(() => (summary ? toneFromNumber(summary.totalPL) : 'neutral'), [summary])
  const pctTone = useMemo(
    () => (summary ? toneFromNumber(summary.totalPLPercent) : 'neutral'),
    [summary]
  )

  const tooltipStyle = useMemo(
    () => ({
      borderRadius: theme.shape.borderRadius,
      boxShadow: theme.shadows[2],
      borderColor: theme.palette.divider,
    }),
    [theme]
  )

  return (
    <PageContainer>
      <StyledContainer>
        {loading ? (
          <CenteredBox>
            <CircularProgress />
          </CenteredBox>
        ) : errorMsg ? (
          <Alert severity="error">{errorMsg}</Alert>
        ) : summary ? (
          <>
            <Grid container spacing={2} sx={{ marginBottom: 2 }}>
              <Grid item xs={12} md={4}>
                <MetricCard>
                  <SectionHeader
                    title="Total Money Invested"
                    titleTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                  />
                  <SectionContent>
                    <MetricValue tone="neutral">${summary.invested.toFixed(2)}</MetricValue>
                  </SectionContent>
                </MetricCard>
              </Grid>

              <Grid item xs={12} md={4}>
                <MetricCard>
                  <SectionHeader
                    title="Total P/L ($)"
                    titleTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                  />
                  <SectionContent>
                    <MetricValue tone={plTone}>${summary.totalPL.toFixed(2)}</MetricValue>
                  </SectionContent>
                </MetricCard>
              </Grid>

              <Grid item xs={12} md={4}>
                <MetricCard>
                  <SectionHeader
                    title="Total P/L (%)"
                    titleTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                  />
                  <SectionContent>
                    <MetricValue tone={pctTone}>{summary.totalPLPercent.toFixed(2)}%</MetricValue>
                  </SectionContent>
                </MetricCard>
              </Grid>
            </Grid>

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
                      <XAxis dataKey="date" tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                      <YAxis
                        tickFormatter={(val: number) => `$${val.toFixed(0)}`}
                        tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                      />
                      <Tooltip
                        formatter={(val: number) => [`$${val.toFixed(2)}`, 'P/L']}
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
          </>
        ) : null}
      </StyledContainer>
    </PageContainer>
  )
}

export default AnalyticsPage
