export const REGIONS = [
  "Khomas","Erongo","Hardap","//Karas","Kavango East","Kavango West",
  "Kunene","Ohangwena","Omaheke","Omusati","Oshana","Oshikoto",
  "Otjozondjupa","Zambezi",
] as const;
export type Region = typeof REGIONS[number];

export type CreatorBadge =
  | "Photographer" | "Videographer" | "Model" | "DJ" | "Musician"
  | "Event Planner" | "Makeup Artist" | "Filmmaker" | "Designer";

export type Interest =
  | "Photography" | "Film" | "Music" | "Cars" | "Sports"
  | "Fashion" | "Business" | "Gaming" | "Tech" | "Travel"
  | "Art" | "Food";

export type GhostMode = "hidden" | "approximate" | "exact";

export type Profile = {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  gradient: string;
  region: Region;
  city: string;
  mood: string;
  interests: Interest[];
  creatorBadge?: CreatorBadge;
  isCreator: boolean;
  isVerified: boolean;
  isPlus: boolean;
  followers: number;
  following: number;
  posts: number;
  distance?: number;
  bearing?: number;
  song?: { title: string; artist: string };
  recentWork?: string;
  bookingRate?: string;
  ghostMode: GhostMode;
  online: boolean;
};

export type Post = {
  id: string;
  userId: string;
  content: string;
  mediaCount?: number;
  mediaKind?: "image" | "video" | "voice" | "reel";
  voiceSeconds?: number;
  region: Region;
  likes: number;
  comments: number;
  reposts: number;
  saves: number;
  liked?: boolean;
  saved?: boolean;
  isReel?: boolean;
  createdAt: string;
};

export type Story = {
  id: string;
  userId: string;
  kind: "image" | "video" | "audio";
  caption?: string;
  gradient: string;
  viewed?: boolean;
};

export type EventItem = {
  id: string;
  title: string;
  description: string;
  locationName: string;
  region: Region;
  date: string;
  time: string;
  rsvpCount: number;
  interestedCount: number;
  isFree: boolean;
  price?: number;
  gradient: string;
  hostId: string;
  rsvpd?: boolean;
  hasTickets: boolean;
  hasEventChat: boolean;
  attendeeIds: string[];
  category: string;
};

export type Community = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  postCount: number;
  todayPosts: number;
  activeUsers: number;
  gradient: string;
  isRegion: boolean;
  region?: Region;
  category?: string;
  joined?: boolean;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  content?: string;
  kind: "text" | "voice" | "image" | "video" | "gif";
  voiceSeconds?: number;
  createdAt: string;
  read: boolean;
  reactions?: string[];
};

export type Conversation = {
  id: string;
  isGroup: boolean;
  groupName?: string;
  memberIds: string[];
  lastMessage: string;
  lastAt: string;
  unread: number;
  messages: ChatMessage[];
};

export type AppNotification = {
  id: string;
  type: "like" | "comment" | "follow" | "repost" | "rsvp" | "mention" | "booking" | "view" | "event_invite";
  actorId: string;
  body: string;
  when: string;
  bucket: "today" | "week" | "earlier";
  read: boolean;
};

export type Opportunity = {
  id: string;
  title: string;
  location: string;
  region: Region;
  date: string;
  budget?: string;
  category: CreatorBadge;
  postedBy: string;
  applicants: number;
};

export type TrendingItem = {
  id: string;
  title: string;
  subtitle: string;
  type: "event" | "community" | "topic" | "creator";
  entityId: string;
  engagement: number;
};

// ─── Gradients ───────────────────────────────────────────────────────────────
const G = {
  rust:   "linear-gradient(135deg,#C8521A,#6B2D1A)",
  sky:    "linear-gradient(135deg,#2D7DD2,#1A3A60)",
  green:  "linear-gradient(135deg,#4CAF7D,#1A5C3A)",
  sand:   "linear-gradient(135deg,#E8A055,#8B5A1A)",
  dark:   "linear-gradient(135deg,#8B3A1F,#3A1A0E)",
  purple: "linear-gradient(135deg,#6B2D7D,#2A1040)",
  teal:   "linear-gradient(135deg,#2D7D6B,#1A4038)",
  navy:   "linear-gradient(135deg,#1A2D6B,#0A1230)",
};

export const ME_ID = "u_ndina";

