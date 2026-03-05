import React from 'react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { AnalyticsLabelInline, AppTooltip, KpiInfoButton } from '@shared/ui';

export const InfoTip: React.FC<{ title: React.ReactNode; ariaLabel: string }> = ({
  title,
  ariaLabel,
}) => (
  <AppTooltip title={title}>
    <span>
      <KpiInfoButton aria-label={ariaLabel}>
        <InfoOutlinedIcon fontSize="small" />
      </KpiInfoButton>
    </span>
  </AppTooltip>
);

export const TitleWithTip: React.FC<{ label: string; tip: React.ReactNode }> = ({ label, tip }) => (
  <AnalyticsLabelInline>
    <span>{label}</span>
    <InfoTip title={tip} ariaLabel={`${label} info`} />
  </AnalyticsLabelInline>
);
