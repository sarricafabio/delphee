import * as React from 'react';

/** Square icon-only ghost button. Always pass an accessible `label`. */
export interface IconButtonProps {
  size?: 'sm' | 'md' | 'lg';
  /** Accessible name (sets aria-label + title). Required. */
  label: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Icon node (Lucide, 16–20px). */
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export function IconButton(props: IconButtonProps): JSX.Element;
