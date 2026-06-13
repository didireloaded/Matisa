import { CheckCircle2, MapPin } from 'lucide-react';
import { T } from './Tokens';

export function Verified({ size = 14 }: { size?: number }) {
  return (
    <CheckCircle2 size={size} style={{ color: T.sky, fill: T.sky, opacity: 0.9 }} />
  );
}

export function RegionBadge({ region }: { region: string }) {
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full border border-[#C8521A]/25 bg-[#C8521A]/10 px-2 py-0.5 text-[10px] font-medium text-[#E8A055]">
      <MapPin size={8} />
      {region}
    </span>
  );
}
