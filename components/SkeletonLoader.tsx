import React from 'react';

interface SkeletonLoaderProps {
  type?: 'message' | 'sidebar' | 'button';
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  type = 'message', 
  count = 1 
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'message':
        return (
          <div className="flex justify-start mb-4 animate-pulse">
            <div className="max-w-[80%] rounded-lg p-4 bg-gray-100 dark:bg-gray-800">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
            </div>
          </div>
        );
      
      case 'sidebar':
        return (
          <div className="p-3 rounded-lg animate-pulse">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
          </div>
        );
      
      case 'button':
        return (
          <div className="animate-pulse">
            <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-xl w-32"></div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </>
  );
};