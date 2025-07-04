import React from 'react';
import { Loader2, Heart } from 'lucide-react';

const Loading = ({ 
  variant = 'spinner', 
  size = 'md', 
  text = '', 
  fullscreen = false,
  overlay = false,
  color = 'blue'
}) => {
  // Size configurations
  const sizeClasses = {
    sm: {
      spinner: 'w-4 h-4',
      dots: 'w-2 h-2',
      pulse: 'w-8 h-8',
      text: 'text-sm'
    },
    md: {
      spinner: 'w-8 h-8',
      dots: 'w-3 h-3',
      pulse: 'w-12 h-12',
      text: 'text-base'
    },
    lg: {
      spinner: 'w-12 h-12',
      dots: 'w-4 h-4',
      pulse: 'w-16 h-16',
      text: 'text-lg'
    },
    xl: {
      spinner: 'w-16 h-16',
      dots: 'w-5 h-5',
      pulse: 'w-20 h-20',
      text: 'text-xl'
    }
  };

  // Color configurations
  const colorClasses = {
    blue: {
      spinner: 'text-blue-600',
      dots: 'bg-blue-600',
      pulse: 'bg-blue-600',
      text: 'text-blue-600'
    },
    gray: {
      spinner: 'text-gray-600',
      dots: 'bg-gray-600',
      pulse: 'bg-gray-600',
      text: 'text-gray-600'
    },
    green: {
      spinner: 'text-green-600',
      dots: 'bg-green-600',
      pulse: 'bg-green-600',
      text: 'text-green-600'
    },
    red: {
      spinner: 'text-red-600',
      dots: 'bg-red-600',
      pulse: 'bg-red-600',
      text: 'text-red-600'
    },
    white: {
      spinner: 'text-white',
      dots: 'bg-white',
      pulse: 'bg-white',
      text: 'text-white'
    }
  };

  // Spinner Loading
  const SpinnerLoader = () => (
    <div className="flex flex-col items-center justify-center space-y-3">
      <Loader2 className={`${sizeClasses[size].spinner} ${colorClasses[color].spinner} animate-spin`} />
      {text && (
        <p className={`${sizeClasses[size].text} ${colorClasses[color].text} font-medium`}>
          {text}
        </p>
      )}
    </div>
  );

  // Dots Loading
  const DotsLoader = () => (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="flex space-x-1">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className={`${sizeClasses[size].dots} ${colorClasses[color].dots} rounded-full animate-pulse`}
            style={{
              animationDelay: `${index * 0.2}s`,
              animationDuration: '1.4s'
            }}
          />
        ))}
      </div>
      {text && (
        <p className={`${sizeClasses[size].text} ${colorClasses[color].text} font-medium`}>
          {text}
        </p>
      )}
    </div>
  );

  // Pulse Loading
  const PulseLoader = () => (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className={`${sizeClasses[size].pulse} ${colorClasses[color].pulse} rounded-full animate-pulse opacity-75`} />
      {text && (
        <p className={`${sizeClasses[size].text} ${colorClasses[color].text} font-medium`}>
          {text}
        </p>
      )}
    </div>
  );

  // Heart Loading (Brand-themed)
  const HeartLoader = () => (
    <div className="flex flex-col items-center justify-center space-y-3">
      <Heart className={`${sizeClasses[size].spinner} ${colorClasses[color].spinner} animate-pulse`} />
      {text && (
        <p className={`${sizeClasses[size].text} ${colorClasses[color].text} font-medium`}>
          {text}
        </p>
      )}
    </div>
  );

  // Skeleton Loading
  const SkeletonLoader = () => (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-300 rounded"></div>
        <div className="h-4 bg-gray-300 rounded w-5/6"></div>
      </div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
    </div>
  );

  // Progress Bar Loading
  const ProgressLoader = ({ progress = 0 }) => (
    <div className="flex flex-col items-center justify-center space-y-3 w-full max-w-xs">
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 ${colorClasses[color].pulse} rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      {text && (
        <p className={`${sizeClasses[size].text} ${colorClasses[color].text} font-medium`}>
          {text}
        </p>
      )}
    </div>
  );

  // Card Loading Skeleton
  const CardLoader = () => (
    <div className="animate-pulse">
      <div className="bg-gray-300 h-48 w-full rounded-t-lg mb-4"></div>
      <div className="px-4 pb-4 space-y-3">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-3 bg-gray-300 rounded w-full"></div>
        <div className="h-3 bg-gray-300 rounded w-2/3"></div>
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 bg-gray-300 rounded w-1/3"></div>
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  );

  // Select the appropriate loader
  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return <DotsLoader />;
      case 'pulse':
        return <PulseLoader />;
      case 'heart':
        return <HeartLoader />;
      case 'skeleton':
        return <SkeletonLoader />;
      case 'progress':
        return <ProgressLoader />;
      case 'card':
        return <CardLoader />;
      case 'spinner':
      default:
        return <SpinnerLoader />;
    }
  };

  // Container classes based on display mode
  const getContainerClasses = () => {
    if (fullscreen) {
      return 'fixed inset-0 bg-white flex items-center justify-center z-50';
    }
    if (overlay) {
      return 'absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-40';
    }
    return 'flex items-center justify-center p-4';
  };

  return (
    <div className={getContainerClasses()}>
      {renderLoader()}
    </div>
  );
};

// Pre-configured loading components for common use cases
export const PageLoader = ({ text = 'Loading...' }) => (
  <Loading variant="spinner" size="lg" text={text} fullscreen />
);

export const ButtonLoader = ({ text = '' }) => (
  <Loading variant="spinner" size="sm" color="white" text={text} />
);

export const CardLoader = () => (
  <Loading variant="card" />
);

export const InlineLoader = ({ text = 'Loading...' }) => (
  <Loading variant="dots" size="sm" text={text} />
);

export const OverlayLoader = ({ text = 'Processing...' }) => (
  <Loading variant="spinner" size="lg" text={text} overlay />
);

// Loading wrapper component
export const LoadingWrapper = ({ 
  isLoading, 
  children, 
  fallback = <PageLoader />,
  error = null,
  errorComponent = null 
}) => {
  if (error && errorComponent) {
    return errorComponent;
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
        <p className="text-gray-600">{error.message || 'An unexpected error occurred'}</p>
      </div>
    );
  }
  
  if (isLoading) {
    return fallback;
  }
  
  return children;
};

export default Loading;