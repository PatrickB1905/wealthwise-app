import React from 'react'
import { Navigate } from 'react-router-dom'
import CircularProgress from '@mui/material/CircularProgress'
import { useAuth } from '../context/useAuth'
import { FullPageCentered } from './layout/Styled'

interface Props {
  children: React.ReactElement
}

const PrivateRoute: React.FC<Props> = ({ children }) => {
  const { user, isBootstrapping } = useAuth()

  if (isBootstrapping) {
    return (
      <FullPageCentered>
        <CircularProgress />
      </FullPageCentered>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default PrivateRoute
