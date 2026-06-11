import type { SVGProps } from "react";

type I = SVGProps<SVGSVGElement>;

const base = {
  fill: "none" as const,
  stroke: "currentColor" as const,
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  width: 22,
  height: 22,
};

export const HomeIcon = (p: I) => (
  <svg {...base} {...p}><path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-6h-6v6H5a2 2 0 0 1-2-2z" /></svg>
);
export const ExploreIcon = (p: I) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M16 8l-2 6-6 2 2-6z" /></svg>
);
export const RadarIcon = (p: I) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /></svg>
);
export const CalendarIcon = (p: I) => (
  <svg {...base} {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></svg>
);
export const ChatIcon = (p: I) => (
  <svg {...base} {...p}><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /></svg>
);
export const BellIcon = (p: I) => (
  <svg {...base} {...p}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8" /><path d="M10 21a2 2 0 0 0 4 0" /></svg>
);
export const HeartIcon = (p: I & { filled?: boolean }) => (
  <svg {...base} {...p} fill={p.filled ? "currentColor" : "none"}>
    <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z" />
  </svg>
);
export const CommentIcon = (p: I) => (
  <svg {...base} {...p}><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /></svg>
);
export const RepostIcon = (p: I) => (
  <svg {...base} {...p}><path d="M7 7h11l-3-3M17 17H6l3 3" /><path d="M18 7v5M6 17v-5" /></svg>
);
export const ShareIcon = (p: I) => (
  <svg {...base} {...p}><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" /><path d="M16 6l-4-4-4 4M12 2v14" /></svg>
);
export const PlusIcon = (p: I) => (
  <svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>
);
export const SearchIcon = (p: I) => (
  <svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const PinIcon = (p: I) => (
  <svg {...base} {...p}><path d="M12 22s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></svg>
);
export const MicIcon = (p: I) => (
  <svg {...base} {...p}><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
);
export const ImageIcon = (p: I) => (
  <svg {...base} {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 17-5-5L5 21" /></svg>
);
export const VideoIcon = (p: I) => (
  <svg {...base} {...p}><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m22 8-6 4 6 4z" /></svg>
);
export const GifIcon = (p: I) => (
  <svg {...base} {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><text x="6" y="16" fontSize="7" fontWeight="800" fill="currentColor" stroke="none">GIF</text></svg>
);
export const SendIcon = (p: I) => (
  <svg {...base} {...p}><path d="m4 12 17-8-4 18-5-7z" /><path d="m12 15 5-11" /></svg>
);
export const CheckIcon = (p: I) => (
  <svg {...base} {...p}><path d="M5 12.5 10 17l9-10" /></svg>
);
export const VerifiedIcon = (p: I) => (
  <svg {...base} {...p} fill="currentColor" stroke="none"><path d="m12 1 2.6 2L18 2.5 19 6l3.5 1L22 10.5 24 13l-2 2.5.5 3.5-3.5 1-1 3.5-3.4-.5L12 25l-2.6-2L6 23.5 5 20l-3.5-1L2 15.5 0 13l2-2.5L1.5 7 5 6l1-3.5L9.4 3z" transform="scale(.85) translate(2 0)" /></svg>
);
export const PlayIcon = (p: I) => (
  <svg {...base} {...p} fill="currentColor" stroke="none"><path d="M6 4v16l14-8z" /></svg>
);
export const MusicIcon = (p: I) => (
  <svg {...base} {...p}><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
);
export const SettingsIcon = (p: I) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .4 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.4 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .4-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.4-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.4H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.4l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.4 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>
);
export const BackIcon = (p: I) => (
  <svg {...base} {...p}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
);
export const MoreIcon = (p: I) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="1.5" fill="currentColor" /><circle cx="5" cy="12" r="1.5" fill="currentColor" /><circle cx="19" cy="12" r="1.5" fill="currentColor" /></svg>
);
export const LogoMark = (p: I) => (
  <svg {...base} {...p} viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" stroke="currentColor" /><path d="M8 20c2-4 4-6 8-6s6 2 8 6" /><circle cx="22" cy="11" r="2" fill="currentColor" stroke="none" /></svg>
);
