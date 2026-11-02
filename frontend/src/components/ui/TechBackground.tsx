import { FC, memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

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

export const TechBackground: FC<TechBackgroundProps> = memo(
  ({ variant = 'hero', className = '', children }) => {
    const shouldReduceMotion = useReducedMotion();

    return (
      <div className={`relative overflow-hidden ${className}`}>
        {/* Layer 1: Ambient Silicon Lighting & Directional Spotlight */}
        <div className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden" aria-hidden="true">
          {variant === 'hero' && (
            <>
              {/* Top ambient glow */}
              <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-gradient-to-b from-primary-500/15 via-emerald-500/10 to-transparent blur-3xl dark:from-primary-600/20 dark:via-emerald-500/15" />
              {/* Side hardware accent flares */}
              <div className="absolute top-1/3 -left-48 w-96 h-96 rounded-full bg-blue-500/10 dark:bg-blue-600/15 blur-3xl" />
              <div className="absolute top-1/2 -right-48 w-96 h-96 rounded-full bg-emerald-500/10 dark:bg-emerald-600/15 blur-3xl" />
            </>
          )}

          {variant === 'catalog' && (
            <>
              <div className="absolute top-0 right-0 w-[500px] h-[350px] rounded-full bg-primary-500/8 dark:bg-primary-600/12 blur-3xl" />
              <div className="absolute bottom-1/4 left-0 w-[450px] h-[300px] rounded-full bg-emerald-500/6 dark:bg-emerald-600/10 blur-3xl" />
            </>
          )}

          {variant === 'detail' && (
            <>
              <div className="absolute top-10 left-1/4 w-[600px] h-[450px] rounded-full bg-primary-500/10 dark:bg-primary-600/15 blur-3xl" />
              <div className="absolute bottom-10 right-1/4 w-[500px] h-[350px] rounded-full bg-emerald-500/8 dark:bg-emerald-500/12 blur-3xl" />
            </>
          )}

          {variant === 'auth' && (
            <>
              <div className="absolute -top-20 -left-20 w-[550px] h-[450px] rounded-full bg-primary-600/15 dark:bg-primary-600/25 blur-3xl" />
              <div className="absolute -bottom-20 -right-20 w-[550px] h-[450px] rounded-full bg-emerald-600/15 dark:bg-emerald-600/20 blur-3xl" />
            </>
          )}

          {variant === 'dashboard' && (
            <div className="absolute top-0 right-1/3 w-[600px] h-[250px] rounded-full bg-primary-500/5 dark:bg-primary-600/10 blur-3xl" />
          )}

          {/* Layer 2: Precision Dot-Matrix Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#808080_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.035] dark:opacity-[0.07]" />

          {/* Layer 3: Motherboard PCB Circuit Traces & Bus Lines */}
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.045] dark:opacity-[0.09]"
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
          >
            <defs>
              <pattern
                id={`circuit-pattern-${variant}`}
                width="280"
                height="280"
                patternUnits="userSpaceOnUse"
              >
                {/* Microchip bus trace paths */}
                <path
                  d="M 20,40 L 70,40 L 100,70 L 180,70 L 210,40 L 260,40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <circle cx="20" cy="40" r="3" fill="currentColor" />
                <circle cx="260" cy="40" r="3" fill="currentColor" />

                <path
                  d="M 40,140 L 110,140 L 140,110 L 220,110 L 250,140"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <circle cx="40" cy="140" r="3" fill="currentColor" />
                <circle cx="250" cy="140" r="3" fill="currentColor" />

                <path
                  d="M 140,180 L 140,230 L 170,260 L 240,260"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <circle cx="140" cy="180" r="3" fill="currentColor" />
                <circle cx="240" cy="260" r="3" fill="currentColor" />

                {/* Solder point connection pads */}
                <rect x="95" y="65" width="10" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1" />
                <rect x="135" y="105" width="10" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#circuit-pattern-${variant})`} />
          </svg>

          {/* Layer 4: Laptop Wireframe Silhouette Watermark (Variant specific) */}
          {(variant === 'hero' || variant === 'auth' || variant === 'catalog') && (
            <motion.div
              animate={
                shouldReduceMotion
                  ? undefined
                  : {
                    y: [0, -6, 0],
                    opacity: [0.035, 0.055, 0.035],
                  }
              }
              transition={{
                duration: 9,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute right-[-40px] lg:right-10 top-1/4 pointer-events-none text-slate-800 dark:text-white"
            >
              {/* Isometric Laptop Chassis Line Drawing */}
              <svg
                width="360"
                height="280"
                viewBox="0 0 360 280"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-64 sm:w-80 lg:w-96 h-auto stroke-current"
                strokeWidth="1.2"
              >
                {/* Laptop Display Lid (Angle Open) */}
                <path d="M 60,30 L 260,30 L 310,140 L 110,140 Z" strokeDasharray="3 3" />
                {/* Inner Screen Bezel */}
                <path d="M 72,42 L 250,42 L 296,132 L 118,132 Z" />
                {/* Webcam Notch Indicator */}
                <circle cx="160" cy="36" r="2" fill="currentColor" />
                {/* Laptop Lower Deck / Keyboard Chassis Base */}
                <path d="M 110,140 L 310,140 L 270,230 L 50,230 Z" />
                {/* Trackpad area */}
                <rect
                  x="135"
                  y="190"
                  width="70"
                  height="30"
                  rx="3"
                  strokeDasharray="2 2"
                />
                {/* Keyboard Grid Contour */}
                <path d="M 105,152 L 285,152 L 265,182 L 85,182 Z" strokeDasharray="4 2" />
                {/* Front Lip Chamfer */}
                <path d="M 50,230 L 55,236 L 265,236 L 270,230" />
              </svg>
            </motion.div>
          )}
        </div>

        {/* Content Children */}
        <div className="relative z-10 w-full">{children}</div>
      </div>
    );
  }
);

TechBackground.displayName = 'TechBackground';
export default TechBackground;
