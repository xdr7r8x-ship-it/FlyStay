'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className={`${sizeClasses[size]} border-mist border-t-champagne rounded-full animate-spin`} />
    </div>
  );
}

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-ivory/90 z-50">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="font-cairo text-charcoal">جاري التحميل...</p>
      </div>
    </div>
  );
}

export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-sand rounded-2xl ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-sand rounded-3xl p-6 border border-mist">
      <LoadingSkeleton className="h-40 w-full mb-4" />
      <LoadingSkeleton className="h-6 w-3/4 mb-2" />
      <LoadingSkeleton className="h-4 w-1/2" />
    </div>
  );
}
