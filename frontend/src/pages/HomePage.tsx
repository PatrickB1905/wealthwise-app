import React from 'react';
import { Grid, Typography, CardContent, useTheme } from '@mui/material';
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
} from '../components/layout/Styled';

const features = [
  {
    title: 'Track Your Portfolio',
    description: 'Monitor stocks & crypto in real time with our intuitive dashboard!',
    icon: '/portfolio.png',
  },
  {
    title: 'Data & Analytics',
    description: 'Actionable insights and month-by-month performance charts!',
    icon: '/analytics.png',
  },
  {
    title: 'Curated News',
    description: 'Stay ahead with the latest headlines on your holdings!',
    icon: '/news.png',
  },
];

const HomePage: React.FC = () => {
  const nav   = useNavigate();
  const theme = useTheme();

  return (
    <>
      <HomeHero>
        <HeroOverlay />
        <HeroContent maxWidth="lg">
          <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
            WealthWise
          </Typography>
          <Typography variant="h5" gutterBottom>
            Empower your investments with real-time tracking, analytics, and news.
          </Typography>
          <div>
            <CTAButton
              variant="contained"
              size="large"
              onClick={() => nav('/register')}
            >
              Get Started
            </CTAButton>
            <CTAOutlineButton
              variant="outlined"
              size="large"
              onClick={() => nav('/login')}
            >
              Login
            </CTAOutlineButton>
          </div>
        </HeroContent>
      </HomeHero>

      <FeaturesSection maxWidth="lg">
        <Grid container spacing={4}>
          {features.map((f) => (
            <Grid item xs={12} md={4} key={f.title}>
              <FeatureCard elevation={3}>
                <FeatureIcon src={f.icon} alt={f.title} />
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {f.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {f.description}
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
          ))}
        </Grid>
      </FeaturesSection>

      <FooterSection>
        <HeroContent maxWidth="lg" sx={{ color: theme.palette.text.secondary }}>
          <Typography variant="body2" align="center">
            &copy; {new Date().getFullYear()} WealthWise. All rights reserved.
          </Typography>
        </HeroContent>
      </FooterSection>
    </>
  );
};

export default HomePage;