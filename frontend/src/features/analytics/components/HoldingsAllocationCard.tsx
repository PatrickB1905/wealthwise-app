import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import type { Overview } from '../types/analytics';
import {
  AnalyticsTableHeadLabel,
  AnalyticsTableHeadLabelRight,
  AppTooltip,
  CenteredStack,
  EmptyStateText,
  EmptyStateTitle,
  InlineInfoAlert,
  MobileCardTopRow,
  MobileCardTitleRow,
  MobileField,
  MobileFieldGrid,
  MobileFieldLabel,
  MobileFieldValue,
  MobileListWrap,
  MobilePositionCard,
  PageCard,
  SectionContent,
  SectionHeader,
  TableWrap,
} from '@shared/ui';
import { InfoTip, TitleWithTip } from './AnalyticsInfoTip';

type Props = {
  overview: Overview;
  num: (val: unknown, fallback?: number) => number;
  money: (val: unknown) => string;
  pct: (val: unknown) => string;
  fixed: (val: unknown, digits: number, fallback?: number) => string;
  toneFromNumber: (val: number) => 'positive' | 'negative' | 'neutral';
};

export const HoldingsAllocationCard: React.FC<Props> = ({
  overview,
  num,
  money,
  pct,
  fixed,
  toneFromNumber,
}) => {
  const holdings = overview.holdings ?? [];

  return (
    <PageCard>
      <SectionHeader
        title={
          <TitleWithTip
            label="Holdings Allocation"
            tip="Position weights and unrealized P/L for your current holdings."
          />
        }
        subheader="Position weighting and unrealized performance"
      />

      <SectionContent>
        <InlineInfoAlert severity="info">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <span>
              Concentration — Top 5 weight: {fixed(overview.concentration?.top5WeightPercent, 2)}% •
              HHI: {fixed(overview.concentration?.hhi, 4)}
            </span>
            <InfoTip
              ariaLabel="Concentration info"
              title={
                <>
                  <strong>Top 5 weight</strong>: combined weight of your 5 largest holdings.
                  <br />
                  <strong>HHI</strong>: concentration score (higher = more concentrated).
                </>
              }
            />
          </Box>
        </InlineInfoAlert>

        {holdings.length === 0 ? (
          <CenteredStack>
            <EmptyStateTitle variant="h6">No holdings yet</EmptyStateTitle>
            <EmptyStateText variant="body2">
              Add positions to your portfolio to see allocation, weights, and unrealized performance
              here.
            </EmptyStateText>
          </CenteredStack>
        ) : (
          <>
            {/* Mobile */}
            <MobileListWrap sx={{ display: { xs: 'flex', md: 'none' } }}>
              {holdings.map((h) => {
                const pl = num(h.unrealizedPL, 0);
                const plPct = num(h.unrealizedPLPercent, 0);
                const tone = toneFromNumber(pl);

                const priceText = h.currentPrice != null ? `$${money(h.currentPrice)}` : '—';
                const mvText = h.marketValue != null ? `$${money(h.marketValue)}` : '—';
                const weightText = h.weight != null ? `${pct(h.weight)}%` : '—';
                const plText =
                  h.unrealizedPL != null ? `$${money(h.unrealizedPL)} (${pct(plPct)}%)` : '—';

                return (
                  <MobilePositionCard key={h.ticker}>
                    <MobileCardTopRow>
                      <MobileCardTitleRow>
                        <Typography variant="h6" fontWeight={950} noWrap>
                          {h.ticker}
                        </Typography>

                        <AppTooltip title="Portfolio weight for this holding.">
                          <Typography variant="body2" color="text.secondary" noWrap>
                            Weight {weightText}
                          </Typography>
                        </AppTooltip>
                      </MobileCardTitleRow>

                      <AppTooltip title="Unrealized profit/loss for this holding.">
                        <span>
                          <MobileFieldValue tone={tone} variant="body1" noWrap>
                            {plText}
                          </MobileFieldValue>
                        </span>
                      </AppTooltip>
                    </MobileCardTopRow>

                    <MobileFieldGrid sx={{ mt: 1.5 }}>
                      <MobileField>
                        <MobileFieldLabel>Qty</MobileFieldLabel>
                        <AppTooltip title="Total units held.">
                          <span>
                            <MobileFieldValue variant="body2">
                              {fixed(h.quantity, 4)}
                            </MobileFieldValue>
                          </span>
                        </AppTooltip>
                      </MobileField>

                      <MobileField>
                        <MobileFieldLabel>Avg Cost</MobileFieldLabel>
                        <AppTooltip title="Average buy price per unit.">
                          <span>
                            <MobileFieldValue variant="body2">${money(h.avgCost)}</MobileFieldValue>
                          </span>
                        </AppTooltip>
                      </MobileField>

                      <MobileField>
                        <MobileFieldLabel>Price</MobileFieldLabel>
                        <AppTooltip title="Latest available price.">
                          <span>
                            <MobileFieldValue variant="body2">{priceText}</MobileFieldValue>
                          </span>
                        </AppTooltip>
                      </MobileField>

                      <MobileField>
                        <MobileFieldLabel>Market Value</MobileFieldLabel>
                        <AppTooltip title="Position value = price × quantity.">
                          <span>
                            <MobileFieldValue variant="body2">{mvText}</MobileFieldValue>
                          </span>
                        </AppTooltip>
                      </MobileField>
                    </MobileFieldGrid>
                  </MobilePositionCard>
                );
              })}
            </MobileListWrap>

            {/* Desktop */}
            <TableWrap component={Paper} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <AnalyticsTableHeadLabel>
                        Ticker
                        <InfoTip
                          ariaLabel="Ticker info"
                          title="The asset symbol (e.g., AAPL, BTC-USD)."
                        />
                      </AnalyticsTableHeadLabel>
                    </TableCell>

                    <TableCell align="right">
                      <AnalyticsTableHeadLabelRight>
                        Qty
                        <InfoTip
                          ariaLabel="Quantity info"
                          title="Total units held for this symbol."
                        />
                      </AnalyticsTableHeadLabelRight>
                    </TableCell>

                    <TableCell align="right">
                      <AnalyticsTableHeadLabelRight>
                        Avg Cost
                        <InfoTip
                          ariaLabel="Average cost info"
                          title="Average buy price per unit."
                        />
                      </AnalyticsTableHeadLabelRight>
                    </TableCell>

                    <TableCell align="right">
                      <AnalyticsTableHeadLabelRight>
                        Price
                        <InfoTip
                          ariaLabel="Price info"
                          title="Latest available price for the symbol."
                        />
                      </AnalyticsTableHeadLabelRight>
                    </TableCell>

                    <TableCell align="right">
                      <AnalyticsTableHeadLabelRight>
                        Market Value
                        <InfoTip
                          ariaLabel="Market value info"
                          title="Position value = price × quantity."
                        />
                      </AnalyticsTableHeadLabelRight>
                    </TableCell>

                    <TableCell align="right">
                      <AnalyticsTableHeadLabelRight>
                        Unrealized P/L
                        <InfoTip
                          ariaLabel="Unrealized profit/loss info"
                          title="Profit/loss if you sold at the latest price (not realized yet)."
                        />
                      </AnalyticsTableHeadLabelRight>
                    </TableCell>

                    <TableCell align="right">
                      <AnalyticsTableHeadLabelRight>
                        Weight
                        <InfoTip
                          ariaLabel="Weight info"
                          title="Percentage of your portfolio value represented by this holding."
                        />
                      </AnalyticsTableHeadLabelRight>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {holdings.map((h) => {
                    const pl = num(h.unrealizedPL, 0);
                    const plPct = num(h.unrealizedPLPercent, 0);
                    const plToneRow = toneFromNumber(pl);

                    const weightText = h.weight != null ? `${pct(h.weight)}%` : '—';
                    const plText =
                      h.unrealizedPL != null ? `$${money(h.unrealizedPL)} (${pct(plPct)}%)` : '—';

                    const plColor =
                      plToneRow === 'positive'
                        ? 'success.main'
                        : plToneRow === 'negative'
                          ? 'error.main'
                          : 'text.primary';

                    return (
                      <TableRow key={h.ticker}>
                        <TableCell>{h.ticker}</TableCell>
                        <TableCell align="right">{fixed(h.quantity, 4)}</TableCell>
                        <TableCell align="right">${money(h.avgCost)}</TableCell>
                        <TableCell align="right">
                          {h.currentPrice != null ? `$${money(h.currentPrice)}` : '—'}
                        </TableCell>
                        <TableCell align="right">
                          {h.marketValue != null ? `$${money(h.marketValue)}` : '—'}
                        </TableCell>
                        <TableCell align="right">
                          <AppTooltip title="Dollar P/L with percent in brackets.">
                            <span>
                              <Typography variant="body2" color={plColor}>
                                {plText}
                              </Typography>
                            </span>
                          </AppTooltip>
                        </TableCell>
                        <TableCell align="right">{weightText}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableWrap>
          </>
        )}
      </SectionContent>
    </PageCard>
  );
};
