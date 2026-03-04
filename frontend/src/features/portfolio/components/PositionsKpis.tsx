import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import {
  AppTooltip,
  InlineIconWrap,
  KpiCard,
  KpiCardContent,
  KpiGrid,
  KpiInfoButton,
  KpiLabel,
  KpiSub,
  KpiTopRow,
  KpiValue,
  SkeletonBlock,
} from '@shared/ui';

import type { PricingTotals } from '../hooks/usePositionsPage';
import { money } from '../utils/format';
import type { Tone } from '../types/tone';

type Props = {
  loading: boolean;
  tab: 'open' | 'closed';
  pricing: PricingTotals;
  totalsProfitTone: Tone;
  totalsPctTone: Tone;
};

export function PositionsKpis({ loading, tab, pricing, totalsProfitTone, totalsPctTone }: Props) {
  return (
    <KpiGrid>
      <KpiCard>
        <KpiCardContent>
          <KpiTopRow>
            <KpiLabel variant="caption">Invested</KpiLabel>

            <InlineIconWrap>
              <AppTooltip title="Total cost basis for the positions shown (buy price × quantity).">
                <KpiInfoButton aria-label="Invested info">
                  <InfoOutlinedIcon fontSize="small" />
                </KpiInfoButton>
              </AppTooltip>
            </InlineIconWrap>
          </KpiTopRow>

          {loading ? (
            <SkeletonBlock variant="text" height={40} width="70%" />
          ) : (
            <KpiValue variant="h4" tone="neutral">
              {money(pricing.totalInvested)}
            </KpiValue>
          )}

          <KpiSub variant="body2">
            {tab === 'open'
              ? 'Total cost basis across open positions.'
              : 'Total cost basis across closed trades.'}
          </KpiSub>
        </KpiCardContent>
      </KpiCard>

      <KpiCard>
        <KpiCardContent>
          <KpiTopRow>
            <KpiLabel variant="caption">Total P/L</KpiLabel>

            <InlineIconWrap>
              <AppTooltip
                title={
                  tab === 'open'
                    ? 'Unrealized profit/loss across open positions based on available live quotes.'
                    : 'Realized profit/loss across closed positions (sell price × quantity − cost basis).'
                }
              >
                <KpiInfoButton aria-label="Total profit/loss info">
                  <InfoOutlinedIcon fontSize="small" />
                </KpiInfoButton>
              </AppTooltip>
            </InlineIconWrap>
          </KpiTopRow>

          {loading ? (
            <SkeletonBlock variant="text" height={40} width="75%" />
          ) : (
            <KpiValue variant="h4" tone={totalsProfitTone}>
              {money(pricing.totalProfitKnown)}
            </KpiValue>
          )}

          <KpiSub variant="body2">
            {tab === 'open'
              ? 'Computed where live quotes are available.'
              : 'Realized profit/loss on closed positions.'}
          </KpiSub>
        </KpiCardContent>
      </KpiCard>

      <KpiCard>
        <KpiCardContent>
          <KpiTopRow>
            <KpiLabel variant="caption">Total Return</KpiLabel>

            <InlineIconWrap>
              <AppTooltip title="Portfolio-level return based on known pricing (Total P/L ÷ Invested).">
                <KpiInfoButton aria-label="Total return info">
                  <InfoOutlinedIcon fontSize="small" />
                </KpiInfoButton>
              </AppTooltip>
            </InlineIconWrap>
          </KpiTopRow>

          {loading ? (
            <SkeletonBlock variant="text" height={40} width="60%" />
          ) : (
            <KpiValue variant="h4" tone={totalsPctTone}>
              {pricing.totalProfitPctKnown.toFixed(2)}%
            </KpiValue>
          )}

          <KpiSub variant="body2">Portfolio-level return based on known pricing.</KpiSub>
        </KpiCardContent>
      </KpiCard>

      <KpiCard>
        <KpiCardContent>
          <KpiTopRow>
            <KpiLabel variant="caption">Quote Health</KpiLabel>

            <InlineIconWrap>
              <AppTooltip
                title={
                  tab === 'open'
                    ? 'Shows how many open positions are missing a live price right now.'
                    : 'Quote health is only relevant for open positions with live pricing.'
                }
              >
                <KpiInfoButton aria-label="Quote health info">
                  <InfoOutlinedIcon fontSize="small" />
                </KpiInfoButton>
              </AppTooltip>
            </InlineIconWrap>
          </KpiTopRow>

          {loading ? (
            <SkeletonBlock variant="text" height={40} width={55} />
          ) : (
            <KpiValue
              variant="h4"
              tone={tab === 'open' && pricing.missingQuotes > 0 ? 'negative' : 'neutral'}
            >
              {tab === 'open' ? `${pricing.missingQuotes}` : '—'}
            </KpiValue>
          )}

          <KpiSub variant="body2">
            {tab === 'open'
              ? 'Positions missing live pricing right now.'
              : 'Quote health is only relevant for open positions.'}
          </KpiSub>
        </KpiCardContent>
      </KpiCard>
    </KpiGrid>
  );
}
