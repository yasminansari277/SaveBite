import React from 'react';

const SkeletonLoader = ({ 
  variant = 'card', 
  count = 1,
  className = '' 
}) => {
  const CardSkeleton = () => (
    <div className="bg-card border border-border rounded-custom p-5 shadow-soft animate-pulse flex flex-col gap-4">
      <div className="w-full h-40 bg-border/40 rounded-custom" />
      <div className="h-6 bg-border/50 rounded w-2/3" />
      <div className="flex gap-2">
        <div className="h-4 bg-border/40 rounded w-1/4" />
        <div className="h-4 bg-border/40 rounded w-1/4" />
      </div>
      <div className="h-10 bg-border/50 rounded-custom mt-2 w-full" />
    </div>
  );

  const ListSkeleton = () => (
    <div className="bg-card border border-border rounded-custom p-4 shadow-soft animate-pulse flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 bg-border/50 rounded-full" />
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-4 bg-border/50 rounded w-1/3" />
          <div className="h-3 bg-border/40 rounded w-1/4" />
        </div>
      </div>
      <div className="w-16 h-8 bg-border/50 rounded-custom" />
    </div>
  );

  const StatSkeleton = () => (
    <div className="bg-card border border-border rounded-custom p-5 shadow-soft animate-pulse flex flex-col gap-3">
      <div className="w-8 h-8 bg-border/40 rounded-full" />
      <div className="h-4 bg-border/40 rounded w-1/2" />
      <div className="h-8 bg-border/50 rounded w-3/4" />
    </div>
  );

  const renderSkeletons = () => {
    const list = [];
    for (let i = 0; i < count; i++) {
      if (variant === 'card') {
        list.push(<CardSkeleton key={i} />);
      } else if (variant === 'list') {
        list.push(<ListSkeleton key={i} />);
      } else if (variant === 'stat') {
        list.push(<StatSkeleton key={i} />);
      } else {
        // generic rectangular loader
        list.push(
          <div 
            key={i} 
            className={`bg-border/40 rounded-custom animate-pulse ${className}`} 
          />
        );
      }
    }
    return list;
  };

  return (
    <>
      {renderSkeletons()}
    </>
  );
};

export default SkeletonLoader;