export const PROFILES: Profile[] = [
  {
    id: ME_ID, username: "ndina", displayName: "Ndina Shikongo",
    bio: "Documentary photographer. Windhoek skies. Catching stories others walk past.",
    gradient: G.rust, region: "Khomas", city: "Windhoek", mood: "Golden hour chasing",
    interests: ["Photography","Film","Travel"], creatorBadge: "Photographer",
    isCreator: true, isVerified: false, isPlus: true,
    followers: 1284, following: 312, posts: 87,
    song: { title: "Beautiful Naita", artist: "Big Ben" },
    recentWork: "Standard Bank Namibia Campaign", bookingRate: "N$800/day",
    ghostMode: "approximate", online: true,
  },
  {
    id: "u_tangeni", username: "tangeni_mwetupunga", displayName: "Tangeni Mwetupunga",
    bio: "Producer. Oshakati to Windhoek to wherever the sound takes me.",
    gradient: G.dark, region: "Oshana", city: "Oshakati", mood: "In the studio",
    interests: ["Music","Tech","Business"], creatorBadge: "Musician",
    isCreator: true, isVerified: true, isPlus: true,
    followers: 8421, following: 540, posts: 211, distance: 420, bearing: 45,
    song: { title: "Otjijazz", artist: "EES" },
    recentWork: "Afrobeats Namibia EP", bookingRate: "N$2500/session",
    ghostMode: "approximate", online: true,
  },
  {
    id: "u_kavetu", username: "himba.diaries", displayName: "Kavetu Tjirare",
    bio: "Telling Kunene stories. Cinematic Namibia. Opuwo born.",
    gradient: G.sand, region: "Kunene", city: "Opuwo", mood: "On the road",
    interests: ["Film","Photography","Travel"], creatorBadge: "Filmmaker",
    isCreator: true, isVerified: true, isPlus: false,
    followers: 9120, following: 122, posts: 312, distance: 980, bearing: 110,
    recentWork: "Mercedes GLC Namibia Campaign",
    bookingRate: "N$4500/day", ghostMode: "approximate", online: false,
  },
  {
    id: "u_sarah", username: "sarah.k_photography", displayName: "Sarah Kavandje",
    bio: "Portrait and commercial photographer. Capturing Namibia's faces.",
    gradient: G.teal, region: "Khomas", city: "Windhoek", mood: "Shooting today",
    interests: ["Photography","Fashion","Art"], creatorBadge: "Photographer",
    isCreator: true, isVerified: false, isPlus: false,
    followers: 3240, following: 810, posts: 156, distance: 2300, bearing: 200,
    recentWork: "Namibia Fashion Week 2025",
    bookingRate: "N$1200/day", ghostMode: "exact", online: true,
  },
  {
    id: "u_didi", username: "didi_reloaded", displayName: "Didi Reloaded",
    bio: "Cinematographer. Visual storyteller. Namibia through my lens.",
    gradient: G.purple, region: "Khomas", city: "Windhoek", mood: "Post-production",
    interests: ["Film","Tech","Music"], creatorBadge: "Videographer",
    isCreator: true, isVerified: true, isPlus: true,
    followers: 12400, following: 210, posts: 445, distance: 1450, bearing: 280,
    recentWork: "Mercedes GLC Campaign", bookingRate: "N$6000/day",
    ghostMode: "exact", online: true,
  },
  {
    id: "u_lukas", username: "the.kwaito.kid", displayName: "Lukas Hango",
    bio: "DJ. Otjiwarongo crowds. Music is the language we all speak.",
    gradient: G.green, region: "Otjozondjupa", city: "Otjiwarongo", mood: "Set tonight",
    interests: ["Music","Cars","Sports"], creatorBadge: "DJ",
    isCreator: true, isVerified: false, isPlus: false,
    followers: 5102, following: 890, posts: 154, distance: 3400, bearing: 330,
    recentWork: "Summer Fiesta 2025 Main Stage", bookingRate: "N$3000/night",
    ghostMode: "approximate", online: true,
  },
  {
    id: "u_ester", username: "ester.k", displayName: "Ester Kapuuo",
    bio: "Swakopmund. Coffee, running, and the cold Atlantic.",
    gradient: G.sky, region: "Erongo", city: "Swakopmund", mood: "Salty hair",
    interests: ["Sports","Travel","Food"],
    isCreator: false, isVerified: false, isPlus: false,
    followers: 945, following: 410, posts: 64, distance: 4100, bearing: 160,
    ghostMode: "hidden", online: false,
  },
  {
    id: "u_shaun", username: "shaun.garoeb", displayName: "Shaun //Garoeb",
    bio: "Luderitz. Fish, stars, and silence.",
    gradient: G.navy, region: "//Karas", city: "Luderitz", mood: "Stargazing",
    interests: ["Photography","Travel","Food"],
    isCreator: false, isVerified: false, isPlus: false,
    followers: 612, following: 220, posts: 38,
    ghostMode: "hidden", online: false,
  },
  {
    id: "u_panduleni", username: "panduleni_iy", displayName: "Panduleni Iyambo",
    bio: "Law student. Eenhana born. Windhoek grind.",
    gradient: G.teal, region: "Ohangwena", city: "Eenhana", mood: "Deadlines",
    interests: ["Business","Tech","Gaming"],
    isCreator: false, isVerified: false, isPlus: false,
    followers: 312, following: 188, posts: 27,
    ghostMode: "approximate", online: true,
  },
  {
    id: "u_helvi", username: "helvi.shilumbu", displayName: "Helvi Shilumbu",
    bio: "Caprivi-born. Katima river life. Zambezi vibes only.",
    gradient: G.green, region: "Zambezi", city: "Katima Mulilo", mood: "River weekend",
    interests: ["Travel","Food","Photography"],
    isCreator: false, isVerified: false, isPlus: false,
    followers: 1820, following: 612, posts: 73, distance: 6200, bearing: 70,
    ghostMode: "approximate", online: true,
  },
];

