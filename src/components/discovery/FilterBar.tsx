export function FilterBar() {
  return (
    <div className="absolute top-4 left-0 right-0 z-10 px-4">
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {["All", "Trending", "New", "Creators", "Events"].map((tag) => (
          <button
            key={tag}
            className="px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white text-sm font-medium whitespace-nowrap"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
