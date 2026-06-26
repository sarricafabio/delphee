import * as React from 'react';

/** Raised glass tile. Use only for content that genuinely needs elevation. */
export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  /** Lifts on hover (translateY + deeper shadow). */
  interactive?: boolean;
  /** Hero treatment — brand-tinted fill + elev-2 (the page's focal tile). */
  hero?: boolean;
  /** Inner padding (CSS length / token). */
  padding?: string;
  /** Element to render as. */
  as?: keyof JSX.IntrinsicElements;
}

export function Card(props: CardProps): JSX.Element;
