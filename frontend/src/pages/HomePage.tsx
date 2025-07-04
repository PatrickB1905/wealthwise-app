import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import {
  HomeHero,
  HeroOverlay,
  HeroContent,
  CTAButton,
  CTAOutlineButton,
  FeaturesSection,
  FeatureCard,
  FeatureIcon,
  FooterSection,
  SectionHeader,
  SectionContent,
} from '../components/layout/Styled';

const features = [
  {
    title: 'Unified Portfolio View',
    description:
      'See all your stocks and crypto holdings in one sleek dashboard—updated in real time!',
    icon: '/portfolio.png',
  },
  {
    title: 'Pro-Grade Charts',
    description:
      'Dive into interactive P/L, performance and historical trends over multiple timeframes!',
    icon: '/analytics.png',
  },
  {
    title: 'Instant News Feed',
    description:
      'Receive curated market news and sentiment analysis around your exact positions!',
    icon: '/news.png',
  },
];

const HomePage: React.FC = () => {
  const nav = useNavigate();
  const theme = useTheme();

  return (
    <>
      <HomeHero sx={{ backgroundImage: 'url(/hero.png)' }}>
        <HeroOverlay />
        <HeroContent maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
            WealthWise
          </Typography>
          <Typography variant="h5" gutterBottom>
            The only platform you need to track, analyze, and stay informed on your entire
            portfolio—stocks & crypto alike!
          </Typography>
          <Box
            mt={4}
            display="flex"
            justifyContent="center"
            gap={2}
            flexWrap="wrap"
          >
            <CTAButton
              size="large"
              onClick={() => nav('/register')}
              sx={{
                backgroundColor: theme.palette.common.white,
                color: theme.palette.primary.main,
                '&:hover': { backgroundColor: theme.palette.grey[100] },
              }}
            >
              Get Started
            </CTAButton>
            <CTAOutlineButton
              size="large"
              onClick={() => nav('/login')}
              sx={{
                borderColor: theme.palette.common.white,
                color: theme.palette.common.white,
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
              }}
            >
              Login
            </CTAOutlineButton>
          </Box>
        </HeroContent>
      </HomeHero>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <SectionHeader
          title="What Is WealthWise?"
          titleTypographyProps={{ variant: 'h4', align: 'center' }}
        />
        <SectionContent>
          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ maxWidth: 700, mx: 'auto', mt: 2 }}
          >
            WealthWise is your answer to bringing all your investments from multiple
            platforms into one place. Real-time pricing, advanced profit/loss charts,
            and a live newsfeed tailored to the tickers you own—no more juggling multiple
            apps. Everything you need to make informed decisions is right here.
          </Typography>
        </SectionContent>
      </Container>

      <FeaturesSection component="section" py={8} sx={{ backgroundColor: theme.palette.grey[50] }}>
        <Container maxWidth="lg">
          <SectionHeader
            title="Key Features"
            titleTypographyProps={{ variant: 'h4', align: 'center' }}
          />
          <SectionContent>
            <Grid container spacing={4} justifyContent="center">
              {features.map((f) => (
                <Grid item xs={12} sm={6} md={4} key={f.title}>
                  <FeatureCard
                    elevation={3}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      px: 2,
                      py: 4,
                      height: '100%',
                    }}
                  >
                    <FeatureIcon src={f.icon} alt={f.title} sx={{ mb: 2 }} />
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {f.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {f.description}
                    </Typography>
                  </FeatureCard>
                </Grid>
              ))}
            </Grid>
          </SectionContent>
        </Container>
      </FeaturesSection>

      <Box
        component="section"
        py={8}
        sx={{
          background: 'linear-gradient(to right, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.2) 100%)',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', color: 'common.white' }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Ready to take your portfolio to the next level?
          </Typography>
          <Typography variant="body1" mb={4}>
            Join thousands of investors who trust WealthWise for faster insights and
            smarter decisions today!
          </Typography>
          <CTAButton
            size="large"
            onClick={() => nav('/register')}
            sx={{
              backgroundColor: theme.palette.common.white,
              color: theme.palette.primary.main,
              '&:hover': { backgroundColor: theme.palette.grey[100] },
            }}
          >
            Create Account
          </CTAButton>
        </Container>
      </Box>

      <FooterSection>
        <Container maxWidth="lg">
          <Typography variant="body2" align="center" color="text.secondary">
            &copy; {new Date().getFullYear()} WealthWise. All rights reserved.
          </Typography>
        </Container>
      </FooterSection>
    </>
  );
};

export default HomePage;