export const STORIES: Story[] = [
  { id: "s0", userId: ME_ID,        kind: "image", gradient: G.rust },
  { id: "s1", userId: "u_tangeni",  kind: "audio", caption: "Late night session beat preview", gradient: G.dark },
  { id: "s2", userId: "u_kavetu",   kind: "video", caption: "Kunene golden hour", gradient: G.sand },
  { id: "s3", userId: "u_sarah",    kind: "image", caption: "Portrait session wrapped", gradient: G.teal },
  { id: "s4", userId: "u_didi",     kind: "video", caption: "Mercedes behind the scenes", gradient: G.purple },
  { id: "s5", userId: "u_lukas",    kind: "image", caption: "Set list locked in", gradient: G.green },
  { id: "s6", userId: "u_ester",    kind: "image", caption: "Swako 5am run", gradient: G.sky },
];

export const POSTS: Post[] = [
  {
    id: "p1", userId: "u_kavetu",
    content: "Sunrise at Epupa Falls. No filter. The Kunene does the work. If you have never been: cancel your plans, drive north.",
    mediaCount: 3, mediaKind: "image", region: "Kunene",
    likes: 421, comments: 38, reposts: 24, saves: 89, createdAt: "2h",
  },
  {
    id: "p2", userId: "u_tangeni",
    content: "Dropping a new beat tonight at 23:00. Kapana energy meets soft house. This one is for Oshakati.",
    mediaKind: "voice", voiceSeconds: 28, region: "Oshana",
    likes: 184, comments: 22, reposts: 9, saves: 31, createdAt: "3h",
  },
  {
    id: "p3", userId: "u_didi",
    content: "Wrapped the Mercedes GLC campaign yesterday. Three days in the Namib. The desert does not lie on camera.",
    mediaCount: 4, mediaKind: "image", region: "Khomas",
    likes: 876, comments: 61, reposts: 42, saves: 203, liked: true, createdAt: "5h",
  },
  {
    id: "p4", userId: "u_lukas",
    content: "Otjiwarongo, see you tonight. The Vault. Doors at 21:00. Bringing the new edits.",
    mediaCount: 1, mediaKind: "image", region: "Otjozondjupa",
    likes: 312, comments: 41, reposts: 18, saves: 55, createdAt: "6h",
  },
  {
    id: "p5", userId: "u_sarah",
    content: "Namibia Fashion Week portraits. Every face a story. Every story worth telling.",
    mediaCount: 2, mediaKind: "image", region: "Khomas",
    likes: 544, comments: 33, reposts: 21, saves: 118, createdAt: "8h",
  },
  {
    id: "p6", userId: "u_kavetu", isReel: true,
    content: "Driving the Kaokoveld with no plan and a full tank. This is the reel.",
    mediaKind: "reel", region: "Kunene",
    likes: 1204, comments: 88, reposts: 76, saves: 312, createdAt: "10h",
  },
  {
    id: "p7", userId: ME_ID,
    content: "Windhoek skyline at 18:42. August light is something no camera will ever fully do justice. But I keep trying.",
    mediaCount: 2, mediaKind: "image", region: "Khomas",
    likes: 287, comments: 31, reposts: 12, saves: 67, liked: true, createdAt: "1d",
  },
  {
    id: "p8", userId: "u_ester",
    content: "New bakery on Sam Nujoma in Swakop. The cardamom buns are dangerous. Consider this your warning.",
    region: "Erongo", likes: 96, comments: 14, reposts: 3, saves: 22, createdAt: "1d",
  },
  {
    id: "p9", userId: "u_helvi",
    content: "Boat ride down the Zambezi. Hippos kept their distance. Mostly.",
    mediaCount: 1, mediaKind: "video", region: "Zambezi",
    likes: 502, comments: 56, reposts: 21, saves: 88, createdAt: "1d",
  },
];

