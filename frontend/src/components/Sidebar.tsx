import React, { useMemo } from 'react'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import AssessmentIcon from '@mui/icons-material/Assessment'
import FeedIcon from '@mui/icons-material/Feed'
import LogoutIcon from '@mui/icons-material/Logout'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItemText from '@mui/material/ListItemText'
import { useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/useAuth'
import {
  SidebarBrand,
  SidebarContainer,
  SidebarIcon,
  SidebarNavItem,
  SidebarPush,
} from './layout/Styled'

type NavItem = {
  label: string
  icon: React.ReactNode
  path: string
}

const Sidebar: React.FC = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { logout } = useAuth()

  const items: NavItem[] = useMemo(
    () => [
      { label: 'Portfolio', icon: <ShowChartIcon />, path: '/app/positions' },
      { label: 'Analytics & Data', icon: <AssessmentIcon />, path: '/app/analytics' },
      { label: 'News', icon: <FeedIcon />, path: '/app/news' },
      { label: 'My Profile', icon: <AccountCircleIcon />, path: '/app/profile' },
    ],
    []
  )

  return (
    <SidebarContainer variant="permanent">
      <SidebarBrand>WealthWise</SidebarBrand>
      <Divider />

      <List>
        {items.map((item) => (
          <SidebarNavItem
            key={item.path}
            selected={pathname.startsWith(item.path)}
            onClick={() => navigate(item.path)}
          >
            <SidebarIcon>{item.icon}</SidebarIcon>
            <ListItemText primary={item.label} />
          </SidebarNavItem>
        ))}
      </List>

      <SidebarPush />

      <Divider />

      <List>
        <SidebarNavItem onClick={logout}>
          <SidebarIcon>
            <LogoutIcon />
          </SidebarIcon>
          <ListItemText primary="Logout" />
        </SidebarNavItem>
      </List>
    </SidebarContainer>
  )
}

export default Sidebar
