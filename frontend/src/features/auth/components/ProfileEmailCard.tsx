import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';

import type { BannerMsg } from '../types/profile';
import {
  FormActions,
  ProfileIconBox,
  ProfilePrimaryActionButton,
  ProfileSectionCard,
  SpacedAlert,
} from '@shared/ui/layout/Styled';

type Props = {
  newEmail: string;
  onNewEmailChange: (next: string) => void;
  emailMsg: BannerMsg | null;
  canSubmitEmail: boolean;
  isPending: boolean;
  onSubmit: () => void;
  onClearMsg: () => void;
};

export const ProfileEmailCard: React.FC<Props> = ({
  newEmail,
  onNewEmailChange,
  emailMsg,
  canSubmitEmail,
  isPending,
  onSubmit,
  onClearMsg,
}) => {
  return (
    <ProfileSectionCard variant="outlined">
      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1.25 }}>
        <ProfileIconBox>
          <EmailRoundedIcon fontSize="small" />
        </ProfileIconBox>

        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 950 }} noWrap>
            Email
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            Used for login and notifications
          </Typography>
        </Box>
      </Stack>

      {emailMsg ? <SpacedAlert severity={emailMsg.type}>{emailMsg.text}</SpacedAlert> : null}

      <TextField
        fullWidth
        label="Email address"
        margin="normal"
        value={newEmail}
        onChange={(e) => onNewEmailChange(e.target.value)}
        autoComplete="email"
      />

      <FormActions sx={{ mt: 1 }}>
        <ProfilePrimaryActionButton
          variant="contained"
          onClick={() => {
            onClearMsg();
            onSubmit();
          }}
          disabled={isPending || !canSubmitEmail}
        >
          {isPending ? 'Updating…' : 'Update Email'}
        </ProfilePrimaryActionButton>
      </FormActions>
    </ProfileSectionCard>
  );
};
