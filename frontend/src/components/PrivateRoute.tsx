import React from 'react'
import { Navigate } from 'react-router-dom'
import { CircularProgress } from '@mui/material'
import Box from '@mui/material/Box'
import { useAuth } from '../context/useAuth'

interface Props {
  children: JSX.Element
}

const PrivateRoute: React.FC<Props> = ({ children }) => {
  const { user, isBootstrapping } = useAuth()

  if (isBootstrapping) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default PrivateRoute
