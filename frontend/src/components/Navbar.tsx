import React from 'react'
import MenuIcon from '@mui/icons-material/Menu'
import AppBar from '@mui/material/AppBar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

import { NavbarTitle, NavbarToolbar } from './layout/Styled'

type NavbarProps = {
  title?: string
  onMenuClick?: () => void
}

const Navbar: React.FC<NavbarProps> = ({ title = 'Dashboard', onMenuClick }) => {
  return (
    <AppBar position="static" color="default" elevation={1}>
      <NavbarToolbar>
        <IconButton edge="start" color="inherit" aria-label="open sidebar" onClick={onMenuClick}>
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" component="h1">
          {title}
        </Typography>

        <NavbarTitle />
      </NavbarToolbar>
    </AppBar>
  )
}

export default Navbar
