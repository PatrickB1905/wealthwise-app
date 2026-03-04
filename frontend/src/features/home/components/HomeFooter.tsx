import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import {
  FooterBottom,
  FooterGrid,
  FooterLink,
  FooterSection,
  FooterTitle,
} from '@shared/ui/layout/Styled';
import type { NavSectionId } from '../types/home';

type Props = {
  year: number;
  onNavSection: (id: NavSectionId) => void;
  onRegister: () => void;
  onLogin: () => void;
  onOpenApp: () => void;
};

export function HomeFooter({ year, onNavSection, onRegister, onLogin, onOpenApp }: Props) {
  return (
    <FooterSection>
      <FooterGrid maxWidth="lg">
        <Stack spacing={1}>
          <FooterTitle variant="h6">WealthWise</FooterTitle>
          <Typography variant="body2" color="text.secondary">
            A unified portfolio intelligence platform built to connect positions, performance
            analytics, and market insight into one structured experience.
          </Typography>
        </Stack>

        <Stack spacing={0.8}>
          <Typography sx={{ fontWeight: 950 }}>Product</Typography>
          <FooterLink onClick={() => onNavSection('features')}>Features</FooterLink>
          <FooterLink onClick={() => onNavSection('how')}>How it works</FooterLink>
          <FooterLink onClick={() => onNavSection('plans')}>Plans</FooterLink>
        </Stack>

        <Stack spacing={0.8}>
          <Typography sx={{ fontWeight: 950 }}>Company</Typography>
          <FooterLink onClick={onRegister}>Create account</FooterLink>
          <FooterLink onClick={onLogin}>Log in</FooterLink>
          <FooterLink onClick={onOpenApp}>Open app</FooterLink>
        </Stack>

        <Stack spacing={0.8}>
          <Typography sx={{ fontWeight: 950 }}>Resources</Typography>
          <FooterLink onClick={() => onNavSection('faq')}>FAQ</FooterLink>
          <FooterLink onClick={() => onNavSection('features')}>Overview</FooterLink>
          <FooterLink onClick={() => onNavSection('plans')}>Plans</FooterLink>
        </Stack>
      </FooterGrid>

      <FooterBottom maxWidth="lg">
        <Typography variant="body2" color="text.secondary">
          &copy; {year} WealthWise. All rights reserved.
        </Typography>
      </FooterBottom>
    </FooterSection>
  );
}
