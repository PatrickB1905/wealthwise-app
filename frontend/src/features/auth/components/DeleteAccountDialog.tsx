import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { ProfileDialogActions, ProfileDialogButton, SpacedAlert } from '@shared/ui/layout/Styled';

type Props = {
  open: boolean;
  onClose: () => void;
  deleteError: string;
  onConfirm: () => void;
  isPending: boolean;
  onClearError: () => void;
};

export const DeleteAccountDialog: React.FC<Props> = ({
  open,
  onClose,
  deleteError,
  onConfirm,
  isPending,
  onClearError,
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Confirm account deletion</DialogTitle>
      <DialogContent>
        <Stack spacing={1.25} sx={{ mt: 0.5 }}>
          <Typography>
            Are you sure you want to permanently delete your account? This cannot be undone.
          </Typography>
          {deleteError ? <SpacedAlert severity="error">{deleteError}</SpacedAlert> : null}
        </Stack>
      </DialogContent>

      <ProfileDialogActions>
        <ProfileDialogButton onClick={onClose}>Cancel</ProfileDialogButton>
        <ProfileDialogButton
          variant="contained"
          color="error"
          onClick={() => {
            onClearError();
            onConfirm();
          }}
          disabled={isPending}
        >
          {isPending ? 'Deleting…' : 'Delete account'}
        </ProfileDialogButton>
      </ProfileDialogActions>
    </Dialog>
  );
};
