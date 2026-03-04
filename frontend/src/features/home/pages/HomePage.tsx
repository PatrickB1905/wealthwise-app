import React from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

import heroImg from '../../../assets/images/hero.png';
import analyticsScreenshotImg from '../../../assets/images/analytics_page_img.png';
import portfolioScreenshotImg from '../../../assets/images/portfolio_page_img.png';

import { FEATURE_CARDS, FAQS, HIGHLIGHTS, STEPS, TRUST_ITEMS, VALUE_PROPS } from '../constants';
import { useHomePage } from '../hooks/useHomePage';
import { HomeTopNav } from '../components/HomeTopNav';
import { HomeHeroSection } from '../components/HomeHeroSection';
import { HomeValuePropsSection } from '../components/HomeValuePropsSection';
import { HomeFeaturesSection } from '../components/HomeFeaturesSection';
import { HomeHowItWorksSection } from '../components/HomeHowItWorksSection';
import { HomeTrustSection } from '../components/HomeTrustSection';
import { HomePlansSection } from '../components/HomePlansSection';
import { HomeFaqSection } from '../components/HomeFaqSection';
import { HomeCalloutSection } from '../components/HomeCalloutSection';
import { HomeFooter } from '../components/HomeFooter';

const HomePage: React.FC = () => {
  const nav = useNavigate();
  const theme = useTheme();
  const isMobileNav = useMediaQuery(theme.breakpoints.down('sm'));

  const { styles, navAnchorEl, navMenuOpen, openNavMenu, closeNavMenu, onNav, onNavAndClose } =
    useHomePage();

  return (
    <>
      <HomeHeroSection
        heroImg={heroImg}
        heroTitleSx={styles.heroTitleSx}
        heroTaglineSx={styles.heroTaglineSx}
        onGetStarted={() => nav('/register')}
        topNav={
          <HomeTopNav
            isMobileNav={isMobileNav}
            onLogin={() => nav('/login')}
            navAnchorEl={navAnchorEl}
            navMenuOpen={navMenuOpen}
            openNavMenu={openNavMenu}
            closeNavMenu={closeNavMenu}
            onNav={onNav}
            onNavAndClose={onNavAndClose}
            mobileMenuPaperSx={styles.mobileMenuPaperSx}
          />
        }
      />

      <HomeValuePropsSection items={VALUE_PROPS} />

      <HomeFeaturesSection
        featureCards={FEATURE_CARDS}
        highlights={HIGHLIGHTS}
        analyticsScreenshotImg={analyticsScreenshotImg}
      />

      <HomeHowItWorksSection steps={STEPS} />

      <HomeTrustSection trustItems={TRUST_ITEMS} portfolioScreenshotImg={portfolioScreenshotImg} />

      <HomePlansSection onRegister={() => nav('/register')} />

      <HomeFaqSection faqs={FAQS} />

      <HomeCalloutSection onRegister={() => nav('/register')} />

      <HomeFooter
        year={new Date().getFullYear()}
        onNavSection={onNav}
        onRegister={() => nav('/register')}
        onLogin={() => nav('/login')}
        onOpenApp={() => nav('/app/positions')}
      />
    </>
  );
};

export default HomePage;
