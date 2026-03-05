import React, { useMemo } from 'react';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FeedIcon from '@mui/icons-material/Feed';
import LogoutIcon from '@mui/icons-material/Logout';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '@features/auth';
import {
  SidebarBrand,
  SidebarContainer,
  SidebarDivider,
  SidebarIcon,
  SidebarInner,
  SidebarNavItem,
  SidebarPush,
} from '@shared/ui';

type NavItem = {
  label: string;
  icon: React.ReactNode;
  path: string;
  description: string;
};

type SidebarProps = {
  mobileOpen: boolean;
  onMobileClose: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onMobileClose }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout } = useAuth();

  const items: NavItem[] = useMemo(
    () => [
      {
        label: 'Portfolio',
        description: 'Track positions & live prices',
        icon: <ShowChartIcon />,
        path: '/app/positions',
      },
      {
        label: 'Analytics',
        description: 'Performance, risk, history',
        icon: <AssessmentIcon />,
        path: '/app/analytics',
      },
      {
        label: 'News',
        description: 'Headlines for your holdings',
        icon: <FeedIcon />,
        path: '/app/news',
      },
      {
        label: 'My Profile',
        description: 'Account & security',
        icon: <AccountCircleIcon />,
        path: '/app/profile',
      },
    ],
    [],
  );

  const onNavigate = (to: string) => {
    navigate(to);
    onMobileClose();
  };

  const content = (
    <SidebarInner>
      <SidebarBrand>WealthWise</SidebarBrand>

      <SidebarDivider />

      <List disablePadding>
        {items.map((item) => {
          const selected = pathname.startsWith(item.path);

          return (
            <SidebarNavItem
              key={item.path}
              selected={selected}
              onClick={() => onNavigate(item.path)}
            >
              <SidebarIcon>{item.icon}</SidebarIcon>

              <ListItemText
                primary={item.label}
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {item.description}
                  </Typography>
                }
              />
            </SidebarNavItem>
          );
        })}
      </List>

      <SidebarPush />

      <SidebarDivider />

      <Stack spacing={1}>
        <SidebarNavItem
          onClick={() => {
            onMobileClose();
            logout();
          }}
        >
          <SidebarIcon>
            <LogoutIcon />
          </SidebarIcon>
          <ListItemText primary="Logout" />
        </SidebarNavItem>
      </Stack>
    </SidebarInner>
  );

  if (isDesktop) {
    return (
      <SidebarContainer variant="permanent" open>
        {content}
      </SidebarContainer>
    );
  }

  return (
    <SidebarContainer
      variant="temporary"
      open={mobileOpen}
      onClose={onMobileClose}
      ModalProps={{ keepMounted: true }}
    >
      {content}
    </SidebarContainer>
  );
};

export default Sidebar;
