'use client';

export function SkeletonText({ width = 'w-full', height = 'h-4' }) {
  return (
    <div className={`${width} ${height} skeleton rounded-lg`} />
  );
}

export function SkeletonCircle({ size = 'w-10 h-10' }) {
  return (
    <div className={`${size} skeleton rounded-full`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-5 space-y-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-4">
        <SkeletonCircle size="w-12 h-12" />
        <div className="flex-1 space-y-2">
          <SkeletonText width="w-3/4" />
          <SkeletonText width="w-1/2" height="h-3" />
        </div>
      </div>
      <div className="space-y-2">
        <SkeletonText />
        <SkeletonText width="w-5/6" />
      </div>
    </div>
  );
}

export function SkeletonProductCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      <div className="aspect-square skeleton" />
      <div className="p-4 space-y-3">
        <SkeletonText width="w-3/4" />
        <SkeletonText width="w-1/2" height="h-3" />
        <div className="flex justify-between items-center pt-2">
          <SkeletonText width="w-1/3" height="h-6" />
          <SkeletonCircle size="w-8 h-8" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl">
          <SkeletonCircle />
          <div className="flex-1 space-y-2">
            <SkeletonText width="w-2/3" />
            <SkeletonText width="w-1/3" height="h-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonText key={i} width="flex-1" height="h-4" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100">
          {Array.from({ length: cols }).map((_, j) => (
            <SkeletonText key={j} width="flex-1" height="h-4" />
          ))}
        </div>
      ))}
    </div>
  );
}
