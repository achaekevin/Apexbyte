import { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'error' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: BadgeProps) => {
  const variantClasses = {
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
    success: 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200',
    error: 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200',
    warning: 'bg-accent-100 text-accent-800 dark:bg-accent-900 dark:text-accent-200',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-medium',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
