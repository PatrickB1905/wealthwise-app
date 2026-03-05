import React from 'react';
import { Navigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useAuth } from '@features/auth';
import { FullPageCentered } from '@shared/ui/layout/Styled';

interface Props {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const { user, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <FullPageCentered>
        <Stack spacing={1.5} alignItems="center">
          <CircularProgress />
          <Typography variant="subtitle1" fontWeight={800}>
            Loading WealthWise…
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Securing your session and preparing your dashboard.
          </Typography>
        </Stack>
      </FullPageCentered>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
