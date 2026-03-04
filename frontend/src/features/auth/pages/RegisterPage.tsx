import React from 'react';

import { HeroOverlay, HeroSection } from '@shared/ui/layout/Styled';

import { useRegisterPage } from '../hooks/useRegisterPage';
import { RegisterTopNav } from '../components/RegisterTopNav';
import { RegisterCard } from '../components/RegisterCard';

const RegisterPage: React.FC = () => {
  const vm = useRegisterPage();

  return (
    <HeroSection>
      <HeroOverlay />

      <RegisterTopNav onBackToHome={vm.goHome} onGoLogin={vm.goLogin} />
      <RegisterCard vm={vm} />
    </HeroSection>
  );
};

export default RegisterPage;
