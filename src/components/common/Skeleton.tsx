/**
 * Skeleton loading components for progressive content loading
 * Provides better UX than spinners alone
 */

export function PostSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full skeleton bg-[#222222]" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/3 skeleton bg-[#222222] rounded" />
          <div className="h-3 w-1/4 skeleton bg-[#1A1A1A] rounded" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div className="h-4 w-full skeleton bg-[#222222] rounded" />
        <div className="h-4 w-5/6 skeleton bg-[#222222] rounded" />
      </div>

      {/* Media */}
      <div className="h-40 w-full skeleton bg-[#222222] rounded" />

      {/* Actions */}
      <div className="flex gap-4 pt-2">
        <div className="h-4 w-8 skeleton bg-[#1A1A1A] rounded" />
        <div className="h-4 w-8 skeleton bg-[#1A1A1A] rounded" />
        <div className="h-4 w-8 skeleton bg-[#1A1A1A] rounded" />
      </div>
    </div>
  );
}

export function UserCardSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="h-20 w-20 skeleton bg-[#222222] rounded-full" />
      <div className="space-y-2">
        <div className="h-4 w-3/4 skeleton bg-[#222222] rounded" />
        <div className="h-3 w-1/2 skeleton bg-[#1A1A1A] rounded" />
      </div>
      <div className="h-8 w-full skeleton bg-[#222222] rounded" />
    </div>
  );
}

export function StoryRingSkeleton() {
  return (
    <div className="flex gap-3 overflow-x-auto">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 w-16 flex-shrink-0 skeleton bg-[#222222] rounded-full" />
      ))}
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-4">
      <div className="space-y-2">
        <div className="h-4 w-2/3 skeleton bg-[#222222] rounded" />
        <div className="h-4 w-3/4 skeleton bg-[#222222] rounded" />
      </div>
    </div>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="h-40 w-full skeleton bg-[#222222] rounded" />
      <div className="space-y-2">
        <div className="h-4 w-3/4 skeleton bg-[#222222] rounded" />
        <div className="h-4 w-1/2 skeleton bg-[#1A1A1A] rounded" />
      </div>
      <div className="h-8 w-full skeleton bg-[#222222] rounded" />
    </div>
  );
}

export function SearchResultSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 skeleton bg-[#222222] rounded" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/2 skeleton bg-[#222222] rounded" />
          <div className="h-3 w-1/3 skeleton bg-[#1A1A1A] rounded" />
        </div>
      </div>
    </div>
  );
}
