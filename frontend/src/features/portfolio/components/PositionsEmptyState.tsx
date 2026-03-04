import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { EmptyStateWrap } from '@shared/ui';

type Props = {
  tab: 'open' | 'closed';
  onAdd: () => void;
};

export function PositionsEmptyState({ tab, onAdd }: Props) {
  return (
    <EmptyStateWrap>
      <Typography variant="h6" fontWeight={900}>
        No {tab} positions yet
      </Typography>
      <Typography color="text.secondary">
        {tab === 'open'
          ? 'Add your first position to start tracking live pricing and portfolio performance.'
          : 'When you close a position, it will appear here.'}
      </Typography>

      {tab === 'open' ? (
        <Button variant="contained" onClick={onAdd}>
          Add your first position
        </Button>
      ) : null}
    </EmptyStateWrap>
  );
}
