import type React from 'react';
import type { SvgIconProps } from '@mui/material/SvgIcon';

export type NavSectionId = 'features' | 'how' | 'plans' | 'faq';

export type MuiIconComponent = React.ComponentType<SvgIconProps>;

export type IconSpec = {
  Icon: MuiIconComponent;
  props?: SvgIconProps;
};

export type FeatureCard = {
  title: string;
  description: string;
  accentIcon: IconSpec;
};

export type StepItem = {
  title: string;
  desc: string;
};

export type FaqItem = {
  q: string;
  a: string;
};

export type ValuePropItem = {
  title: string;
  desc: string;
  icon: IconSpec;
};

export type HighlightItem = {
  icon: IconSpec;
  title: string;
  desc: string;
};

export type TrustItem = {
  icon: IconSpec;
  title: string;
  desc: string;
};
