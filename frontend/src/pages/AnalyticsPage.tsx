import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  useTheme,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AnalyticsAPI from '../api/analyticsClient';
import { useAuth } from '../context/AuthContext';
import { usePositionWS } from '../hooks/usePositionWS';
import {
  PageContainer,
  StyledContainer,
  PageCard,
  SectionHeader,
  SectionContent,
  CenteredBox,
} from '../components/layout/Styled';

interface Summary {
  invested: number;
  totalPL: number;
  totalPLPercent: number;
  openCount: number;
  closedCount: number;
}

interface HistoryItem {
  date: string;
  value: number;
}

const POS_COLOR = '#10b42c';
const NEG_COLOR = '#f83c44';
const ZERO_COLOR = '#000000';

const RANGE_OPTIONS = [
  { label: '12 M', months: 12 },
  { label: '6 M',  months: 6 },
  { label: '3 M',  months: 3 },
  { label: '1 M',  months: 1 },
];

const AnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const qc = useQueryClient();
  const { user } = useAuth();

  usePositionWS();

  const [range, setRange] = useState(12);

  const summaryQuery = useQuery<Summary, Error>({
    queryKey: ['analytics', 'summary'],
    queryFn: () =>
      AnalyticsAPI.get<Summary>('/analytics/summary', {
        params: { userId: user!.id },
      }).then(r => r.data),
    enabled: Boolean(user),
    refetchOnWindowFocus: false,
  });

  const historyQuery = useQuery<HistoryItem[], Error>({
    queryKey: ['analytics', 'history', range],
    queryFn: () =>
      AnalyticsAPI.get<HistoryItem[]>('/analytics/history', {
        params: { userId: user!.id, months: range },
      }).then(r => r.data),
    enabled: Boolean(user),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    qc.invalidateQueries(['analytics', 'summary']);
    qc.invalidateQueries(['analytics', 'history', range]);
  }, [qc, range]);

  const summary = summaryQuery.data;
  const history = historyQuery.data || [];
  const loading = summaryQuery.isLoading || historyQuery.isLoading;
  const errorMsg = summaryQuery.error?.message || historyQuery.error?.message;

  const plColor = useMemo(() => {
    if (!summary) return ZERO_COLOR;
    return summary.totalPL > 0
      ? POS_COLOR
      : summary.totalPL < 0
      ? NEG_COLOR
      : ZERO_COLOR;
  }, [summary]);

  const pctColor = useMemo(() => {
    if (!summary) return ZERO_COLOR;
    return summary.totalPLPercent > 0
      ? POS_COLOR
      : summary.totalPLPercent < 0
      ? NEG_COLOR
      : ZERO_COLOR;
  }, [summary]);

  const handleRange = (_: React.MouseEvent<HTMLElement>, val: number) => {
    if (val) setRange(val);
  };

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
            <Box
              display="flex"
              flexWrap="wrap"
              gap={2}
              mb={3}
            >
              {[
                {
                  title: 'Money Invested',
                  value: `$${summary.invested.toFixed(2)}`,
                  color: theme.palette.text.primary,
                },
                {
                  title: 'Total P/L ($)',
                  value: `$${summary.totalPL.toFixed(2)}`,
                  color: plColor,
                },
                {
                  title: 'Total P/L (%)',
                  value: `${summary.totalPLPercent.toFixed(2)}%`,
                  color: pctColor,
                },
              ].map(item => (
                <Box
                  key={item.title}
                  flex="1 1 calc(33.333% - 16px)"
                  minWidth="200px"
                >
                  <PageCard>
                    <SectionHeader
                      title={item.title}
                      titleTypographyProps={{
                        variant: 'subtitle2',
                        color: 'textSecondary',
                      }}
                    />
                    <SectionContent>
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        sx={{ color: item.color }}
                      >
                        {item.value}
                      </Typography>
                    </SectionContent>
                  </PageCard>
                </Box>
              ))}
            </Box>

            <Box textAlign="center" mb={2}>
              <ToggleButtonGroup
                value={range}
                exclusive
                onChange={handleRange}
                aria-label="time range"
                sx={{
                  '& .MuiToggleButton-root': {
                    textTransform: 'none',
                    fontWeight: theme.typography.fontWeightMedium,
                  },
                }}
              >
                {RANGE_OPTIONS.map(opt => (
                  <ToggleButton key={opt.months} value={opt.months}>
                    {opt.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            <PageCard>
              <SectionHeader
                title={`Profit Over Last ${range} Month${range > 1 ? 's' : ''}`}
                titleTypographyProps={{ variant: 'h6' }}
              />
              <SectionContent>
                <Box sx={{ width: '100%', height: 350 }}>
                  <ResponsiveContainer>
                    <LineChart data={history}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={theme.palette.divider}
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                      />
                      <YAxis
                        tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 8,
                          boxShadow: theme.shadows[2],
                          borderColor: theme.palette.divider,
                        }}
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
                </Box>
              </SectionContent>
            </PageCard>
          </>
        ) : null}
      </StyledContainer>
    </PageContainer>
  );
};

export default AnalyticsPage;