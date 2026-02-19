import React from 'react'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { useNavigate } from 'react-router-dom'

import {
  CalloutActions,
  CalloutSection,
  CalloutText,
  CalloutTitle,
  CalloutWrap,
  CTAButton,
  CTAOutlineButton,
  FeatureCardLayout,
  FeatureIcon,
  FeaturesSection,
  FooterSection,
  HeroActions,
  HeroContent,
  HeroOverlay,
  HomeHero,
  PrimaryHeroButton,
  SectionBodyText,
  SectionContent,
  SectionHeader,
  SectionWrap,
} from '../components/layout/Styled'

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
] as const

const HomePage: React.FC = () => {
  const nav = useNavigate()

  return (
    <>
      <HomeHero>
        <HeroOverlay />
        <HeroContent maxWidth="md">
          <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
            WealthWise
          </Typography>
          <Typography variant="h5" gutterBottom>
            The only platform you need to track, analyze, and stay informed on your entire
            portfolio—stocks &amp; crypto alike!
          </Typography>

          <HeroActions>
            <PrimaryHeroButton size="large" onClick={() => nav('/register')}>
              Get Started
            </PrimaryHeroButton>

            <CTAOutlineButton size="large" onClick={() => nav('/login')}>
              Login
            </CTAOutlineButton>
          </HeroActions>
        </HeroContent>
      </HomeHero>

      <SectionWrap maxWidth="lg">
        <SectionHeader
          title="What Is WealthWise?"
          titleTypographyProps={{ variant: 'h4', align: 'center' }}
        />
        <SectionContent>
          <SectionBodyText variant="body1" color="text.secondary" align="center">
            WealthWise is your answer to bringing all your investments from multiple platforms into
            one place. Real-time pricing, advanced profit/loss charts, and a live newsfeed tailored
            to the tickers you own—no more juggling multiple apps. Everything you need to make
            informed decisions is right here.
          </SectionBodyText>
        </SectionContent>
      </SectionWrap>

      <FeaturesSection component="section">
        <Container maxWidth="lg">
          <SectionHeader
            title="Key Features"
            titleTypographyProps={{ variant: 'h4', align: 'center' }}
          />
          <SectionContent>
            <Grid container spacing={4} justifyContent="center">
              {features.map((f) => (
                <Grid item xs={12} sm={6} md={4} key={f.title}>
                  <FeatureCardLayout elevation={3}>
                    <FeatureIcon src={f.icon} alt={f.title} />
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {f.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {f.description}
                    </Typography>
                  </FeatureCardLayout>
                </Grid>
              ))}
            </Grid>
          </SectionContent>
        </Container>
      </FeaturesSection>

      <CalloutSection component="section">
        <CalloutWrap maxWidth="lg">
          <CalloutTitle variant="h4" fontWeight="bold" gutterBottom>
            Ready to take your portfolio to the next level?
          </CalloutTitle>
          <CalloutText variant="body1">
            Join thousands of investors who trust WealthWise for faster insights and smarter
            decisions today!
          </CalloutText>

          <CalloutActions>
            <CTAButton size="large" onClick={() => nav('/register')}>
              Create Account
            </CTAButton>
          </CalloutActions>
        </CalloutWrap>
      </CalloutSection>

      <FooterSection>
        <Container maxWidth="lg">
          <Typography variant="body2" align="center" color="text.secondary">
            &copy; {new Date().getFullYear()} WealthWise. All rights reserved.
          </Typography>
        </Container>
      </FooterSection>
    </>
  )
}

export default HomePage
