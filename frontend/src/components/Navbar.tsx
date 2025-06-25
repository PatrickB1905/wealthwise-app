import React from 'react';
import { AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const Navbar: React.FC = () => (
  <AppBar position="static" color="default" elevation={1}>
    <Toolbar>
      <IconButton edge="start" color="inherit" aria-label="open sidebar" sx={{ mr: 2 }}>
        <MenuIcon />
      </IconButton>
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        Dashboard
      </Typography>
    </Toolbar>
  </AppBar>
);

export default Navbar;