import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';

import { ProfileDangerButton, ProfileDangerCard } from '@shared/ui/layout/Styled';

type Props = {
  onDeleteClick: () => void;
};

export const ProfileDangerZone: React.FC<Props> = ({ onDeleteClick }) => {
  return (
    <Box sx={{ mt: 2 }}>
      <ProfileDangerCard variant="outlined">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 950 }}>
              Danger zone
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Permanently delete your account and all associated data.
            </Typography>
          </Box>

          <ProfileDangerButton
            variant="outlined"
            color="error"
            onClick={onDeleteClick}
            startIcon={<DeleteForeverRoundedIcon />}
          >
            Delete account
          </ProfileDangerButton>
        </Stack>
      </ProfileDangerCard>
    </Box>
  );
};