export const EVENTS: EventItem[] = [
  {
    id: "e1", title: "Summer Fiesta 2026",
    description: "Namibia's biggest outdoor festival returns. Four stages, 30 artists, one desert.",
    locationName: "Otjiwarongo Showgrounds", region: "Otjozondjupa",
    date: "Sat 14 Feb", time: "14:00", rsvpCount: 483, interestedCount: 2481,
    isFree: false, price: 350, gradient: G.rust, hostId: "u_lukas",
    hasTickets: true, hasEventChat: true, category: "Festival",
    attendeeIds: ["u_tangeni","u_sarah","u_didi","u_helvi"],
  },
  {
    id: "e2", title: "Windhoek Creatives Meetup",
    description: "Monthly gathering of Windhoek photographers, filmmakers, and designers.",
    locationName: "Factory Windhoek", region: "Khomas",
    date: "Today", time: "18:00", rsvpCount: 340, interestedCount: 840,
    isFree: true, gradient: G.purple, hostId: "u_sarah",
    hasTickets: false, hasEventChat: true, category: "Networking",
    attendeeIds: [ME_ID,"u_didi","u_kavetu"], rsvpd: true,
  },
  {
    id: "e3", title: "Etosha Photo Walk",
    description: "Guided sunrise game drive with photography coaching. Limited to 12 participants.",
    locationName: "Etosha South Gate", region: "Oshikoto",
    date: "Sun 16 Nov", time: "05:00", rsvpCount: 11, interestedCount: 42,
    isFree: false, price: 450, gradient: G.sand, hostId: "u_kavetu",
    hasTickets: true, hasEventChat: false, category: "Photography",
    attendeeIds: ["u_sarah"],
  },
  {
    id: "e4", title: "Kapana Cook-off Championship",
    description: "The best braai in Namibia. Judges. Prizes. A lot of meat.",
    locationName: "Single Quarters, Katutura", region: "Khomas",
    date: "Sat 22 Nov", time: "12:00", rsvpCount: 1204, interestedCount: 3100,
    isFree: true, gradient: G.dark, hostId: "u_lukas",
    hasTickets: false, hasEventChat: true, category: "Food",
    attendeeIds: [ME_ID,"u_ester","u_panduleni"],
  },
  {
    id: "e5", title: "Zambezi River Sundowner Cruise",
    description: "Live marimba, sundowners, hippos at a respectful distance.",
    locationName: "Katima Mulilo Riverfront", region: "Zambezi",
    date: "Sun 23 Nov", time: "16:00", rsvpCount: 78, interestedCount: 210,
    isFree: false, price: 220, gradient: G.teal, hostId: "u_helvi",
    hasTickets: true, hasEventChat: false, category: "Social",
    attendeeIds: [],
  },
  {
    id: "e6", title: "Swakopmund Open Mic Night",
    description: "Poets, comedians, musicians. Sign up at the door.",
    locationName: "Ocean Cellar, Swakopmund", region: "Erongo",
    date: "Fri 28 Nov", time: "19:30", rsvpCount: 142, interestedCount: 380,
    isFree: true, gradient: G.sky, hostId: "u_ester",
    hasTickets: false, hasEventChat: false, category: "Arts",
    attendeeIds: [],
  },
];

