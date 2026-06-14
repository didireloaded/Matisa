import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/common';

export function RadarCenter() {
  const { profile } = useAuth();
  
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
      <div className="relative flex items-center justify-center">
        {profile ? (
          <Avatar profile={profile} size={72} ring />
        ) : (
          <div className="w-[72px] h-[72px] rounded-full bg-[#1C1814] flex items-center justify-center text-[#E8A055] font-bold text-xl border-2 border-[#C8521A] shadow-[0_0_20px_#C8521A]">
            YOU
          </div>
        )}
      </div>
    </div>
  );
}
