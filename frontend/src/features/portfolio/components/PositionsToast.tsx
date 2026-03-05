import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

import { ToastAlert, ToastSnackbar } from '@shared/ui';
import type { ToastState } from '../hooks/usePositionsPage';

type Props = {
  toast: ToastState;
  onClose: () => void;
};

export function PositionsToast({ toast, onClose }: Props) {
  return (
    <ToastSnackbar
      open={toast.open}
      onClose={(_, reason) => {
        if (reason === 'clickaway') return;
        onClose();
      }}
      autoHideDuration={3200}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <ToastAlert
        severity={toast.severity}
        variant="filled"
        iconMapping={{
          success: <CheckCircleRoundedIcon fontSize="inherit" />,
        }}
      >
        {toast.message}
      </ToastAlert>
    </ToastSnackbar>
  );
}
