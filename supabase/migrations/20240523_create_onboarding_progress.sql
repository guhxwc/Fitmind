-- Create the onboarding_progress table linked to auth.users
create table public.onboarding_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  step integer not null default 0,
  user_data jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone not null default now(),
  constraint onboarding_progress_pkey primary key (user_id)
);

-- Enable Row Level Security (RLS)
alter table public.onboarding_progress enable row level security;

-- Create policies to allow users to manage their own progress
create policy "Users can view their own onboarding progress"
on public.onboarding_progress
for select
using (auth.uid() = user_id);

create policy "Users can insert/update their own onboarding progress"
on public.onboarding_progress
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own onboarding progress"
on public.onboarding_progress
for update
using (auth.uid() = user_id);
