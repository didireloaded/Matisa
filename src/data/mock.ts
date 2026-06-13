import type { Profile, Post, Story, EventItem, Community, Conversation, AppNotification, TrendingItem, Playlist, Region } from "@/types";

const G = {
  rust: "linear-gradient(135deg,#C8521A,#6B2D1A)",
  sky: "linear-gradient(135deg,#2D7DD2,#1A3A60)",
  green: "linear-gradient(135deg,#4CAF7D,#1A5C3A)",
  sand: "linear-gradient(135deg,#E8A055,#8B5A1A)",
  dark: "linear-gradient(135deg,#8B3A1F,#3A1A0E)",
  purple: "linear-gradient(135deg,#6B2D7D,#2A1040)",
  teal: "linear-gradient(135deg,#2D7D6B,#1A4038)",
  navy: "linear-gradient(135deg,#1A2D6B,#0A1230)",
};

export const ME_ID = "u_ndina";

export const PROFILES: Profile[] = [
  { id: ME_ID, username: "ndina", full_name: "Ndina Shikongo", bio: "Documentary photographer. Windhoek skies.", avatar_url: "", gradient: G.rust, region: "Khomas", city: "Windhoek", mood: "Golden hour chasing", interests: ["Photography","Film","Travel"], creator_badge: "Photographer", is_creator: true, is_verified: false, is_plus: true, followers_count: 1284, following_count: 312, posts_count: 87, song_title: "Beautiful Naita", song_artist: "Big Ben", voice_intro_url: "mock", voice_intro_duration: 18, joined_date: "Mar 2024", ghost_mode: "approximate", online: true },
  { id: "u_tangeni", username: "tangeni_mwetupunga", full_name: "Tangeni Mwetupunga", bio: "Producer. Oshakati to Windhoek.", avatar_url: "", gradient: G.dark, region: "Oshana", city: "Oshakati", mood: "In the studio", interests: ["Music","Tech","Business"], creator_badge: "Musician", is_creator: true, is_verified: true, is_plus: true, followers_count: 8421, following_count: 540, posts_count: 211, distance: 420, bearing: 45, song_title: "Otjijazz", song_artist: "EES", voice_intro_url: "mock", voice_intro_duration: 24, joined_date: "Jan 2024", ghost_mode: "approximate", online: true },
  { id: "u_kavetu", username: "himba.diaries", full_name: "Kavetu Tjirare", bio: "Telling Kunene stories. Cinematic Namibia.", avatar_url: "", gradient: G.sand, region: "Kunene", city: "Opuwo", mood: "On the road", interests: ["Film","Photography","Travel"], creator_badge: "Filmmaker", is_creator: true, is_verified: true, is_plus: false, followers_count: 9120, following_count: 122, posts_count: 312, distance: 980, bearing: 110, voice_intro_url: "mock", voice_intro_duration: 30, joined_date: "Feb 2024", ghost_mode: "approximate", online: false },
  { id: "u_sarah", username: "sarah.k_photography", full_name: "Sarah Kavandje", bio: "Portrait and commercial photographer.", avatar_url: "", gradient: G.teal, region: "Khomas", city: "Windhoek", mood: "Shooting today", interests: ["Photography","Fashion","Art"], creator_badge: "Photographer", is_creator: true, is_verified: false, is_plus: false, followers_count: 3240, following_count: 810, posts_count: 156, distance: 2300, bearing: 200, joined_date: "Apr 2024", ghost_mode: "exact", online: true },
  { id: "u_didi", username: "didi_reloaded", full_name: "Didi Reloaded", bio: "Cinematographer. Visual storyteller.", avatar_url: "", gradient: G.purple, region: "Khomas", city: "Windhoek", mood: "Post-production", interests: ["Film","Tech","Music"], creator_badge: "Videographer", is_creator: true, is_verified: true, is_plus: true, followers_count: 12400, following_count: 210, posts_count: 445, distance: 1450, bearing: 280, voice_intro_url: "mock", voice_intro_duration: 22, joined_date: "Dec 2023", ghost_mode: "exact", online: true },
  { id: "u_lukas", username: "the.kwaito.kid", full_name: "Lukas Hango", bio: "DJ. Otjiwarongo crowds.", avatar_url: "", gradient: G.green, region: "Otjozondjupa", city: "Otjiwarongo", mood: "Set tonight", interests: ["Music","Cars","Sports"], creator_badge: "DJ", is_creator: true, is_verified: false, is_plus: false, followers_count: 5102, following_count: 890, posts_count: 154, distance: 3400, bearing: 330, voice_intro_url: "mock", voice_intro_duration: 15, joined_date: "May 2024", ghost_mode: "approximate", online: true },
  { id: "u_ester", username: "ester.k", full_name: "Ester Kapuuo", bio: "Swakopmund. Coffee, running, cold Atlantic.", avatar_url: "", gradient: G.sky, region: "Erongo", city: "Swakopmund", mood: "Salty hair", interests: ["Sports","Travel","Food"], is_creator: false, is_verified: false, is_plus: false, followers_count: 945, following_count: 410, posts_count: 64, distance: 4100, bearing: 160, joined_date: "Jun 2024", ghost_mode: "hidden", online: false },
  { id: "u_shaun", username: "shaun.garoeb", full_name: "Shaun //Garoeb", bio: "Luderitz. Fish, stars, silence.", avatar_url: "", gradient: G.navy, region: "//Karas", city: "Luderitz", mood: "Stargazing", interests: ["Photography","Travel","Food"], is_creator: false, is_verified: false, is_plus: false, followers_count: 612, following_count: 220, posts_count: 38, joined_date: "Jul 2024", ghost_mode: "hidden", online: false },
  { id: "u_panduleni", username: "panduleni_iy", full_name: "Panduleni Iyambo", bio: "Law student. Eenhana born.", avatar_url: "", gradient: G.teal, region: "Ohangwena", city: "Eenhana", mood: "Deadlines", interests: ["Business","Tech","Gaming"], is_creator: false, is_verified: false, is_plus: false, followers_count: 312, following_count: 188, posts_count: 27, joined_date: "Aug 2024", ghost_mode: "approximate", online: true },
  { id: "u_helvi", username: "helvi.shilumbu", full_name: "Helvi Shilumbu", bio: "Caprivi-born. Katima river life.", avatar_url: "", gradient: G.green, region: "Zambezi", city: "Katima Mulilo", mood: "River weekend", interests: ["Travel","Food","Photography"], is_creator: false, is_verified: false, is_plus: false, followers_count: 1820, following_count: 612, posts_count: 73, distance: 6200, bearing: 70, joined_date: "Sep 2024", ghost_mode: "approximate", online: true },
];

