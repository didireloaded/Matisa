-- ================================================================
-- matisa — Dummy Data Seed Script
-- ALL USERS HAVE PASSWORD: password123
-- ================================================================

-- 1. Create Auth Users (This triggers the creation of public.profiles automatically)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values 
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'hanna@matisa.na', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"username":"hanna_d", "display_name":"Hanna Dowie", "full_name":"Hanna Dowie"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'dj_kboz@matisa.na', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"username":"dj_kboz", "display_name":"DJ Kboz", "full_name":"DJ Kboz"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'michelle@matisa.na', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"username":"michelle_v", "display_name":"Michelle V.", "full_name":"Michelle V."}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'authenticated', 'authenticated', 'silas@matisa.na', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"username":"silas_m", "display_name":"Silas Mutonga", "full_name":"Silas Mutonga"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555', 'authenticated', 'authenticated', 'amara@matisa.na', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"username":"amara_k", "display_name":"Amara Kasaona", "full_name":"Amara Kasaona"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '66666666-6666-6666-6666-666666666666', 'authenticated', 'authenticated', 'tutu@matisa.na', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"username":"tutu_beats", "display_name":"Tutu Beats", "full_name":"Tutu Beats"}', now(), now())
on conflict (id) do nothing;

-- 2. Update the auto-generated Profiles with remaining data
update public.profiles set 
  avatar_url = 'https://images.unsplash.com/photo-1606416132922-22ab37c1231e?w=200&h=200&fit=crop&auto=format',
  bio = 'Windhoek born 🌿 Creative director & storyteller',
  city = 'Windhoek, NAM',
  follower_count = 4820,
  following_count = 312,
  is_verified = true,
  mood = '🎶 Vibes'
where id = '11111111-1111-1111-1111-111111111111';

update public.profiles set 
  avatar_url = 'https://images.unsplash.com/photo-1523477800337-966dbabe060b?w=200&h=200&fit=crop&auto=format',
  bio = 'Afrobeats producer 🎵 Booking: kboz@matisa.na',
  city = 'Windhoek, NAM',
  follower_count = 12400,
  following_count = 890,
  is_verified = true,
  mood = '🔥 Producing'
where id = '22222222-2222-2222-2222-222222222222';

update public.profiles set 
  avatar_url = 'https://images.unsplash.com/photo-1770283553838-769c5f97d55c?w=200&h=200&fit=crop&auto=format',
  bio = 'Photographer + traveler. Capturing Namibia 📸',
  city = 'Swakopmund, NAM',
  follower_count = 7100,
  following_count = 540,
  is_verified = false,
  mood = '📸 Shooting'
where id = '33333333-3333-3333-3333-333333333333';

update public.profiles set 
  avatar_url = 'https://images.unsplash.com/photo-1621061410695-3c32f51bf934?w=200&h=200&fit=crop&auto=format',
  bio = 'Fashion & culture. Based in Katutura 🔥',
  city = 'Katutura, NAM',
  follower_count = 3240,
  following_count = 211,
  is_verified = false,
  mood = '😎 Chill'
where id = '44444444-4444-4444-4444-444444444444';

update public.profiles set 
  avatar_url = 'https://images.unsplash.com/photo-1776780752830-ef0c19c74fe1?w=200&h=200&fit=crop&auto=format',
  bio = 'Events curator | co-founder @NamCulture',
  city = 'Windhoek, NAM',
  follower_count = 9820,
  following_count = 677,
  is_verified = true,
  mood = '☕ Planning'
where id = '55555555-5555-5555-5555-555555555555';

update public.profiles set 
  avatar_url = 'https://images.unsplash.com/photo-1759891480236-082078157b97?w=200&h=200&fit=crop&auto=format',
  bio = 'Hip-hop artist. New EP out now 🎤',
  city = 'Oshakati, NAM',
  follower_count = 18700,
  following_count = 420,
  is_verified = true,
  mood = '🇿🇦 Touring'
where id = '66666666-6666-6666-6666-666666666666';

-- 3. Seed Notes
insert into public.notes (user_id, content, created_at) values
  ('11111111-1111-1111-1111-111111111111', 'Windhoek winters hit different ❄️ Anyone else?', now() - interval '2 minutes'),
  ('22222222-2222-2222-2222-222222222222', 'New Afrobeats set dropping midnight 🔥 tag someone who needs this', now() - interval '15 minutes'),
  ('33333333-3333-3333-3333-333333333333', 'Swakopmund sunsets could cure anything honestly 🌅', now() - interval '1 hour'),
  ('44444444-4444-4444-4444-444444444444', 'Katutura fashion week is real and it''s coming 👀 Save the date: July 18', now() - interval '2 hours'),
  ('55555555-5555-5555-5555-555555555555', 'Reminder: you don''t need anyone''s permission to glow ✨', now() - interval '3 hours'),
  ('66666666-6666-6666-6666-666666666666', 'EP is certified gold in NAM 🏆🏆 I''m crying for real', now() - interval '5 hours');

-- 4. Seed Events
insert into public.events (created_by, title, description, start_time, location_name, cover_url, event_type, rsvp_count, is_free, ticket_price, category) values
  ('55555555-5555-5555-5555-555555555555', 'Namib After Dark', 'The best party in Windhoek', '2026-06-21 20:00:00', 'Craft Centre, Windhoek', 'https://images.unsplash.com/photo-1766393524464-e5eb1b05e4c8?w=800&h=400&fit=crop&auto=format', 'in_person', 284, false, 120.00, 'Music'),
  ('44444444-4444-4444-4444-444444444444', 'Katutura Fashion Week', 'Showcasing the best designers', '2026-07-18 17:00:00', 'Katutura Community Centre', 'https://images.unsplash.com/photo-1751748951873-a27688579b9d?w=800&h=400&fit=crop&auto=format', 'in_person', 520, false, 80.00, 'Fashion'),
  ('22222222-2222-2222-2222-222222222222', 'Desert Rave: Sossusvlei', 'Dancing in the dunes', '2026-07-26 18:00:00', 'Sossusvlei, Namib Desert', 'https://images.unsplash.com/photo-1488197047962-b48492212cda?w=800&h=400&fit=crop&auto=format', 'in_person', 900, false, 350.00, 'Festival'),
  ('66666666-6666-6666-6666-666666666666', 'Afro Roots Open Mic', 'Come spit some bars', '2026-06-18 19:30:00', 'The Warehouse, Windhoek', 'https://images.unsplash.com/photo-1689864727821-e47577e88226?w=800&h=400&fit=crop&auto=format', 'in_person', 134, true, 0.00, 'Open Mic');

-- 5. Seed Voice Rooms
insert into public.voice_rooms (created_by, title, participant_count, is_private) values
  ('22222222-2222-2222-2222-222222222222', 'Afrobeats Only 🔥', 36, false),
  ('33333333-3333-3333-3333-333333333333', '90s R&B Throwback', 19, false),
  ('66666666-6666-6666-6666-666666666666', 'Nam Hip-Hop Cypher', 60, false);
