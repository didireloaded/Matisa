---
name: matisa-backend-patterns
description: Guidelines and patterns for Matisa Supabase Backend schemas, RLS policies, and storage buckets. Use this skill when creating new database features.
---

# Matisa Backend Patterns

When creating new Supabase migrations or backend features for Matisa, strictly adhere to these patterns:

## 1. Table Definitions
All new tables must follow this core structure:
- `id`: `uuid primary key default gen_random_uuid()`
- `created_at`: `timestamp with time zone default now() not null`
- Foreign Keys: Always use `references public.[table](id) on delete cascade not null` where appropriate to avoid orphaned rows.

Example:
```sql
create table if not exists public.notes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    content text not null,
    created_at timestamp with time zone default now() not null
);
```

## 2. Row Level Security (RLS)
- **ALWAYS** enable RLS immediately after creating a table: `alter table public.[table_name] enable row level security;`
- **Read Policies:** Usually open to all users (`select using (true)`), but adjust if data is private.
- **Write Policies:** Must enforce ownership. Use `insert with check (auth.uid() = user_id)` and `update using (auth.uid() = user_id)`.

Example:
```sql
create policy "notes_read" on public.notes for select using (true);
create policy "notes_insert" on public.notes for insert with check (auth.uid() = user_id);
create policy "notes_update" on public.notes for update using (auth.uid() = user_id);
create policy "notes_delete" on public.notes for delete using (auth.uid() = user_id);
```

## 3. Storage Buckets
If the feature requires media uploads:
- Insert the bucket definition: `insert into storage.buckets (id, name, public) values ('bucket_name', 'bucket_name', true) on conflict (id) do nothing;`
- Add Storage RLS:
  - Read: `create policy "bucket_read" on storage.objects for select using (bucket_id = 'bucket_name');`
  - Insert: `create policy "bucket_insert" on storage.objects for insert with check (bucket_id = 'bucket_name' and auth.uid() = owner);`

## 4. Realtime
If the table data needs to update in the UI without a refresh (like chat, notes, live streams):
- Add it to the realtime publication: `alter publication supabase_realtime add table [table_name];`
