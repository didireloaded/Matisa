// Human-Designed Skeleton Loading Component (Item 8)
export function SkeletonFeedCard() {
  return (
    <div className="p-4 rounded-[22px] bg-[#111111] border border-white/[0.06] space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/[0.06] animate-pulse" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 w-28 bg-white/[0.06] rounded-full animate-pulse" />
          <div className="h-2.5 w-16 bg-white/[0.03] rounded-full animate-pulse" />
        </div>
      </div>
      <div className="space-y-2 pt-1">
        <div className="h-3 w-full bg-white/[0.04] rounded-full animate-pulse" />
        <div className="h-3 w-3/4 bg-white/[0.03] rounded-full animate-pulse" />
      </div>
    </div>
  );
}

export function SkeletonList() {
  return (
    <div className="space-y-3.5">
      <SkeletonFeedCard />
      <SkeletonFeedCard />
      <SkeletonFeedCard />
    </div>
  );
}

export default SkeletonList;
