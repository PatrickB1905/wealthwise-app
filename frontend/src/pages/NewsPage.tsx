import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  CircularProgress,
  Box,
  Alert,
  List,
  ListItem,
  ListItemText,
  Link
} from '@mui/material';
import NewsAPI from '../api/newsClient';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

interface Position { ticker: string; }
interface Article {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
}

const NewsPage: React.FC = () => {
  const { user } = useAuth();
  const [positions, setPositions] = useState<Position[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchNews = async () => {
      try {
        const posRes = await API.get<Position[]>('/positions?status=open');
        setPositions(posRes.data);
        const symbols = posRes.data.map(p => p.ticker).join(',');
        const newsRes = await NewsAPI.get<Article[]>('/news', { params: { symbols } });
        setArticles(newsRes.data);
      } catch {
        setError('Failed to load news');
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }
  if (!articles.length) {
    return <Typography sx={{ mt: 4 }}>No news found for your positions.</Typography>;
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Latest News for Your Open Positions
      </Typography>
      <List>
        {articles.map((a, i) => (
          <ListItem key={i} alignItems="flex-start">
            <ListItemText
              primary={<Link href={a.url} target="_blank" rel="noopener">{a.title}</Link>}
              secondary={`${a.source} — ${new Date(a.publishedAt).toLocaleDateString()}`}
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default NewsPage;