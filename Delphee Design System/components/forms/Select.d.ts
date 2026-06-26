import * as React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

/** Labelled native select, styled to match Input. */
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'style'> {
  label?: string;
  /** Options as strings or {value,label} objects. */
  options?: Array<string | SelectOption>;
  style?: React.CSSProperties;
}

export function Select(props: SelectProps): JSX.Element;
