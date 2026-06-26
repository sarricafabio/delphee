import * as React from 'react';

/** Glass toast with a semantic icon. Auto-dismiss is the caller's job. */
export interface ToastProps {
  tone?: 'ok' | 'warn' | 'bad' | 'info' | 'brand';
  /** Leading icon node (semantic colour applied automatically). */
  icon?: React.ReactNode;
  title?: React.ReactNode;
  children?: React.ReactNode;
  /** Renders a × button when provided. */
  onDismiss?: () => void;
  style?: React.CSSProperties;
}

export function Toast(props: ToastProps): JSX.Element;
