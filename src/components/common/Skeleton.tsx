export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`skeleton rounded-lg ${className}`}
    />
  );
}

export function PostSkeleton() {
  return (
    <div className="border-b border-[#2E2822] px-4 py-4">
      <div className="flex gap-3">
        <Skeleton className="h-11 w-11 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-36" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-full mt-3" />
          <Skeleton className="h-4 w-4/5" />
          <div className="flex gap-6 mt-3">
            {[0,1,2,3].map(i => <Skeleton key={i} className="h-3 w-10" />)}
          </div>
        </div>
      </div>
    </div>
  );
}
