import React, { useMemo } from 'react';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import MenuIcon from '@mui/icons-material/Menu';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '@features/auth';
import {
  NavbarAppBar,
  NavbarCrumbLink,
  NavbarTitle,
  NavbarTitleRow,
  NavbarTitleWrap,
  NavbarToolbar,
  UserAvatar,
  UserEmailText,
  UserMenuButton,
} from '@shared/ui';
import { breadcrumbsFromPath, initialsFromEmail, initialsFromName } from './navbar.utils';

type NavbarProps = {
  title?: string;
  onMenuClick?: () => void;
};

const Navbar: React.FC<NavbarProps> = ({ title = 'Dashboard', onMenuClick }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const nav = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();

  const crumbs = useMemo(() => breadcrumbsFromPath(pathname), [pathname]);

  const initials = useMemo(() => {
    if (!user) return null;
    return initialsFromName(user.firstName, user.lastName) ?? initialsFromEmail(user.email);
  }, [user]);

  return (
    <NavbarAppBar position="sticky" color="default">
      <NavbarToolbar>
        {!isDesktop ? (
          <IconButton edge="start" color="inherit" aria-label="open sidebar" onClick={onMenuClick}>
            <MenuIcon />
          </IconButton>
        ) : null}

        <NavbarTitleRow direction="row" spacing={1} alignItems="center">
          <AppRegistrationIcon fontSize="small" />

          <NavbarTitleWrap>
            <Typography variant="h6" component="h1" noWrap>
              {title}
            </Typography>

            <Breadcrumbs aria-label="breadcrumbs">
              <NavbarCrumbLink onClick={() => nav('/app/positions')}>{crumbs[0]}</NavbarCrumbLink>

              <Typography variant="caption" color="text.secondary">
                {crumbs[1]}
              </Typography>
            </Breadcrumbs>
          </NavbarTitleWrap>
        </NavbarTitleRow>

        <NavbarTitle />

        {user ? (
          <Tooltip title="Account" placement="bottom">
            <UserMenuButton
              variant="text"
              onClick={() => nav('/app/profile')}
              aria-label="Open profile"
            >
              <UserAvatar>{initials}</UserAvatar>
              <UserEmailText variant="body2">{user.email}</UserEmailText>
            </UserMenuButton>
          </Tooltip>
        ) : null}
      </NavbarToolbar>
    </NavbarAppBar>
  );
};

export default Navbar;
