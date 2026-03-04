import CircularProgress from '@mui/material/CircularProgress';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';

import { NewsMobileRefreshButton, NewsMobileStickyAction } from '@shared/ui';

type Props = {
  onRefresh: () => void;
  isRefreshing: boolean;
};

export default function NewsMobileStickyRefresh({ onRefresh, isRefreshing }: Props) {
  return (
    <NewsMobileStickyAction>
      <NewsMobileRefreshButton
        fullWidth
        variant="contained"
        onClick={onRefresh}
        startIcon={isRefreshing ? <CircularProgress size={18} /> : <RefreshRoundedIcon />}
        disabled={isRefreshing}
      >
        {isRefreshing ? 'Refreshing…' : 'Refresh headlines'}
      </NewsMobileRefreshButton>
    </NewsMobileStickyAction>
  );
}