export const POSTS: Post[] = [
  { id: "p1", user_id: "u_kavetu", content: "Sunrise at Epupa Falls. No filter. The Kunene does the work.", type: "photo", media_urls: [""], region: "Kunene", created_at: "2h", profiles: PROFILES[2], likes_count: 421, comments_count: 38, reposts_count: 24, saves_count: 89 },
  { id: "p2", user_id: "u_tangeni", content: "Dropping a new beat tonight at 23:00. Kapana energy meets soft house.", type: "voice", voice_duration: 28, region: "Oshana", created_at: "3h", profiles: PROFILES[1], likes_count: 184, comments_count: 22, reposts_count: 9, saves_count: 31 },
  { id: "p3", user_id: "u_didi", content: "Wrapped the Mercedes GLC campaign yesterday. Three days in the Namib.", type: "photo", media_urls: [""], region: "Khomas", created_at: "5h", profiles: PROFILES[4], likes_count: 876, comments_count: 61, reposts_count: 42, saves_count: 203, liked: true },
  { id: "p4", user_id: "u_lukas", content: "Otjiwarongo, see you tonight. The Vault. Doors at 21:00.", type: "photo", media_urls: [""], region: "Otjozondjupa", created_at: "6h", profiles: PROFILES[5], likes_count: 312, comments_count: 41, reposts_count: 18, saves_count: 55 },
  { id: "p5", user_id: "u_sarah", content: "Namibia Fashion Week portraits. Every face a story.", type: "photo", media_urls: [""], region: "Khomas", created_at: "8h", profiles: PROFILES[3], likes_count: 544, comments_count: 33, reposts_count: 21, saves_count: 118 },
  { id: "p6", user_id: "u_kavetu", content: "Driving the Kaokoveld with no plan and a full tank. This is the reel.", type: "video", media_urls: [""], region: "Kunene", created_at: "10h", profiles: PROFILES[2], likes_count: 1204, comments_count: 88, reposts_count: 76, saves_count: 312 },
  { id: "p7", user_id: ME_ID, content: "Windhoek skyline at 18:42. August light is something no camera will ever fully do justice.", type: "photo", media_urls: [""], region: "Khomas", created_at: "1d", profiles: PROFILES[0], likes_count: 287, comments_count: 31, reposts_count: 12, saves_count: 67, liked: true },
  { id: "p8", user_id: "u_ester", content: "New bakery on Sam Nujoma in Swakop. The cardamom buns are dangerous.", type: "text", region: "Erongo", created_at: "1d", profiles: PROFILES[6], likes_count: 96, comments_count: 14, reposts_count: 3, saves_count: 22 },
  { id: "p9", user_id: "u_helvi", content: "Boat ride down the Zambezi. Hippos kept their distance. Mostly.", type: "video", media_urls: [""], region: "Zambezi", created_at: "1d", profiles: PROFILES[9], likes_count: 502, comments_count: 56, reposts_count: 21, saves_count: 88 },
  { id: "p10", user_id: "u_didi", content: "The thing about filmmaking in Namibia is that the landscape does half the storytelling for you.", type: "voice", voice_duration: 42, region: "Khomas", created_at: "2d", profiles: PROFILES[4], likes_count: 623, comments_count: 47, reposts_count: 31, saves_count: 145 },
  { id: "p11", user_id: "u_tangeni", content: "Late night thoughts from the studio. Who's still awake?", type: "voice", voice_duration: 19, region: "Oshana", created_at: "2d", profiles: PROFILES[1], likes_count: 241, comments_count: 34, reposts_count: 8, saves_count: 29 },
  { id: "p12", user_id: ME_ID, content: "Voice note from the dunes. The silence out here hits different.", type: "voice", voice_duration: 35, region: "Khomas", created_at: "3d", profiles: PROFILES[0], likes_count: 189, comments_count: 22, reposts_count: 11, saves_count: 48 },
];

