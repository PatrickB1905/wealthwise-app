import React from 'react'
import { Divider, List, ListItemButton, ListItemText } from '@mui/material'
import { styled } from '@mui/material/styles'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import AssessmentIcon from '@mui/icons-material/Assessment'
import FeedIcon from '@mui/icons-material/Feed'
import LogoutIcon from '@mui/icons-material/Logout'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import {
  SidebarBrand,
  SidebarContainer,
  SidebarIcon,
  SidebarPush,
} from './layout/Styled'

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
}))

type NavItem = {
  label: string
  icon: React.ReactNode
  path: string
}

const Sidebar: React.FC = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { logout } = useAuth()

  const items: NavItem[] = [
    {
      label: 'Portfolio',
      icon: <ShowChartIcon />,
      path: '/app/positions',
    },
    {
      label: 'Analytics & Data',
      icon: <AssessmentIcon />,
      path: '/app/analytics',
    },
    {
      label: 'News',
      icon: <FeedIcon />,
      path: '/app/news',
    },
    {
      label: 'My Profile',
      icon: <AccountCircleIcon />,
      path: '/app/profile',
    },
  ]

  return (
    <SidebarContainer variant="permanent">
      <SidebarBrand>WealthWise</SidebarBrand>
      <Divider />

      <List>
        {items.map((item) => (
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
            <LogoutIcon />
          </SidebarIcon>
          <ListItemText primary="Logout" />
        </StyledListItem>
      </List>
    </SidebarContainer>
  )
}

export default Sidebar
