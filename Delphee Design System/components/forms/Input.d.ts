import * as React from 'react';

/**
 * Labelled text input with the recessed "well" material.
 */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'style'> {
  /** Sentence-case label above the field. */
  label?: string;
  /** Helper text below the field (ink-3). */
  helper?: string;
  /** Error message — turns the field + helper red and sets aria-invalid. */
  error?: string;
  /** Leading icon node (e.g. search). */
  leadingIcon?: React.ReactNode;
  style?: React.CSSProperties;
}

export function Input(props: InputProps): JSX.Element;
