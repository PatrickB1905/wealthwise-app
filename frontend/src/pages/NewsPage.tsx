import React, { useState, useEffect } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import API from '../api/axios';
import NewsAPI from '../api/newsClient';
import { useAuth } from '../context/AuthContext';
import {
  PageContainer,
  StyledContainer,
  PageCard,
  SectionHeader,
  SectionContent,
  CenteredBox,
} from '../components/layout/Styled';

interface Position { ticker: string; }
interface Article {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
}

const NewsPage: React.FC = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [noPositions, setNoPositions] = useState(false);

  useEffect(() => {
    if (!user) return;

    (async () => {
      setLoading(true);
      setError('');
      try {
        const posRes = await API.get<Position[]>('/positions?status=open');
        const positions = posRes.data;

        if (positions.length === 0) {
          setNoPositions(true);
          setArticles([]);
          return;
        }

        setNoPositions(false);
        const symbols = positions.map(p => p.ticker).join(',');
        const newsRes = await NewsAPI.get<Article[]>('/news', {
          params: { symbols },
        });
        setArticles(newsRes.data);
      } catch {
        setError('Failed to load news');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) {
    return (
      <PageContainer>
        <StyledContainer>
          <CenteredBox>
            <CircularProgress />
          </CenteredBox>
        </StyledContainer>
      </PageContainer>
    );
  }

  if (noPositions) {
    return (
      <PageContainer>
        <StyledContainer>
          <PageCard>
            <SectionHeader title="No Open Positions" />
            <SectionContent>
              <Typography variant="h6" align="center" gutterBottom>
                You have no open positions.
              </Typography>
              <Typography variant="body1" color="textSecondary" align="center">
                Add positions to your portfolio to see curated news headlines here.
              </Typography>
              <CenteredBox sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  component={RouterLink}
                  to="/app/positions"
                >
                  Add Position
                </Button>
              </CenteredBox>
            </SectionContent>
          </PageCard>
        </StyledContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <StyledContainer>
        <PageCard>
          <SectionHeader title="Latest News for Your Open Positions" />
          <SectionContent>
            {error ? (
              <Alert severity="error">{error}</Alert>
            ) : articles.length === 0 ? (
              <CenteredBox>
                <Typography color="textSecondary">
                  No news available for your open positions.
                </Typography>
              </CenteredBox>
            ) : (
              <List disablePadding>
                {articles.map((a, i) => (
                  <React.Fragment key={i}>
                    <ListItemButton
                      component="a"
                      href={a.url}
                      target="_blank"
                      rel="noopener"
                      sx={{ py: 2 }}
                    >
                      <ListItemText
                        primary={a.title}
                        secondary={`${a.source} — ${new Date(
                          a.publishedAt
                        ).toLocaleDateString()}`}
                        primaryTypographyProps={{ variant: 'subtitle1' }}
                        secondaryTypographyProps={{
                          variant: 'body2',
                          color: 'textSecondary',
                        }}
                      />
                    </ListItemButton>
                    {i < articles.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </SectionContent>
        </PageCard>
      </StyledContainer>
    </PageContainer>
  );
};

export default NewsPage;