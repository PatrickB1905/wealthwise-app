import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  Alert
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';
import AnalyticsAPI from '../api/analyticsClient';
import { useAuth } from '../context/AuthContext';

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

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchAnalytics = async () => {
      try {
        const sumRes = await AnalyticsAPI.get<Summary>('/analytics/summary', {
          params: { userId: user.id }
        });
        setSummary(sumRes.data);

        const histRes = await AnalyticsAPI.get<HistoryItem[]>('/analytics/history', {
          params: { userId: user.id, months: 12 }
        });
        setHistory(histRes.data);
      } catch (e: any) {
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !summary) {
    return <Alert severity="error">{error || 'No data available'}</Alert>;
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">Money Invested</Typography>
              <Typography variant="h5">${summary.invested.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">Total P/L ($)</Typography>
              <Typography variant="h5">${summary.totalPL.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">Total P/L (%)</Typography>
              <Typography variant="h5">{summary.totalPLPercent.toFixed(2)}%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">Open Positions</Typography>
              <Typography variant="h5">{summary.openCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">Closed Positions</Typography>
              <Typography variant="h5">{summary.closedCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom>
        Portfolio Value Over Last 12 Months
      </Typography>
      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#1976d2"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Container>
  );
};

export default AnalyticsPage;