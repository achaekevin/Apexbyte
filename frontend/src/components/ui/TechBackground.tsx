import { FC, memo } from 'react';

export type TechBackgroundVariant =
  | 'hero'
  | 'catalog'
  | 'detail'
  | 'auth'
  | 'dashboard'
  | 'minimal';

interface TechBackgroundProps {
  variant?: TechBackgroundVariant;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Clean, high-performance background wrapper for storefront sections.
 * Provides clean, neutral, accessible surface contrast without distracting
 * artificial glow blobs, circuit traces, or floating wireframe decorations.
 */
export const TechBackground: FC<TechBackgroundProps> = memo(
  ({ className = '', children }) => {
    return (
      <div className={`relative ${className}`}>
        {children}
      </div>
    );
  }
);

TechBackground.displayName = 'TechBackground';
export default TechBackground;

