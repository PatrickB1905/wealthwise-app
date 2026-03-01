import React, { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'

import API from '../api/axios'
import NewsAPI from '../api/newsClient'
import { useAuth } from '../context/useAuth'
import {
  CenteredBox,
  CenteredBoxSpaced,
  PageCard,
  PageContainer,
  SectionContent,
  SectionHeader,
  StyledContainer,
} from '../components/layout/Styled'

type Position = { ticker: string }

type Article = {
  title: string
  source: string
  url: string
  publishedAt: string
}

const NewsPage: React.FC = () => {
  const { user } = useAuth()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [noPositions, setNoPositions] = useState(false)

  useEffect(() => {
    if (!user) return

    let active = true

    async function run() {
      if (active) {
        setLoading(true)
        setError('')
      }

      try {
        const posRes = await API.get<Position[]>('/positions?status=open')
        const positions = posRes.data

        if (!active) return

        if (positions.length === 0) {
          setNoPositions(true)
          setArticles([])
          setLoading(false)
          return
        }

        setNoPositions(false)

        const symbols = positions.map((p) => p.ticker).join(',')
        const newsRes = await NewsAPI.get<Article[]>('/news', { params: { symbols } })

        if (!active) return
        setArticles(newsRes.data)
        setLoading(false)
      } catch {
        if (!active) return
        setError('Failed to load news')
        setLoading(false)
      }
    }

    run()

    return () => {
      active = false
    }
  }, [user])

  if (loading) {
    return (
      <PageContainer>
        <StyledContainer>
          <CenteredBox>
            <CircularProgress />
          </CenteredBox>
        </StyledContainer>
      </PageContainer>
    )
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
              <Typography variant="body1" color="text.secondary" align="center">
                Add positions to your portfolio to see curated news headlines here.
              </Typography>

              <CenteredBoxSpaced>
                <Button variant="contained" component={RouterLink} to="/app/positions">
                  Add Position
                </Button>
              </CenteredBoxSpaced>
            </SectionContent>
          </PageCard>
        </StyledContainer>
      </PageContainer>
    )
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
                <Typography color="text.secondary">No news available for your open positions.</Typography>
              </CenteredBox>
            ) : (
              <List disablePadding>
                {articles.map((a, i) => (
                  <React.Fragment key={`${a.url}_${i}`}>
                    <ListItemButton
                      component="a"
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        py: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 0.5,
                      }}
                    >
                      <Typography variant="subtitle1">{a.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {a.source} — {new Date(a.publishedAt).toLocaleDateString()}
                      </Typography>
                    </ListItemButton>

                    {i < articles.length - 1 ? <Divider component="li" /> : null}
                  </React.Fragment>
                ))}
              </List>
            )}
          </SectionContent>
        </PageCard>
      </StyledContainer>
    </PageContainer>
  )
}

export default NewsPage