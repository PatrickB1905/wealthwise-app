import React from 'react';
import { List, ListItemButton, ListItemText, Divider } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import {
  ShowChart,
  Assessment,
  Feed,
  AccountCircle,
  Logout,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  SidebarContainer,
  SidebarBrand,
  SidebarPush,
  SidebarIcon,
} from './layout/Styled';

const StyledListItem = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected?: boolean }>(({ theme, selected }) => ({
  margin: theme.spacing(0, 2),
  borderRadius: theme.shape.borderRadius,
  ...(selected && {
    backgroundColor: theme.palette.action.selected,
    '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
      color: theme.palette.primary.main,
    },
  }),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const Sidebar: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout } = useAuth();

  const items = [
    { label: 'Portfolio',       icon: <ShowChart />,     path: '/app/positions' },
    { label: 'Analytics & Data',icon: <Assessment />,    path: '/app/analytics' },
    { label: 'News',            icon: <Feed />,          path: '/app/news' },
    { label: 'My Profile',      icon: <AccountCircle />, path: '/app/profile' },
  ];

  return (
    <SidebarContainer variant="permanent">
      <SidebarBrand>WealthWise</SidebarBrand>
      <Divider />

      <List>
        {items.map(item => (
          <StyledListItem
            key={item.label}
            selected={pathname.startsWith(item.path)}
            onClick={() => navigate(item.path)}
          >
            <SidebarIcon>{item.icon}</SidebarIcon>
            <ListItemText primary={item.label} />
          </StyledListItem>
        ))}
      </List>

      <SidebarPush />

      <Divider />

      <List>
        <StyledListItem onClick={logout}>
          <SidebarIcon>
            <Logout />
          </SidebarIcon>
          <ListItemText primary="Logout" />
        </StyledListItem>
      </List>
    </SidebarContainer>
  );
};

export default Sidebar;