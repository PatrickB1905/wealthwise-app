import React from 'react';
import Alert from '@mui/material/Alert';

import { StyledContainer } from '@shared/ui/layout/Styled';

type Props = { message: string };

export const ProfileErrorState: React.FC<Props> = ({ message }) => {
  return (
    <StyledContainer>
      <Alert severity="error">{message}</Alert>
    </StyledContainer>
  );
};
