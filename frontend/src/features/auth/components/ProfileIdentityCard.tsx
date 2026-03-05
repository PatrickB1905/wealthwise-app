import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';

import type { Profile } from '../types/profile';
import {
  ProfileIdentityCard,
  ProfileIdentityIconBox,
  ProfileMemberSinceChip,
  ProfileStatusChip,
} from '@shared/ui/layout/Styled';

type Props = {
  profile: Profile;
  fullName: string;
  memberSince: string;
};

export const ProfileIdentityCardBlock: React.FC<Props> = ({ profile, fullName, memberSince }) => {
  return (
    <ProfileIdentityCard variant="outlined">
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={{ xs: 2, md: 2.25 }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
          <ProfileIdentityIconBox>
            <PersonRoundedIcon fontSize="small" />
          </ProfileIdentityIconBox>

          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 950 }} noWrap>
                {fullName || '—'}
              </Typography>

              <ProfileStatusChip
                icon={<VerifiedRoundedIcon />}
                label="Active"
                size="small"
                variant="outlined"
                sx={{ '& .MuiChip-icon': { ml: 0.75 } }}
              />
            </Stack>

            <Typography variant="body2" color="text.secondary" noWrap>
              {profile.email}
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ width: { xs: '100%', md: 'auto' } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
          >
            <ProfileMemberSinceChip
              label={`Member since ${memberSince}`}
              size="small"
              variant="outlined"
            />
          </Stack>
        </Box>
      </Stack>
    </ProfileIdentityCard>
  );
};