export const STORIES: Story[] = [
  { id: "s0", user_id: ME_ID, kind: "image", media_url: "", gradient: G.rust, expires_at: "24h" },
  { id: "s1", user_id: "u_tangeni", kind: "audio", caption: "Late night session beat preview", media_url: "", gradient: G.dark, expires_at: "24h" },
  { id: "s2", user_id: "u_kavetu", kind: "video", caption: "Kunene golden hour", media_url: "", gradient: G.sand, expires_at: "24h" },
  { id: "s3", user_id: "u_sarah", kind: "image", caption: "Portrait session wrapped", media_url: "", gradient: G.teal, expires_at: "24h" },
  { id: "s4", user_id: "u_didi", kind: "video", caption: "Mercedes behind the scenes", media_url: "", gradient: G.purple, expires_at: "24h" },
  { id: "s5", user_id: "u_lukas", kind: "image", caption: "Set list locked in", media_url: "", gradient: G.green, expires_at: "24h" },
  { id: "s6", user_id: "u_ester", kind: "image", caption: "Swako 5am run", media_url: "", gradient: G.sky, expires_at: "24h" },
];

export const EVENTS: EventItem[] = [
  { id: "e1", created_by: "u_lukas", title: "Summer Fiesta 2026", description: "Namibia's biggest outdoor festival.", location_name: "Otjiwarongo Showgrounds", region: "Otjozondjupa", date: "Sat 14 Feb", time: "14:00", rsvp_count: 483, interested_count: 2481, is_free: false, price: 350, gradient: G.rust, has_tickets: true, has_event_chat: true, category: "Festival", attendee_ids: ["u_tangeni","u_sarah","u_didi","u_helvi"] },
  { id: "e2", created_by: "u_sarah", title: "Windhoek Creatives Meetup", description: "Monthly gathering of creatives.", location_name: "Factory Windhoek", region: "Khomas", date: "Today", time: "18:00", rsvp_count: 340, interested_count: 840, is_free: true, gradient: G.purple, has_tickets: false, has_event_chat: true, category: "Networking", attendee_ids: [ME_ID,"u_didi","u_kavetu"], rsvpd: true },
  { id: "e3", created_by: "u_kavetu", title: "Etosha Photo Walk", description: "Guided sunrise game drive.", location_name: "Etosha South Gate", region: "Oshikoto", date: "Sun 16 Nov", time: "05:00", rsvp_count: 11, interested_count: 42, is_free: false, price: 450, gradient: G.sand, has_tickets: true, has_event_chat: false, category: "Photography", attendee_ids: ["u_sarah"] },
  { id: "e4", created_by: "u_lukas", title: "Kapana Cook-off Championship", description: "The best braai in Namibia.", location_name: "Single Quarters, Katutura", region: "Khomas", date: "Sat 22 Nov", time: "12:00", rsvp_count: 1204, interested_count: 3100, is_free: true, gradient: G.dark, has_tickets: false, has_event_chat: true, category: "Food", attendee_ids: [ME_ID,"u_ester","u_panduleni"] },
  { id: "e5", created_by: "u_helvi", title: "Zambezi River Sundowner Cruise", description: "Live marimba, sundowners.", location_name: "Katima Mulilo Riverfront", region: "Zambezi", date: "Sun 23 Nov", time: "16:00", rsvp_count: 78, interested_count: 210, is_free: false, price: 220, gradient: G.teal, has_tickets: true, has_event_chat: false, category: "Social", attendee_ids: [] },
  { id: "e6", created_by: "u_ester", title: "Swakopmund Open Mic Night", description: "Poets, comedians, musicians.", location_name: "Ocean Cellar, Swakopmund", region: "Erongo", date: "Fri 28 Nov", time: "19:30", rsvp_count: 142, interested_count: 380, is_free: true, gradient: G.sky, has_tickets: false, has_event_chat: false, category: "Arts", attendee_ids: [] },
];

