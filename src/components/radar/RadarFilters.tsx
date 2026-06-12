import { Users, Calendar, Hash, Music2 } from 'lucide-react';

export type RadarFilterType = 'people' | 'events' | 'communities' | 'music';

interface RadarFiltersProps {
  activeFilter: RadarFilterType;
  onChange: (filter: RadarFilterType) => void;
}

export function RadarFilters({ activeFilter, onChange }: RadarFiltersProps) {
  const filters: { id: RadarFilterType; icon: any; label: string }[] = [
    { id: 'people', icon: Users, label: 'People' },
    { id: 'events', icon: Calendar, label: 'Events' },
    { id: 'communities', icon: Hash, label: 'Spaces' },
    { id: 'music', icon: Music2, label: 'Audio' },
  ];

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex bg-[#1C1814]/80 backdrop-blur-md p-1 rounded-full border border-[#2E2822] shadow-xl">
      {filters.map(({ id, icon: Icon, label }) => {
        const isActive = activeFilter === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 ${
              isActive ? 'bg-[#C8521A] text-white shadow-md' : 'text-[#8A7F74] hover:text-[#F5F0EA]'
            }`}
          >
            <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
            {isActive && <span className="text-xs font-bold">{label}</span>}
          </button>
        );
      })}
    </div>
  );
}
