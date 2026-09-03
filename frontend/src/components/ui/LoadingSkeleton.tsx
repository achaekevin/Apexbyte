import clsx from 'clsx';

interface LoadingSkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  circle?: boolean;
}

const LoadingSkeleton = ({
  width = 'w-full',
  height = 'h-4',
  className,
  circle = false,
}: LoadingSkeletonProps) => {
  return (
    <div
      className={clsx(
        'animate-pulse bg-gray-200 dark:bg-gray-700',
        circle ? 'rounded-full' : 'rounded',
        width,
        height,
        className
      )}
    />
  );
};

export const ProductCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
    <LoadingSkeleton height="h-48" className="mb-4" />
    <LoadingSkeleton width="w-3/4" height="h-6" className="mb-2" />
    <LoadingSkeleton width="w-1/2" height="h-4" className="mb-4" />
    <div className="flex justify-between items-center">
      <LoadingSkeleton width="w-20" height="h-6" />
      <LoadingSkeleton width="w-24" height="h-10" />
    </div>
  </div>
);

export const ProductDetailSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div>
      <LoadingSkeleton height="h-96" className="mb-4" />
      <div className="grid grid-cols-4 gap-2">
        {[...Array(4)].map((_, i) => (
          <LoadingSkeleton key={i} height="h-20" />
        ))}
      </div>
    </div>
    <div>
      <LoadingSkeleton width="w-3/4" height="h-8" className="mb-4" />
      <LoadingSkeleton width="w-full" height="h-6" className="mb-2" />
      <LoadingSkeleton width="w-full" height="h-6" className="mb-4" />
      <LoadingSkeleton width="w-32" height="h-10" className="mb-6" />
      <LoadingSkeleton width="w-full" height="h-48" className="mb-4" />
      <div className="flex gap-4">
        <LoadingSkeleton width="w-full" height="h-12" />
        <LoadingSkeleton width="w-full" height="h-12" />
      </div>
    </div>
  </div>
);

export default LoadingSkeleton;