export const COMMUNITIES: Community[] = [
  { id: "c_khomas", name: "Khomas", description: "The capital region.", member_count: 12400, post_count: 3200, today_posts: 47, active_users: 312, gradient: G.rust, is_region: true, region: "Khomas", joined: true },
  { id: "c_erongo", name: "Erongo", description: "Coast region.", member_count: 8100, post_count: 1800, today_posts: 23, active_users: 156, gradient: G.sky, is_region: true, region: "Erongo" },
  { id: "c_oshana", name: "Oshana", description: "North-central hub.", member_count: 9200, post_count: 2100, today_posts: 31, active_users: 198, gradient: G.sand, is_region: true, region: "Oshana", joined: true },
  { id: "c_zambezi", name: "Zambezi", description: "Far north-east.", member_count: 4300, post_count: 880, today_posts: 12, active_users: 67, gradient: G.teal, is_region: true, region: "Zambezi" },
  { id: "c_kunene", name: "Kunene", description: "Remote north-west.", member_count: 3100, post_count: 650, today_posts: 8, active_users: 42, gradient: G.dark, is_region: true, region: "Kunene" },
  { id: "c_otjo", name: "Otjozondjupa", description: "Central-north.", member_count: 5600, post_count: 1200, today_posts: 19, active_users: 89, gradient: G.green, is_region: true, region: "Otjozondjupa" },
  { id: "i_photo", name: "Namibia Photography", description: "Photography across Namibia.", member_count: 7800, post_count: 4400, today_posts: 56, active_users: 234, gradient: G.purple, is_region: false, category: "Photography", joined: true },
  { id: "i_music", name: "Namibia Music", description: "The full spectrum of Namibian sound.", member_count: 11200, post_count: 5800, today_posts: 89, active_users: 412, gradient: G.dark, is_region: false, category: "Music" },
  { id: "i_startups", name: "Namibia Startups", description: "Founders and builders.", member_count: 3400, post_count: 1100, today_posts: 14, active_users: 78, gradient: G.sky, is_region: false, category: "Business" },
  { id: "i_film", name: "Namibia Film Industry", description: "Filmmakers and production.", member_count: 2900, post_count: 920, today_posts: 11, active_users: 56, gradient: G.teal, is_region: false, category: "Film" },
  { id: "i_cars", name: "Namibia Cars", description: "Builds, road trips, events.", member_count: 6100, post_count: 2800, today_posts: 34, active_users: 167, gradient: G.rust, is_region: false, category: "Cars" },
  { id: "i_fashion", name: "Namibia Fashion", description: "Designers and trendsetters.", member_count: 4200, post_count: 1600, today_posts: 22, active_users: 98, gradient: G.purple, is_region: false, category: "Fashion" },
];

