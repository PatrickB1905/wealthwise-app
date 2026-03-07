import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

export const DialogFieldLabelWrap = styled('span')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(0.25),
}));

export const DialogSubmitButton = styled(Button)(() => ({
  minWidth: 140,
}));