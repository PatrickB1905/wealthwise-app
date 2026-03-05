import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableFooter from '@mui/material/TableFooter';
import TableRow from '@mui/material/TableRow';

import {
  PositionsActions,
  PositionsTableContainer,
  ProfitCell,
  QuoteFreshDot,
  QuoteMetaWrap,
  QuoteTooltip,
  StickyTableHead,
  TickerCell,
  TickerLogo,
  TotalsRow,
} from '@shared/ui';

import type { RemoteQuote } from '@features/market-data/hooks/useQuotes';
import type { Position } from '../types/position';
import {
  isFiniteNumber,
  money,
  normalizeSymbol,
  tableCellMoney,
  toneFromNumber,
} from '../utils/format';
import { quoteState } from '../utils/quotes';
import type { PricingTotals } from '../hooks/usePositionsPage';

type Props = {
  tab: 'open' | 'closed';
  positions: Position[];
  quotesMap: Record<string, RemoteQuote>;
  pricing: PricingTotals;

  onClose: (p: Position) => void;
  onEdit: (p: Position) => void;
  onDelete: (p: Position) => void;
};

export function PositionsDesktopTable({
  tab,
  positions,
  quotesMap,
  pricing,
  onClose,
  onEdit,
  onDelete,
}: Props) {
  const totalsProfitTone = toneFromNumber(pricing.totalProfitKnown);
  const totalsPctTone = toneFromNumber(pricing.totalProfitPctKnown);

  return (
    <PositionsTableContainer component={Paper}>
      <Table size="small" stickyHeader>
        <StickyTableHead>
          <TableRow>
            <TableCell>Ticker</TableCell>
            <TableCell align="right">Buy Price</TableCell>
            <TableCell align="right">Quantity</TableCell>
            <TableCell align="right">{tab === 'open' ? 'Current Price' : 'Sell Price'}</TableCell>
            <TableCell align="right">Invested</TableCell>
            <TableCell align="right">P/L (%)</TableCell>
            <TableCell align="right">P/L</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </StickyTableHead>

        <TableBody>
          {positions.map((pos) => {
            const cost = pos.buyPrice * pos.quantity;

            if (tab === 'closed') {
              const price = isFiniteNumber(pos.sellPrice) ? pos.sellPrice : pos.buyPrice;
              const profit = price * pos.quantity - cost;
              const pctVal = cost ? (profit / cost) * 100 : 0;

              return (
                <TableRow key={pos.id} hover>
                  <TableCell>
                    <TickerCell>
                      <TickerLogo>
                        <Avatar
                          src={quotesMap[normalizeSymbol(pos.ticker)]?.logoUrl}
                          alt={pos.ticker}
                        />
                      </TickerLogo>
                      {normalizeSymbol(pos.ticker)}
                    </TickerCell>
                  </TableCell>

                  <TableCell align="right">{tableCellMoney(pos.buyPrice)}</TableCell>
                  <TableCell align="right">{pos.quantity}</TableCell>
                  <TableCell align="right">{tableCellMoney(price)}</TableCell>
                  <TableCell align="right">{money(cost)}</TableCell>

                  <ProfitCell align="right" tone={toneFromNumber(pctVal)}>
                    {pctVal.toFixed(2)}%
                  </ProfitCell>

                  <ProfitCell align="right" tone={toneFromNumber(profit)}>
                    {money(profit)}
                  </ProfitCell>

                  <TableCell align="center">
                    <PositionsActions>
                      <Button size="small" variant="outlined" onClick={() => onEdit(pos)}>
                        Edit
                      </Button>

                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => onDelete(pos)}
                      >
                        Delete
                      </Button>
                    </PositionsActions>
                  </TableCell>
                </TableRow>
              );
            }

            const sym = normalizeSymbol(pos.ticker);
            const q = quotesMap[sym];
            const price = q && isFiniteNumber(q.currentPrice) ? q.currentPrice : null;

            const profit = price != null ? price * pos.quantity - cost : null;
            const pctVal = profit != null && cost ? (profit / cost) * 100 : null;

            const { state, tip } = quoteState(q);

            return (
              <TableRow key={pos.id} hover>
                <TableCell>
                  <TickerCell>
                    <TickerLogo>
                      <Avatar src={q?.logoUrl} alt={sym} />
                    </TickerLogo>

                    <QuoteMetaWrap>
                      {sym}
                      <QuoteTooltip title={tip} placement="top">
                        <span>
                          <QuoteFreshDot state={state} />
                        </span>
                      </QuoteTooltip>
                    </QuoteMetaWrap>
                  </TickerCell>
                </TableCell>

                <TableCell align="right">{money(pos.buyPrice)}</TableCell>
                <TableCell align="right">{pos.quantity}</TableCell>
                <TableCell align="right">{price != null ? money(price) : '—'}</TableCell>
                <TableCell align="right">{money(cost)}</TableCell>

                <ProfitCell align="right" tone={toneFromNumber(pctVal ?? 0)}>
                  {pctVal != null ? `${pctVal.toFixed(2)}%` : '—'}
                </ProfitCell>

                <ProfitCell align="right" tone={toneFromNumber(profit ?? 0)}>
                  {profit != null ? money(profit) : '—'}
                </ProfitCell>

                <TableCell align="center">
                  <PositionsActions>
                    <Button size="small" variant="outlined" onClick={() => onClose(pos)}>
                      Close
                    </Button>

                    <Button size="small" variant="outlined" onClick={() => onEdit(pos)}>
                      Edit
                    </Button>

                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => onDelete(pos)}
                    >
                      Delete
                    </Button>
                  </PositionsActions>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>

        <TableFooter>
          <TotalsRow>
            <TableCell>
              <strong>Totals</strong>
            </TableCell>
            <TableCell />
            <TableCell />
            <TableCell />
            <TableCell align="right">
              <strong>{money(pricing.totalInvested)}</strong>
            </TableCell>

            <ProfitCell align="right" tone={totalsPctTone}>
              <strong>{pricing.totalProfitPctKnown.toFixed(2)}%</strong>
            </ProfitCell>

            <ProfitCell align="right" tone={totalsProfitTone}>
              <strong>{money(pricing.totalProfitKnown)}</strong>
            </ProfitCell>

            <TableCell />
          </TotalsRow>
        </TableFooter>
      </Table>
    </PositionsTableContainer>
  );
}
