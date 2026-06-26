import * as React from 'react';

/**
 * Status indicator pill. Always carries text (never colour-only).
 */
export interface StatusPillProps {
  /** Semantic tone. brand/ink fill solid; others use a soft tinted bg. */
  tone?: 'brand' | 'ok' | 'warn' | 'bad' | 'info' | 'neutral' | 'ink';
  /** Force a solid fill on an otherwise soft tone. */
  solid?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export function StatusPill(props: StatusPillProps): JSX.Element;
