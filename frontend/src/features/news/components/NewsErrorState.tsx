import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';

import { PageCard, SectionContent, SectionHeader, StyledContainer } from '@shared/ui';

type Props = {
  message: string;
  onRefresh: () => void;
  isRefreshing: boolean;
};

export default function NewsErrorState({ message, onRefresh, isRefreshing }: Props) {
  return (
    <StyledContainer>
      <PageCard>
        <SectionHeader title="News" subheader="Latest headlines for your holdings." />
        <SectionContent>
          <Alert severity="error">{message || 'Failed to load news'}</Alert>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              onClick={onRefresh}
              startIcon={isRefreshing ? <CircularProgress size={18} /> : <RefreshRoundedIcon />}
              disabled={isRefreshing}
              sx={{ borderRadius: 2.5, fontWeight: 800 }}
            >
              {isRefreshing ? 'Refreshing…' : 'Refresh'}
            </Button>
          </Box>
        </SectionContent>
      </PageCard>
    </StyledContainer>
  );
}
