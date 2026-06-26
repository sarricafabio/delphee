import * as React from 'react';

/**
 * Delphee primary action button.
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual weight. Primary = glossy brand fill (one per view). */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Control height. */
  size?: 'sm' | 'md' | 'lg';
  /** Leading icon (Lucide node, 16–18px). */
  icon?: React.ReactNode;
  /** Trailing icon. */
  iconRight?: React.ReactNode;
  /** Shows a spinner, sets aria-busy and disables the control. */
  loading?: boolean;
  /** Stretch to container width. */
  fullWidth?: boolean;
}

export function Button(props: ButtonProps): JSX.Element;
