import { HTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  glass?: boolean;
}

const Card = ({ children, hover = false, glass = false, className, ...props }: CardProps) => {
  const Component: any = hover ? motion.div : 'div';

  return (
    <Component
      whileHover={hover ? { y: -8, transition: { duration: 0.3 } } : undefined}
      className={clsx(
        'rounded-2xl transition-all duration-300',
        glass
          ? 'glass backdrop-blur-md'
          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
        hover && 'shadow-lg hover:shadow-premium cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

const CardHeader = ({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx('p-6 border-b border-gray-200 dark:border-gray-700', className)} {...props}>
    {children}
  </div>
);

const CardBody = ({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx('p-6', className)} {...props}>
    {children}
  </div>
);

const CardFooter = ({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx('p-6 border-t border-gray-200 dark:border-gray-700', className)} {...props}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
