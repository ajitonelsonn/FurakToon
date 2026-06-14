-- ============================================================================
-- FurakToon credits system
--
-- Every user gets MONTHLY_ALLOWANCE (10) credits. Generating an image costs:
--   - 1 credit for a normal generation
--   - 2 credits when a reference image is used
--
-- The monthly grant RESETS the balance to the allowance (no rollover) the first
-- time a user acts in a new calendar month (lazy refill — no cron needed).
--
-- Run this in the Supabase SQL editor (or via `supabase db push`).
-- ============================================================================

-- 1. Table -------------------------------------------------------------------
create table if not exists public.credits (
  user_id           uuid primary key references auth.users (id) on delete cascade,
  balance           integer     not null default 10,
  monthly_allowance integer     not null default 10,
  -- Truncated to the first day of the month the balance was last reset.
  last_refill_month date        not null default date_trunc('month', now())::date,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint credits_balance_nonneg check (balance >= 0)
);

comment on table public.credits is
  'Per-user generation credits. Refilled monthly (reset to allowance).';

-- 2. Row Level Security ------------------------------------------------------
alter table public.credits enable row level security;

-- Users may read their own credit row. All writes go through SECURITY DEFINER
-- functions below, so no INSERT/UPDATE policy is granted to end users.
drop policy if exists "credits_select_own" on public.credits;
create policy "credits_select_own"
  on public.credits for select
  using (auth.uid() = user_id);

-- 3. Grant credits to new users automatically --------------------------------
create or replace function public.handle_new_user_credits()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.credits (user_id, balance, monthly_allowance, last_refill_month)
  values (new.id, 10, 10, date_trunc('month', now())::date)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_credits on auth.users;
create trigger on_auth_user_created_credits
  after insert on auth.users
  for each row execute function public.handle_new_user_credits();

-- 4. Lazy monthly refill -----------------------------------------------------
-- Ensures the calling user has a credit row and, if a new month has begun since
-- the last refill, resets the balance to the monthly allowance. Returns the
-- current balance. Safe to call on every read.
create or replace function public.ensure_monthly_refill()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  uid          uuid := auth.uid();
  this_month   date := date_trunc('month', now())::date;
  current_bal  integer;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  -- Create the row for users who predate this system (or the trigger missed).
  insert into public.credits (user_id, balance, monthly_allowance, last_refill_month)
  values (uid, 10, 10, this_month)
  on conflict (user_id) do nothing;

  -- Reset to allowance when a new month has started (no rollover).
  update public.credits
     set balance           = monthly_allowance,
         last_refill_month = this_month,
         updated_at        = now()
   where user_id = uid
     and last_refill_month < this_month;

  select balance into current_bal from public.credits where user_id = uid;
  return current_bal;
end;
$$;

-- 5. Atomic spend ------------------------------------------------------------
-- Applies a refill first, then deducts `cost` if the user can afford it.
-- Returns the NEW balance on success, or -1 if there were not enough credits.
-- The row lock (implicit in UPDATE ... WHERE balance >= cost) makes concurrent
-- generations safe.
create or replace function public.spend_credits(cost integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  uid     uuid := auth.uid();
  new_bal integer;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  if cost is null or cost <= 0 then
    raise exception 'invalid cost';
  end if;

  -- Apply any pending monthly refill before checking affordability.
  perform public.ensure_monthly_refill();

  update public.credits
     set balance    = balance - cost,
         updated_at = now()
   where user_id = uid
     and balance >= cost
  returning balance into new_bal;

  if new_bal is null then
    return -1; -- insufficient credits
  end if;
  return new_bal;
end;
$$;

-- 6. Refund (used if generation fails after spending) ------------------------
create or replace function public.refund_credits(amount integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  uid     uuid := auth.uid();
  new_bal integer;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  if amount is null or amount <= 0 then
    raise exception 'invalid amount';
  end if;

  update public.credits
     set balance    = least(balance + amount, monthly_allowance),
         updated_at = now()
   where user_id = uid
  returning balance into new_bal;

  return coalesce(new_bal, 0);
end;
$$;

-- 7. Backfill credits for existing users ------------------------------------
insert into public.credits (user_id, balance, monthly_allowance, last_refill_month)
select id, 10, 10, date_trunc('month', now())::date
from auth.users
on conflict (user_id) do nothing;