export const COMMUNITIES: Community[] = [
  { id: "c_khomas",   name: "Khomas",               description: "The capital region.", memberCount: 12400, postCount: 3200, todayPosts: 47, activeUsers: 312, gradient: G.rust,   isRegion: true,  region: "Khomas",        joined: true  },
  { id: "c_erongo",   name: "Erongo",                description: "Coast region.", memberCount: 8100,  postCount: 1800, todayPosts: 23, activeUsers: 156, gradient: G.sky,    isRegion: true,  region: "Erongo"                       },
  { id: "c_oshana",   name: "Oshana",                description: "North-central hub.", memberCount: 9200,  postCount: 2100, todayPosts: 31, activeUsers: 198, gradient: G.sand,   isRegion: true,  region: "Oshana",        joined: true  },
  { id: "c_zambezi",  name: "Zambezi",               description: "Far north-east.", memberCount: 4300,  postCount: 880,  todayPosts: 12, activeUsers: 67,  gradient: G.teal,   isRegion: true,  region: "Zambezi"                      },
  { id: "c_kunene",   name: "Kunene",                description: "Remote north-west.", memberCount: 3100,  postCount: 650,  todayPosts: 8,  activeUsers: 42,  gradient: G.dark,   isRegion: true,  region: "Kunene"                       },
  { id: "c_otjo",     name: "Otjozondjupa",          description: "Central-north.", memberCount: 5600,  postCount: 1200, todayPosts: 19, activeUsers: 89,  gradient: G.green,  isRegion: true,  region: "Otjozondjupa"                 },
  { id: "i_photo",    name: "Namibia Photography",   description: "Photography across Namibia.", memberCount: 7800,  postCount: 4400, todayPosts: 56, activeUsers: 234, gradient: G.purple, isRegion: false, category: "Photography", joined: true  },
  { id: "i_music",    name: "Namibia Music",         description: "The full spectrum of Namibian sound.", memberCount: 11200, postCount: 5800, todayPosts: 89, activeUsers: 412, gradient: G.dark,   isRegion: false, category: "Music"                      },
  { id: "i_startups", name: "Namibia Startups",      description: "Founders and builders.", memberCount: 3400,  postCount: 1100, todayPosts: 14, activeUsers: 78,  gradient: G.sky,    isRegion: false, category: "Business"                   },
  { id: "i_film",     name: "Namibia Film Industry", description: "Filmmakers and production.", memberCount: 2900,  postCount: 920,  todayPosts: 11, activeUsers: 56,  gradient: G.teal,   isRegion: false, category: "Film"                       },
  { id: "i_cars",     name: "Namibia Cars",          description: "Builds, road trips, events.", memberCount: 6100,  postCount: 2800, todayPosts: 34, activeUsers: 167, gradient: G.rust,   isRegion: false, category: "Cars"                       },
  { id: "i_fashion",  name: "Namibia Fashion",       description: "Designers and trendsetters.", memberCount: 4200,  postCount: 1600, todayPosts: 22, activeUsers: 98,  gradient: G.purple, isRegion: false, category: "Fashion"                    },
];

export const CONVERSATIONS: Conversation[] = [
  {
    id: "cv1", isGroup: false, memberIds: [ME_ID, "u_tangeni"],
    lastMessage: "Yo, the beat I sent — let me know what you think",
    lastAt: "12m", unread: 2,
    messages: [
      { id: "m1", senderId: "u_tangeni", kind: "text", content: "Yo Ndina, you up?",                               createdAt: "1h",  read: true  },
      { id: "m2", senderId: ME_ID,       kind: "text", content: "Always. What is good?",                           createdAt: "1h",  read: true  },
      { id: "m3", senderId: "u_tangeni", kind: "voice", voiceSeconds: 14,                                          createdAt: "55m", read: true, reactions: ["fire"] },
      { id: "m4", senderId: "u_tangeni", kind: "text", content: "The beat I sent — let me know what you think",   createdAt: "12m", read: false },
    ],
  },
  {
    id: "cv2", isGroup: true, groupName: "Windhoek Creatives", memberIds: [ME_ID,"u_didi","u_sarah","u_kavetu"],
    lastMessage: "Kavetu: I will bring the projector",
    lastAt: "1h", unread: 0,
    messages: [
      { id: "m5", senderId: "u_didi",   kind: "text", content: "Who is hosting Friday?",       createdAt: "3h", read: true },
      { id: "m6", senderId: "u_sarah",  kind: "text", content: "My place. Bring snacks.",       createdAt: "2h", read: true },
      { id: "m7", senderId: "u_kavetu", kind: "text", content: "I will bring the projector",   createdAt: "1h", read: true },
    ],
  },
  {
    id: "cv3", isGroup: false, memberIds: [ME_ID, "u_didi"],
    lastMessage: "That Mercedes footage is insane",
    lastAt: "3h", unread: 0,
    messages: [
      { id: "m8", senderId: ME_ID,    kind: "text", content: "That Mercedes footage is insane",             createdAt: "3h", read: true },
      { id: "m9", senderId: "u_didi", kind: "text", content: "Three days in the Namib. The desert does not lie.", createdAt: "3h", read: true },
    ],
  },
  {
    id: "cv4", isGroup: false, memberIds: [ME_ID, "u_kavetu"],
    lastMessage: "Kunene trip in December — you in?",
    lastAt: "1d", unread: 1,
    messages: [
      { id: "m10", senderId: "u_kavetu", kind: "text", content: "Kunene trip in December — you in?", createdAt: "1d", read: false },
    ],
  },
];