export const PLAYLISTS: Playlist[] = [
  { id: "pl_1", user_id: ME_ID, title: "Windhoek Nights", description: "Vibes for the capital", gradient: "linear-gradient(135deg,#C8521A,#6B2D1A)", track_count: 24, votes: 1250, created_at: "2024-05-10T10:00:00Z", is_public: true },
  { id: "pl_2", user_id: "u_tangeni", title: "Oshakati Heat", description: "Summer anthems", gradient: "linear-gradient(135deg,#E8A055,#8B5A1A)", track_count: 15, votes: 840, created_at: "2024-05-11T14:30:00Z", is_public: true },
  { id: "pl_3", user_id: "u_anna", title: "Swakop Chill", description: "Coastal breeze", gradient: "linear-gradient(135deg,#2D7DD2,#1A3A60)", track_count: 32, votes: 2100, created_at: "2024-05-12T09:15:00Z", is_public: true },
  { id: "pl_4", user_id: "u_didi", title: "Amapiano Namibia", description: "Log drum heavy", gradient: "linear-gradient(135deg,#4CAF7D,#1A5C3A)", track_count: 45, votes: 3400, created_at: "2024-05-13T16:45:00Z", is_public: true },
  { id: "pl5", user_id: "u_didi", title: "Film Scoring Mood", description: "Cinematic soundscapes for editing sessions.", track_count: 15, followers_count: 234, gradient: G.purple, is_public: true, votes: 156 },
  { id: "pl6", user_id: "u_ester", title: "Morning Run", description: "High energy tracks for the coastline.", track_count: 28, followers_count: 178, gradient: G.sky, is_public: true, votes: 98 },
  { id: "pl7", user_id: "u_kavetu", title: "Kunene Sunsets", description: "Traditional meets electronic. Himba vibes.", track_count: 12, followers_count: 567, gradient: G.sand, is_public: true, votes: 345 },
];

