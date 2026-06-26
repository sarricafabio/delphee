import * as React from 'react';

export interface Column {
  key: string;
  header: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  /** Render value in Spline Sans Mono, tabular figures (for codes / numbers). */
  mono?: boolean;
  /** Prevent wrapping in this column. */
  nowrap?: boolean;
  width?: string | number;
  /** Custom cell renderer; receives the row object. */
  render?: (row: any) => React.ReactNode;
}

/**
 * Dense data table — the product workhorse.
 */
export interface DataTableProps {
  columns: Column[];
  rows: any[];
  /** Field to use as React key. */
  rowKey?: string;
  onRowClick?: (row: any) => void;
  /** Empty-state message (inline, no centered card). */
  empty?: React.ReactNode;
  style?: React.CSSProperties;
}

export function DataTable(props: DataTableProps): JSX.Element;
