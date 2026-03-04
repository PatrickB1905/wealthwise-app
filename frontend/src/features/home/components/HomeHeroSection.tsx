import React from 'react';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import {
  BrandTagline,
  HeroActions,
  HeroContent,
  HeroOverlay,
  HomeHero,
  KickerDot,
  PrimaryHeroButton,
  SubtleKicker,
} from '@shared/ui/layout/Styled';

type Props = {
  heroImg: string;
  onGetStarted: () => void;
  heroTitleSx: unknown;
  heroTaglineSx: unknown;
  topNav: React.ReactNode;
};

export function HomeHeroSection({
  heroImg,
  onGetStarted,
  heroTitleSx,
  heroTaglineSx,
  topNav,
}: Props) {
  return (
    <HomeHero style={{ backgroundImage: `url(${heroImg})` }}>
      <HeroOverlay />

      {topNav}

      <HeroContent maxWidth="lg">
        <Grid container spacing={{ xs: 5, md: 7 }} alignItems="center">
          <Grid item xs={12} md={7}>
            <Stack spacing={2.2} sx={{ maxWidth: 780 }}>
              <SubtleKicker variant="body2">
                <KickerDot />
                Portfolio clarity that feels instant
              </SubtleKicker>

              <Typography component="h1" sx={heroTitleSx}>
                Your portfolio.
                <br />
                One home.
              </Typography>

              <BrandTagline variant="h6" sx={heroTaglineSx}>
                Monitor live market data, evaluate performance and risk, and stay ahead with curated
                news tailored to your holdings, built for self-directed investors who demand
                clarity.
              </BrandTagline>

              <HeroActions>
                <PrimaryHeroButton size="large" onClick={onGetStarted}>
                  Get Started
                </PrimaryHeroButton>
              </HeroActions>
            </Stack>
          </Grid>
        </Grid>
      </HeroContent>
    </HomeHero>
  );
}
