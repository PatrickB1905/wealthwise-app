import {
  CalloutActions,
  CalloutSection,
  CalloutText,
  CalloutTitle,
  CalloutWrap,
  CTAButton,
} from '@shared/ui/layout/Styled';

type Props = {
  onRegister: () => void;
};

export function HomeCalloutSection({ onRegister }: Props) {
  return (
    <CalloutSection>
      <CalloutWrap maxWidth="lg">
        <CalloutTitle variant="h4" gutterBottom>
          Ready to Take Control of Your Portfolio Intelligence?
        </CalloutTitle>
        <CalloutText variant="body1">
          Create your account, add your positions, and access real-time portfolio valuation,
          advanced analytics, and curated market insight.
        </CalloutText>

        <CalloutActions>
          <CTAButton size="large" variant="contained" onClick={onRegister}>
            Get Started
          </CTAButton>
        </CalloutActions>
      </CalloutWrap>
    </CalloutSection>
  );
}
