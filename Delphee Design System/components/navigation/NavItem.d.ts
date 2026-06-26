import * as React from 'react';

/**
 * Sidebar navigation row with brand active state + left indicator bar.
 */
export interface NavItemProps {
  /** Leading icon (Lucide, ~18px). */
  icon?: React.ReactNode;
  /** Current page — brand text, soft bg, 2px brand left bar, aria-current. */
  active?: boolean;
  /** Shows a trailing chevron for expandable sections. */
  expandable?: boolean;
  expanded?: boolean;
  /** Indent for a child row under an expanded section. */
  indent?: boolean;
  /** Trailing node (e.g. a count badge). */
  badge?: React.ReactNode;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export function NavItem(props: NavItemProps): JSX.Element;