export const REGIONAL_CHARTS = {
  Namibia: [
    { rank: 1, title: "Beautiful Naita", artist: "Big Ben", gradient: "linear-gradient(135deg,#C8521A,#6B2D1A)" },
    { rank: 2, title: "Otjijazz", artist: "EES", gradient: "linear-gradient(135deg,#2D7DD2,#1A3A60)" },
    { rank: 3, title: "Midnight", artist: "Tate Buti", gradient: "linear-gradient(135deg,#6B2D7D,#2A1040)" },
  ],
  Windhoek: [
    { rank: 1, title: "City Lights", artist: "Top Cheri", gradient: "linear-gradient(135deg,#4CAF7D,#1A5C3A)" },
    { rank: 2, title: "Katutura Vibes", artist: "Gazza", gradient: "linear-gradient(135deg,#E8A055,#8B5A1A)" },
    { rank: 3, title: "Wika", artist: "Exit", gradient: "linear-gradient(135deg,#C8521A,#6B2D1A)" },
  ],
  Swakopmund: [
    { rank: 1, title: "Ocean Breeze", artist: "Sally Boss Madam", gradient: "linear-gradient(135deg,#2D7DD2,#1A3A60)" },
    { rank: 2, title: "Desert Frequencies", artist: "Lioness", gradient: "linear-gradient(135deg,#E8A055,#8B5A1A)" },
    { rank: 3, title: "Dunes", artist: "King Tee Dee", gradient: "linear-gradient(135deg,#C8521A,#6B2D1A)" },
  ],
  Oshakati: [
    { rank: 1, title: "Oshana", artist: "Ndawana", gradient: "linear-gradient(135deg,#6B2D7D,#2A1040)" },
    { rank: 2, title: "North Bound", artist: "PDK", gradient: "linear-gradient(135deg,#4CAF7D,#1A5C3A)" },
    { rank: 3, title: "Heatwave", artist: "Sunny Boy", gradient: "linear-gradient(135deg,#C8521A,#6B2D1A)" },
  ],
};

export const NEW_RELEASES = [
  { id: "nr1", title: "Desert Frequencies", gradient: "linear-gradient(135deg,#E8A055,#8B5A1A)" },
  { id: "nr2", title: "Oshana Nights", gradient: "linear-gradient(135deg,#8B3A1F,#3A1A0E)" },
  { id: "nr3", title: "Atlantic Pulse", gradient: "linear-gradient(135deg,#2D7DD2,#1A3A60)" },
  { id: "nr4", title: "Kwaito Revival", gradient: "linear-gradient(135deg,#4CAF7D,#1A5C3A)" },
];

export const FEATURED_ARTISTS = [
  { id: "fa1", name: "Gazza", role: "Kwaito King", image: "linear-gradient(135deg,#C8521A,#6B2D1A)" },
  { id: "fa2", name: "Top Cheri", role: "Pop Sensation", image: "linear-gradient(135deg,#E8A055,#8B5A1A)" },
  { id: "fa3", name: "King Tee Dee", role: "Mshasho", image: "linear-gradient(135deg,#2D7DD2,#1A3A60)" },
];

export const LISTENING_SESSIONS = [
  { id: "ls1", title: "Amapiano Sundays", host: "DJ Vuyo", listeners: 142, gradient: "linear-gradient(135deg,#C8521A,#6B2D1A)" },
  { id: "ls2", title: "Windhoek Underground", host: "Underground NA", listeners: 89, gradient: "linear-gradient(135deg,#2D7DD2,#1A3A60)" },
  { id: "ls3", title: "Classic Kwaito", host: "Retro Sounds", listeners: 310, gradient: "linear-gradient(135deg,#4CAF7D,#1A5C3A)" },
];

export const CONVERSATIONS: Conversation[] = [
  { id: "cv1", is_group: false, member_ids: [ME_ID, "u_tangeni"], last_message: "Yo, the beat I sent — let me know what you think", last_message_at: "12m", unread: 2 },
  { id: "cv2", is_group: true, group_name: "Windhoek Creatives", member_ids: [ME_ID,"u_didi","u_sarah","u_kavetu"], last_message: "Kavetu: I will bring the projector", last_message_at: "1h", unread: 0 },
  { id: "cv3", is_group: false, member_ids: [ME_ID, "u_anna"], last_message: "Audio Message", last_message_at: "2h", unread: 0 },
  { id: "cv4", is_group: false, member_ids: [ME_ID, "u_kavetu"], last_message: "Kunene trip in December — you in?", last_message_at: "1d", unread: 1 },
];

