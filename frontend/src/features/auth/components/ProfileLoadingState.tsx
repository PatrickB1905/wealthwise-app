import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';

import { CenteredBox, StyledContainer } from '@shared/ui/layout/Styled';

export const ProfileLoadingState: React.FC = () => {
  return (
    <StyledContainer>
      <CenteredBox>
        <CircularProgress />
      </CenteredBox>
    </StyledContainer>
  );
};
