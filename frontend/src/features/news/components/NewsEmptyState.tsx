import React from 'react';
import Button from '@mui/material/Button';

import { CenteredStack, EmptyStateText, EmptyStateTitle } from '@shared/ui';

type Props = {
  title: string;
  description: string;
  action?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;

  disabled?: boolean;
  startIcon?: React.ReactNode;
  variant?: 'contained' | 'outlined';
};

export default function NewsEmptyState({
  title,
  description,
  action,
  actionLabel,
  onAction,
  disabled,
  startIcon,
  variant = 'outlined',
}: Props) {
  return (
    <CenteredStack>
      <EmptyStateTitle variant="h6">{title}</EmptyStateTitle>
      <EmptyStateText variant="body2">{description}</EmptyStateText>

      {action ? (
        action
      ) : actionLabel && onAction ? (
        <Button
          variant={variant}
          onClick={onAction}
          startIcon={startIcon}
          disabled={disabled}
          sx={{ borderRadius: 2.5, fontWeight: 800 }}
        >
          {actionLabel}
        </Button>
      ) : null}
    </CenteredStack>
  );
}
