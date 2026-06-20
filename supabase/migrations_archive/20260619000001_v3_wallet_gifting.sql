-- ================================================================
-- MATISA WALLET & GIFTING SCHEMA
-- ================================================================

create table public.wallets (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  balance integer default 0,
  updated_at timestamptz default now()
);

-- Give users an initial balance when wallet is created
create or replace function public.handle_new_wallet() returns trigger as $$
begin
  insert into public.wallets (user_id, balance) values (new.id, 500);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created_wallet
  after insert on public.profiles
  for each row execute procedure public.handle_new_wallet();

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.profiles(id) on delete cascade,
  receiver_id uuid references public.profiles(id) on delete cascade,
  amount integer not null,
  type text not null, -- 'gift', 'topup'
  created_at timestamptz default now()
);

-- RPC for gifting
create or replace function public.send_gift(p_sender_id uuid, p_receiver_id uuid, p_amount integer) returns boolean as $$
declare
  sender_balance integer;
begin
  select balance into sender_balance from public.wallets where user_id = p_sender_id;
  if sender_balance < p_amount then
    return false;
  end if;

  update public.wallets set balance = balance - p_amount where user_id = p_sender_id;
  update public.wallets set balance = balance + p_amount where user_id = p_receiver_id;

  insert into public.transactions (sender_id, receiver_id, amount, type) values (p_sender_id, p_receiver_id, p_amount, 'gift');

  return true;
end;
$$ language plpgsql security definer;

-- Backfill wallets for existing profiles
insert into public.wallets (user_id, balance)
select id, 5000 from public.profiles
on conflict (user_id) do nothing;
