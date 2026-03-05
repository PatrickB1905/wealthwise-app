import React from 'react';
import Typography from '@mui/material/Typography';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';

import {
  ProfileAvatar,
  ProfileHeaderLeft,
  ProfileHeaderRight,
  ProfileHeaderText,
  ProfileHeaderWrap,
  ProfileRefreshButton,
  ProfileUpdatedDot,
  ProfileUpdatedPill,
  SectionHeader,
} from '@shared/ui/layout/Styled';

type Props = {
  initials: string;
  updatedLabel: string;
  onRefresh: () => void;
};

export const ProfileHeader: React.FC<Props> = ({ initials, updatedLabel, onRefresh }) => {
  return (
    <SectionHeader
      title={
        <ProfileHeaderWrap>
          <ProfileHeaderLeft direction="row" spacing={1.5} alignItems="center">
            <ProfileAvatar>{initials}</ProfileAvatar>

            <ProfileHeaderText>
              <Typography variant="h6" fontWeight={950} noWrap>
                My Profile
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                Account details and security settings
              </Typography>
            </ProfileHeaderText>
          </ProfileHeaderLeft>

          <ProfileHeaderRight
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.25}
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <ProfileUpdatedPill>
              <ProfileUpdatedDot />
              <Typography variant="body2" sx={{ fontWeight: 900, color: 'text.secondary' }}>
                Updated {updatedLabel}
              </Typography>
            </ProfileUpdatedPill>

            <ProfileRefreshButton
              variant="outlined"
              onClick={onRefresh}
              startIcon={<RefreshRoundedIcon />}
            >
              Refresh
            </ProfileRefreshButton>
          </ProfileHeaderRight>
        </ProfileHeaderWrap>
      }
      subheader={null}
    />
  );
};
