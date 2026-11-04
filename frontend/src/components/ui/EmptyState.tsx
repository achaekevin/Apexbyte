import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage } from 'react-icons/fi';
import Card from './Card';
import Button from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  actionLabel,
  actionHref,
  onAction,
  className = '',
}) => {
  return (
    <Card className={`p-8 sm:p-12 text-center border-dashed border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${className}`}>
      {icon ? (
        <div className="mb-4 flex justify-center text-primary-500">
          {icon}
        </div>
      ) : (
        <div className="mb-4 flex justify-center text-gray-400 dark:text-gray-500">
          <FiPackage size={44} />
        </div>
      )}

      <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 max-w-md mx-auto mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {action ? (
        <div className="flex justify-center">{action}</div>
      ) : actionLabel && actionHref ? (
        <div className="flex justify-center">
          <Link to={actionHref}>
            <Button size="sm">{actionLabel}</Button>
          </Link>
        </div>
      ) : actionLabel && onAction ? (
        <div className="flex justify-center">
          <Button size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </Card>
  );
};

export default EmptyState;

