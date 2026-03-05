import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import {
  MobileCardActions,
  MobileCardMetaRow,
  MobileCardTitleRow,
  MobileCardTopRow,
  MobileField,
  MobileFieldGrid,
  MobileFieldLabel,
  MobileFieldValue,
  MobileListWrap,
  MobilePositionCard,
  MobileTickerAvatar,
  MobileTickerPrice,
  MobileTickerSymbol,
  QuoteFreshDot,
  QuoteMetaWrap,
  QuoteTooltip,
  SoftDivider,
} from '@shared/ui';

import type { Position } from '../types/position';
import {
  money,
  normalizeSymbol,
  tableCellMoney,
  toneFromNumber,
  isFiniteNumber,
} from '../utils/format';
import { quoteState } from '../utils/quotes';
import type { RemoteQuote } from '@features/market-data/hooks/useQuotes';

type Props = {
  tab: 'open' | 'closed';
  positions: Position[];
  quotesMap: Record<string, RemoteQuote>;

  onClose: (p: Position) => void;
  onEdit: (p: Position) => void;
  onDelete: (p: Position) => void;
};

export function PositionsMobileList({
  tab,
  positions,
  quotesMap,
  onClose,
  onEdit,
  onDelete,
}: Props) {
  return (
    <MobileListWrap>
      {positions.map((pos) => {
        const sym = normalizeSymbol(pos.ticker);
        const q = quotesMap[sym];
        const { state, tip } = quoteState(q);

        const cost = pos.buyPrice * pos.quantity;

        if (tab === 'closed') {
          const price = isFiniteNumber(pos.sellPrice) ? pos.sellPrice : pos.buyPrice;
          const profit = price * pos.quantity - cost;
          const pctVal = cost ? (profit / cost) * 100 : 0;
          const profitTone = toneFromNumber(profit);
          const pctTone = toneFromNumber(pctVal);

          return (
            <MobilePositionCard key={pos.id}>
              <MobileCardTopRow>
                <MobileCardTitleRow>
                  <MobileTickerAvatar src={q?.logoUrl} alt={sym} />
                  <MobileTickerSymbol>{sym}</MobileTickerSymbol>
                </MobileCardTitleRow>

                <QuoteTooltip title={tip} placement="top">
                  <span>
                    <QuoteFreshDot state={state} />
                  </span>
                </QuoteTooltip>
              </MobileCardTopRow>

              <MobileCardMetaRow>
                <Typography variant="body2" color="text.secondary">
                  Closed trade
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Qty {pos.quantity}
                </Typography>
              </MobileCardMetaRow>

              <SoftDivider />

              <MobileFieldGrid>
                <MobileField>
                  <MobileFieldLabel>Buy</MobileFieldLabel>
                  <MobileFieldValue>{tableCellMoney(pos.buyPrice)}</MobileFieldValue>
                </MobileField>

                <MobileField>
                  <MobileFieldLabel>Sell</MobileFieldLabel>
                  <MobileFieldValue>{tableCellMoney(price)}</MobileFieldValue>
                </MobileField>

                <MobileField>
                  <MobileFieldLabel>Invested</MobileFieldLabel>
                  <MobileFieldValue>{money(cost)}</MobileFieldValue>
                </MobileField>

                <MobileField>
                  <MobileFieldLabel>P/L</MobileFieldLabel>
                  <MobileFieldValue tone={profitTone}>{money(profit)}</MobileFieldValue>
                </MobileField>

                <MobileField>
                  <MobileFieldLabel>Return</MobileFieldLabel>
                  <MobileFieldValue tone={pctTone}>{pctVal.toFixed(2)}%</MobileFieldValue>
                </MobileField>
              </MobileFieldGrid>

              <SoftDivider />

              <MobileCardActions>
                <Button size="small" variant="outlined" onClick={() => onEdit(pos)}>
                  Edit
                </Button>

                <Button size="small" variant="outlined" color="error" onClick={() => onDelete(pos)}>
                  Delete
                </Button>
              </MobileCardActions>
            </MobilePositionCard>
          );
        }

        const price = q && isFiniteNumber(q.currentPrice) ? q.currentPrice : null;
        const profit = price != null ? price * pos.quantity - cost : null;
        const pctVal = profit != null && cost ? (profit / cost) * 100 : null;

        const profitTone = toneFromNumber(profit ?? 0);
        const pctTone = toneFromNumber(pctVal ?? 0);

        return (
          <MobilePositionCard key={pos.id}>
            <MobileCardTopRow>
              <MobileCardTitleRow>
                <MobileTickerAvatar src={q?.logoUrl} alt={sym} />

                <QuoteMetaWrap>
                  <MobileTickerSymbol>{sym}</MobileTickerSymbol>

                  <QuoteTooltip title={tip} placement="top">
                    <span>
                      <QuoteFreshDot state={state} />
                    </span>
                  </QuoteTooltip>
                </QuoteMetaWrap>
              </MobileCardTitleRow>

              <MobileTickerPrice>{price != null ? money(price) : '—'}</MobileTickerPrice>
            </MobileCardTopRow>

            <MobileCardMetaRow>
              <Typography variant="body2" color="text.secondary">
                Qty {pos.quantity}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Invested {money(cost)}
              </Typography>
            </MobileCardMetaRow>

            <SoftDivider />

            <MobileFieldGrid>
              <MobileField>
                <MobileFieldLabel>Buy</MobileFieldLabel>
                <MobileFieldValue>{money(pos.buyPrice)}</MobileFieldValue>
              </MobileField>

              <MobileField>
                <MobileFieldLabel>Current</MobileFieldLabel>
                <MobileFieldValue>{price != null ? money(price) : '—'}</MobileFieldValue>
              </MobileField>

              <MobileField>
                <MobileFieldLabel>P/L</MobileFieldLabel>
                <MobileFieldValue tone={profitTone}>
                  {profit != null ? money(profit) : '—'}
                </MobileFieldValue>
              </MobileField>

              <MobileField>
                <MobileFieldLabel>Return</MobileFieldLabel>
                <MobileFieldValue tone={pctTone}>
                  {pctVal != null ? `${pctVal.toFixed(2)}%` : '—'}
                </MobileFieldValue>
              </MobileField>
            </MobileFieldGrid>

            <SoftDivider />

            <MobileCardActions>
              <Button size="small" variant="outlined" onClick={() => onClose(pos)}>
                Close
              </Button>

              <Button size="small" variant="outlined" onClick={() => onEdit(pos)}>
                Edit
              </Button>

              <Button size="small" variant="outlined" color="error" onClick={() => onDelete(pos)}>
                Delete
              </Button>
            </MobileCardActions>
          </MobilePositionCard>
        );
      })}
    </MobileListWrap>
  );
}
