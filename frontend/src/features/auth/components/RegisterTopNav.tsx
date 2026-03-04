import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';

import {
  CTAOutlineButton,
  MarketingNavActions,
  MarketingNavLink,
  MarketingNavPill,
  MarketingTopNav,
  MarketingTopNavInner,
} from '@shared/ui/layout/Styled';

type Props = {
  onBackToHome: () => void;
  onGoLogin: () => void;
};

export const RegisterTopNav: React.FC<Props> = ({ onBackToHome, onGoLogin }) => {
  return (
    <MarketingTopNav>
      <MarketingTopNavInner maxWidth="lg">
        <MarketingNavPill>
          <LockOutlinedIcon
            fontSize="small"
            sx={{ opacity: 0.9, color: 'rgba(255,255,255,0.9)' }}
          />
          <Typography
            sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 900, letterSpacing: '-0.02em' }}
          >
            WealthWise
          </Typography>
        </MarketingNavPill>

        <MarketingNavActions>
          <CTAOutlineButton
            size="small"
            startIcon={<ArrowBackIcon />}
            onClick={onBackToHome}
            sx={{ borderColor: 'rgba(255,255,255,0.55)' }}
          >
            Back to home
          </CTAOutlineButton>

          <MarketingNavLink onClick={onGoLogin} aria-label="Go to login">
            Log in
          </MarketingNavLink>
        </MarketingNavActions>
      </MarketingTopNavInner>
    </MarketingTopNav>
  );
};
