'use client';

export default function LoadingSpinner({ message = 'در حال بارگذاری...' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
        </div>
        <p className="text-gray-600 mt-4 text-sm">{message}</p>
      </div>
    </div>
  );
}

export function InlineSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className={`animate-spin rounded-full border-gray-200 border-t-blue-600 ${sizeClasses[size]}`}></div>
    </div>
  );
}
