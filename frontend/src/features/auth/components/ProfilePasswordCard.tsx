import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LockRoundedIcon from '@mui/icons-material/LockRounded';

import type { BannerMsg } from '../types/profile';
import {
  FormActions,
  ProfileIconBox,
  ProfilePrimaryActionButton,
  ProfileSectionCard,
  SpacedAlert,
} from '@shared/ui/layout/Styled';

type Props = {
  currentPwd: string;
  onCurrentPwdChange: (next: string) => void;
  newPwd: string;
  onNewPwdChange: (next: string) => void;
  pwdMsg: BannerMsg | null;
  canSubmitPwd: boolean;
  isPending: boolean;
  onSubmit: () => void;
  onClearMsg: () => void;
};

export const ProfilePasswordCard: React.FC<Props> = ({
  currentPwd,
  onCurrentPwdChange,
  newPwd,
  onNewPwdChange,
  pwdMsg,
  canSubmitPwd,
  isPending,
  onSubmit,
  onClearMsg,
}) => {
  return (
    <ProfileSectionCard variant="outlined">
      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1.25 }}>
        <ProfileIconBox>
          <LockRoundedIcon fontSize="small" />
        </ProfileIconBox>

        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 950 }} noWrap>
            Password
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            Minimum 8 characters recommended
          </Typography>
        </Box>
      </Stack>

      {pwdMsg ? <SpacedAlert severity={pwdMsg.type}>{pwdMsg.text}</SpacedAlert> : null}

      <TextField
        fullWidth
        type="password"
        label="Current password"
        margin="normal"
        value={currentPwd}
        onChange={(e) => onCurrentPwdChange(e.target.value)}
        autoComplete="current-password"
      />
      <TextField
        fullWidth
        type="password"
        label="New password"
        margin="normal"
        value={newPwd}
        onChange={(e) => onNewPwdChange(e.target.value)}
        autoComplete="new-password"
        helperText={newPwd && newPwd.trim().length < 8 ? 'Use at least 8 characters.' : ' '}
      />

      <FormActions sx={{ mt: 1 }}>
        <ProfilePrimaryActionButton
          variant="contained"
          onClick={() => {
            onClearMsg();
            onSubmit();
          }}
          disabled={isPending || !canSubmitPwd}
        >
          {isPending ? 'Updating…' : 'Change Password'}
        </ProfilePrimaryActionButton>
      </FormActions>
    </ProfileSectionCard>
  );
};