export const NOTIFICATIONS: AppNotification[] = [
  { id: "n1", type: "like",    actorId: "u_didi",      body: "liked your photo",                       when: "4m",  bucket: "today",   read: false },
  { id: "n2", type: "follow",  actorId: "u_kavetu",    body: "started following you",                  when: "22m", bucket: "today",   read: false },
  { id: "n3", type: "comment", actorId: "u_sarah",     body: "commented: Need this energy",            when: "1h",  bucket: "today",   read: false },
  { id: "n4", type: "booking", actorId: "u_lukas",     body: "sent a booking request",                 when: "2h",  bucket: "today",   read: false },
  { id: "n5", type: "view",    actorId: "u_tangeni",   body: "viewed your creator profile",            when: "4h",  bucket: "today",   read: true  },
  { id: "n6", type: "repost",  actorId: "u_ester",     body: "reposted your photo",                    when: "1d",  bucket: "week",    read: true  },
  { id: "n7", type: "rsvp",    actorId: "u_helvi",     body: "RSVPd to Windhoek Creatives Meetup",     when: "2d",  bucket: "week",    read: true  },
  { id: "n8", type: "mention", actorId: "u_panduleni", body: "mentioned you in a comment",             when: "3d",  bucket: "week",    read: true  },
  { id: "n9", type: "follow",  actorId: "u_shaun",     body: "started following you",                  when: "1w",  bucket: "earlier", read: true  },
  { id: "n10", type: "event_invite", actorId: "u_lukas", body: "invited you to Summer Fiesta 2026",     when: "6h",  bucket: "today",   read: false },
];

export const OPPORTUNITIES: Opportunity[] = [
  { id: "o1", title: "Photographer Needed", location: "Windhoek", region: "Khomas", date: "Tomorrow", budget: "N$1200", category: "Photographer", postedBy: "u_didi", applicants: 8 },
  { id: "o2", title: "DJ Needed — Corporate Event", location: "Otjiwarongo", region: "Otjozondjupa", date: "Saturday", budget: "N$3000", category: "DJ", postedBy: "u_lukas", applicants: 3 },
  { id: "o3", title: "Model Casting — Fashion Week", location: "Swakopmund", region: "Erongo", date: "Next Week", budget: "N$800", category: "Model", postedBy: "u_sarah", applicants: 24 },
  { id: "o4", title: "Videographer — Music Video", location: "Windhoek", region: "Khomas", date: "Dec 15", budget: "N$5000", category: "Videographer", postedBy: "u_tangeni", applicants: 5 },
  { id: "o5", title: "Makeup Artist — Wedding Season", location: "Oshakati", region: "Oshana", date: "Ongoing", budget: "N$600/day", category: "Makeup Artist", postedBy: "u_ester", applicants: 12 },
];

export const TRENDING: TrendingItem[] = [
  { id: "t1", title: "Summer Fiesta is gaining attention", subtitle: "2,481 interested · 483 going", type: "event", entityId: "e1", engagement: 2481 },
  { id: "t2", title: "Windhoek Creatives is active", subtitle: "47 new posts today", type: "community", entityId: "i_photo", engagement: 47 },
  { id: "t3", title: "Best Kapana Spots discussion", subtitle: "89 comments in the last hour", type: "topic", entityId: "p4", engagement: 89 },
  { id: "t4", title: "Namibia Music has 142 new posts", subtitle: "Trending in Oshana", type: "community", entityId: "i_music", engagement: 142 },
];

export function getProfile(id: string): Profile {
  return PROFILES.find((p) => p.id === id) ?? PROFILES[0];
}