export const MESSAGES = [
  { id: "m1", conversation_id: "cv1", user_id: "u_tangeni", kind: "text", content: "Bro, check out this track.", created_at: "12:00 PM" },
  { id: "m2", conversation_id: "cv1", user_id: ME_ID, kind: "text", content: "Sending it now.", created_at: "12:05 PM" },
  { id: "m3", conversation_id: "cv1", user_id: "u_tangeni", kind: "audio", voice_duration: 15, created_at: "12:12 PM" },
  { id: "m4", conversation_id: "cv1", user_id: "u_tangeni", kind: "text", content: "Yo, the beat I sent — let me know what you think", created_at: "12:12 PM" }
];

export const NOTIFICATIONS: AppNotification[] = [
  { id: "n1", type: "like", actor_id: "u_didi", recipient_id: ME_ID, body: "liked your photo", when: "4m", bucket: "today", read: false },
  { id: "n2", type: "follow", actor_id: "u_kavetu", recipient_id: ME_ID, body: "started following you", when: "22m", bucket: "today", read: false },
  { id: "n3", type: "comment", actor_id: "u_sarah", recipient_id: ME_ID, body: "commented: Need this energy", when: "1h", bucket: "today", read: false },
  { id: "n5", type: "view", actor_id: "u_tangeni", recipient_id: ME_ID, body: "viewed your profile", when: "4h", bucket: "today", read: true },
  { id: "n6", type: "repost", actor_id: "u_ester", recipient_id: ME_ID, body: "reposted your photo", when: "1d", bucket: "week", read: true },
  { id: "n7", type: "rsvp", actor_id: "u_helvi", recipient_id: ME_ID, body: "RSVPd to Windhoek Creatives Meetup", when: "2d", bucket: "week", read: true },
  { id: "n8", type: "mention", actor_id: "u_panduleni", recipient_id: ME_ID, body: "mentioned you in a comment", when: "3d", bucket: "week", read: true },
  { id: "n9", type: "follow", actor_id: "u_shaun", recipient_id: ME_ID, body: "started following you", when: "1w", bucket: "earlier", read: true },
  { id: "n10", type: "event_invite", actor_id: "u_lukas", recipient_id: ME_ID, body: "invited you to Summer Fiesta 2026", when: "6h", bucket: "today", read: false },
];

export const TRENDING: TrendingItem[] = [
  { id: "t1", title: "Summer Fiesta is gaining attention", subtitle: "2,481 interested · 483 going", type: "event", entity_id: "e1", engagement: 2481 },
  { id: "t2", title: "Windhoek Creatives is active", subtitle: "47 new posts today", type: "community", entity_id: "i_photo", engagement: 47 },
  { id: "t3", title: "Best Kapana Spots discussion", subtitle: "89 comments in the last hour", type: "topic", entity_id: "p4", engagement: 89 },
  { id: "t4", title: "Namibia Music has 142 new posts", subtitle: "Trending in Oshana", type: "community", entity_id: "i_music", engagement: 142 },
];

export const TRENDING_TAGS = [
  "#Windhoek", "#Amapiano", "#SummerFiesta", "#MatisaVoices", "#NamibiaFilm",
  "#KapanaCulture", "#WorldCup", "#CreativesNamibia", "#NamibianMusic", "#Swakopmund",
];

export const REGIONS: Region[] = [
  "Khomas","Erongo","Hardap","//Karas","Kavango East","Kavango West",
  "Kunene","Ohangwena","Omaheke","Omusati","Oshana","Oshikoto",
  "Otjozondjupa","Zambezi",
];

export function getProfile(id: string): Profile {
  return PROFILES.find(p => p.id === id) ?? PROFILES[0];
}

export function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n);
}
