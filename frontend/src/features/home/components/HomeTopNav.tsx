import React from 'react';
import Stack from '@mui/material/Stack';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import MenuIcon from '@mui/icons-material/Menu';

import {
  BrandWordmark,
  CTAOutlineButton,
  MarketingMenuButton,
  MarketingNavActions,
  MarketingNavLink,
  MarketingNavPill,
  MarketingTopNav,
  MarketingTopNavInner,
} from '@shared/ui/layout/Styled';

import type { NavSectionId } from '../types/home';

type Props = {
  isMobileNav: boolean;
  onLogin: () => void;

  navAnchorEl: null | HTMLElement;
  navMenuOpen: boolean;
  openNavMenu: (e: React.MouseEvent<HTMLElement>) => void;
  closeNavMenu: () => void;

  onNav: (id: NavSectionId) => void;
  onNavAndClose: (id: NavSectionId) => void;

  mobileMenuPaperSx: unknown;
};

export function HomeTopNav({
  isMobileNav,
  onLogin,
  navAnchorEl,
  navMenuOpen,
  openNavMenu,
  closeNavMenu,
  onNav,
  onNavAndClose,
  mobileMenuPaperSx,
}: Props) {
  return (
    <MarketingTopNav>
      <MarketingTopNavInner maxWidth="lg">
        <Stack direction="row" spacing={1.25} alignItems="center">
          <BrandWordmark variant="h6" component="div">
            WealthWise
          </BrandWordmark>
        </Stack>

        <MarketingNavActions>
          {!isMobileNav ? (
            <>
              <MarketingNavPill>
                <MarketingNavLink onClick={() => onNav('features')}>Features</MarketingNavLink>
                <MarketingNavLink onClick={() => onNav('how')}>How It Works</MarketingNavLink>
                <MarketingNavLink onClick={() => onNav('plans')}>Plans</MarketingNavLink>
                <MarketingNavLink onClick={() => onNav('faq')}>FAQ</MarketingNavLink>
              </MarketingNavPill>

              <CTAOutlineButton size="medium" onClick={onLogin}>
                Log in
              </CTAOutlineButton>
            </>
          ) : (
            <>
              <CTAOutlineButton size="small" onClick={onLogin}>
                Log in
              </CTAOutlineButton>

              <MarketingMenuButton aria-label="Open menu" onClick={openNavMenu}>
                <MenuIcon />
              </MarketingMenuButton>

              <Menu
                anchorEl={navAnchorEl}
                open={navMenuOpen}
                onClose={closeNavMenu}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                PaperProps={{ sx: mobileMenuPaperSx }}
              >
                <MenuItem onClick={() => onNavAndClose('features')}>Features</MenuItem>
                <MenuItem onClick={() => onNavAndClose('how')}>How it works</MenuItem>
                <MenuItem onClick={() => onNavAndClose('plans')}>Plans</MenuItem>
                <MenuItem onClick={() => onNavAndClose('faq')}>FAQ</MenuItem>
              </Menu>
            </>
          )}
        </MarketingNavActions>
      </MarketingTopNavInner>
    </MarketingTopNav>
  );
}
