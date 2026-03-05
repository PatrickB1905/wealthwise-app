import Typography from '@mui/material/Typography';

import {
  MobileField,
  MobileFieldGrid,
  MobileFieldLabel,
  MobileFieldValue,
  SoftDivider,
  TotalsCard,
} from '@shared/ui';

import { money, toneFromNumber } from '../utils/format';
import type { PricingTotals } from '../hooks/usePositionsPage';

type Props = {
  pricing: PricingTotals;
};

export function PositionsTotalsCard({ pricing }: Props) {
  const totalsProfitTone = toneFromNumber(pricing.totalProfitKnown);
  const totalsPctTone = toneFromNumber(pricing.totalProfitPctKnown);

  return (
    <TotalsCard>
      <Typography sx={{ fontWeight: 950, letterSpacing: '-0.02em' }}>Totals</Typography>
      <SoftDivider />
      <MobileFieldGrid>
        <MobileField>
          <MobileFieldLabel>Invested</MobileFieldLabel>
          <MobileFieldValue>{money(pricing.totalInvested)}</MobileFieldValue>
        </MobileField>
        <MobileField>
          <MobileFieldLabel>Total P/L</MobileFieldLabel>
          <MobileFieldValue tone={totalsProfitTone}>
            {money(pricing.totalProfitKnown)}
          </MobileFieldValue>
        </MobileField>
        <MobileField>
          <MobileFieldLabel>Total Return</MobileFieldLabel>
          <MobileFieldValue tone={totalsPctTone}>
            {pricing.totalProfitPctKnown.toFixed(2)}%
          </MobileFieldValue>
        </MobileField>
      </MobileFieldGrid>
    </TotalsCard>
  );
}
