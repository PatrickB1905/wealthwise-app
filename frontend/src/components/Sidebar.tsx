import React from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider
} from '@mui/material';
import {
  ShowChart,
  Assessment,
  Feed,
  AccountCircle,
  Logout
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout } = useAuth();

  const items = [
    { label: 'Portfolio', icon: <ShowChart />, path: '/app/positions' },
    { label: 'Analytics & Data', icon: <Assessment />, path: '/app/analytics' },
    { label: 'News', icon: <Feed />, path: '/app/news' },
    { label: 'My Profile', icon: <AccountCircle />, path: '/app/profile' }
  ];

  return (
    <Drawer variant="permanent">
      <Box sx={{ width: 240, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ p: 2, fontWeight: 'bold', fontSize: '1.25rem' }}>WealthWise</Box>
        <Divider />
        <List>
          {items.map((item) => (
            <ListItemButton
              key={item.label}
              selected={pathname.startsWith(item.path)}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
        <Box sx={{ flexGrow: 1 }} />
        <Divider />
        <List>
          <ListItemButton onClick={() => logout()}>
            <ListItemIcon><Logout /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;