-- infojunta — Supabase schema
-- Public, read-only civic data. No user accounts, no login.
-- Run this in the Supabase SQL editor.

-- Latest snapshot per source module (the "modular output").
create table if not exists public.snapshots (
  module_key   text primary key,
  payload      jsonb not null,
  as_of_date   timestamptz,
  captured_at  timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Append-only history, for trend charts over time.
create table if not exists public.snapshot_history (
  id           bigint generated always as identity primary key,
  module_key   text not null,
  payload      jsonb not null,
  as_of_date   timestamptz,
  captured_at  timestamptz not null default now()
);
create index if not exists snapshot_history_module_idx
  on public.snapshot_history (module_key, captured_at desc);

-- Optional server-side mirror of analytics events (Mixpanel is primary).
create table if not exists public.events (
  id           bigint generated always as identity primary key,
  name         text not null,
  props        jsonb,
  created_at   timestamptz not null default now()
);

-- Central question repository (seeded from JSON now; back-fillable from
-- municipal portals later).
create table if not exists public.questions (
  id           text primary key,
  question     text not null,
  category     text not null,
  scope        text not null default 'central',
  tags         text[] not null default '{}',
  answer       text,
  link_href    text,
  link_label   text,
  source_name  text,
  source_url   text,
  updated_at   timestamptz not null default now()
);

-- ---- Row Level Security -------------------------------------------------
-- Everyone can READ; only the service role (used by the refresh pipeline)
-- can WRITE. No policies for insert/update/delete => anon writes are denied.
alter table public.snapshots        enable row level security;
alter table public.snapshot_history enable row level security;
alter table public.questions        enable row level security;

drop policy if exists "public read snapshots" on public.snapshots;
create policy "public read snapshots"
  on public.snapshots for select using (true);

drop policy if exists "public read history" on public.snapshot_history;
create policy "public read history"
  on public.snapshot_history for select using (true);

drop policy if exists "public read questions" on public.questions;
create policy "public read questions"
  on public.questions for select using (true);

-- events: no public read (write-only mirror via service role).
alter table public.events enable row level security;
