import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import NewspaperRoundedIcon from '@mui/icons-material/NewspaperRounded';

import {
  NewsBrandIcon,
  NewsBrandText,
  NewsHeaderActions,
  NewsHeaderWrap,
  NewsMoreChip,
  NewsRefreshDesktopButton,
  NewsSubheaderWrap,
  NewsTickerChip,
  NewsTickerChipsWrap,
  NewsUpdatedDot,
  NewsUpdatedPill,
  NewsUpdatedRow,
} from '@shared/ui';

type Props = {
  tickers: string[];
  symbols: string;
  updatedLabel: string;
  isRefreshing: boolean;
  onRefresh: () => void;
};

export default function NewsHeader({
  tickers,
  symbols,
  updatedLabel,
  isRefreshing,
  onRefresh,
}: Props) {
  return (
    <>
      <NewsHeaderWrap>
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
          <NewsBrandIcon>
            <NewspaperRoundedIcon fontSize="small" />
          </NewsBrandIcon>

          <NewsBrandText>
            <Typography variant="h6" fontWeight={950} noWrap>
              News
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              Headlines matched to your holdings
            </Typography>
          </NewsBrandText>
        </Stack>

        <NewsHeaderActions
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.25}
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          <NewsTickerChipsWrap>
            {tickers.slice(0, 8).map((t) => (
              <NewsTickerChip key={t} label={t} size="small" variant="outlined" />
            ))}
            {tickers.length > 8 ? (
              <NewsMoreChip label={`+${tickers.length - 8}`} size="small" variant="outlined" />
            ) : null}
          </NewsTickerChipsWrap>

          <NewsUpdatedRow>
            <NewsUpdatedPill dimmed={isRefreshing}>
              {isRefreshing ? <CircularProgress size={16} /> : <NewsUpdatedDot />}
              <Typography variant="body2" sx={{ fontWeight: 900, color: 'text.secondary' }}>
                {isRefreshing ? 'Refreshing…' : `Updated ${updatedLabel}`}
              </Typography>
            </NewsUpdatedPill>

            <NewsRefreshDesktopButton
              variant="outlined"
              onClick={onRefresh}
              startIcon={isRefreshing ? <CircularProgress size={18} /> : <RefreshRoundedIcon />}
              disabled={isRefreshing}
            >
              {isRefreshing ? 'Refreshing…' : 'Refresh'}
            </NewsRefreshDesktopButton>
          </NewsUpdatedRow>
        </NewsHeaderActions>
      </NewsHeaderWrap>

      <NewsSubheaderWrap>
        <Typography variant="body2" color="text.secondary">
          Showing the latest headlines for: <strong>{symbols.split(',').join(', ')}</strong>
        </Typography>
      </NewsSubheaderWrap>
    </>
  );
}
