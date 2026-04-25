-- =====================================================================
-- Migration: Consultation Check-ins, Body Composition & AI Patient Alerts
-- =====================================================================

-- 1) Check-ins da consultoria (card "Check-in rápido" do paciente)
create table if not exists public.consultation_checkins (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  hunger int not null check (hunger between 0 and 10),
  energy int not null check (energy between 0 and 10),
  mood int not null check (mood between 0 and 10),
  humor int not null check (humor between 0 and 10),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_consultation_checkins_user_date
  on public.consultation_checkins (user_id, created_at desc);

alter table public.consultation_checkins enable row level security;

-- Usuário pode ver / inserir os próprios check-ins
drop policy if exists "checkins_select_own" on public.consultation_checkins;
create policy "checkins_select_own" on public.consultation_checkins
  for select using (auth.uid() = user_id);

drop policy if exists "checkins_insert_own" on public.consultation_checkins;
create policy "checkins_insert_own" on public.consultation_checkins
  for insert with check (auth.uid() = user_id);

-- Nutricionista pode ver check-ins dos pacientes vinculados
drop policy if exists "checkins_select_nutri" on public.consultation_checkins;
create policy "checkins_select_nutri" on public.consultation_checkins
  for select using (
    exists (
      select 1 from public.consultations c
      join public.nutritionists n on n.id = c.nutritionist_id
      where c.user_id = public.consultation_checkins.user_id
        and n.user_id = auth.uid()
    )
  );


-- 2) Composição corporal (preenchida pelo nutri)
create table if not exists public.body_composition (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  lean_mass numeric,            -- Massa magra (kg)
  fat_mass numeric,             -- Massa gorda (kg)
  body_fat_pct numeric,         -- % de gordura
  waist numeric,                -- Cintura (cm)
  hip numeric,                  -- Quadril (cm)
  chest numeric,                -- Peito (cm)
  arm numeric,                  -- Braço (cm)
  thigh numeric,                -- Coxa (cm)
  notes text,
  measured_at date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_body_composition_user
  on public.body_composition (user_id, measured_at desc);

alter table public.body_composition enable row level security;

drop policy if exists "bodycomp_select_own" on public.body_composition;
create policy "bodycomp_select_own" on public.body_composition
  for select using (auth.uid() = user_id);

drop policy if exists "bodycomp_select_nutri" on public.body_composition;
create policy "bodycomp_select_nutri" on public.body_composition
  for select using (
    exists (
      select 1 from public.consultations c
      join public.nutritionists n on n.id = c.nutritionist_id
      where c.user_id = public.body_composition.user_id
        and n.user_id = auth.uid()
    )
  );

drop policy if exists "bodycomp_insert_nutri" on public.body_composition;
create policy "bodycomp_insert_nutri" on public.body_composition
  for insert with check (
    exists (
      select 1 from public.consultations c
      join public.nutritionists n on n.id = c.nutritionist_id
      where c.user_id = public.body_composition.user_id
        and n.user_id = auth.uid()
    )
  );

drop policy if exists "bodycomp_update_nutri" on public.body_composition;
create policy "bodycomp_update_nutri" on public.body_composition
  for update using (
    exists (
      select 1 from public.consultations c
      join public.nutritionists n on n.id = c.nutritionist_id
      where c.user_id = public.body_composition.user_id
        and n.user_id = auth.uid()
    )
  );


-- 3) Alertas gerados por IA (analisados pelo Gemini)
create table if not exists public.patient_alerts (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade unique,
  alerts jsonb not null default '[]'::jsonb,
  -- estrutura: [{ "title": "...", "subtitle": "...", "severity": "high|medium|low", "icon": "weight|protein|water|energy|hunger" }]
  generated_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_patient_alerts_user
  on public.patient_alerts (user_id);

alter table public.patient_alerts enable row level security;

drop policy if exists "alerts_select_own" on public.patient_alerts;
create policy "alerts_select_own" on public.patient_alerts
  for select using (auth.uid() = user_id);

drop policy if exists "alerts_select_nutri" on public.patient_alerts;
create policy "alerts_select_nutri" on public.patient_alerts
  for select using (
    exists (
      select 1 from public.consultations c
      join public.nutritionists n on n.id = c.nutritionist_id
      where c.user_id = public.patient_alerts.user_id
        and n.user_id = auth.uid()
    )
  );

-- Inserção/atualização: o nutri gera os alertas pelo painel (é ele quem chama a IA)
drop policy if exists "alerts_upsert_nutri" on public.patient_alerts;
create policy "alerts_upsert_nutri" on public.patient_alerts
  for insert with check (
    exists (
      select 1 from public.consultations c
      join public.nutritionists n on n.id = c.nutritionist_id
      where c.user_id = public.patient_alerts.user_id
        and n.user_id = auth.uid()
    )
  );

drop policy if exists "alerts_update_nutri" on public.patient_alerts;
create policy "alerts_update_nutri" on public.patient_alerts
  for update using (
    exists (
      select 1 from public.consultations c
      join public.nutritionists n on n.id = c.nutritionist_id
      where c.user_id = public.patient_alerts.user_id
        and n.user_id = auth.uid()
    )
  );


-- 4) Garante que meals tenha carbs/fat (já tinha calorias e protein nos types)
-- Nada a fazer no schema: meals é jsonb dentro de daily_records.
-- Os campos carbs/fat serão preenchidos pelo front quando disponíveis.


-- 5) Realtime para tabelas novas
alter publication supabase_realtime add table public.consultation_checkins;
alter publication supabase_realtime add table public.patient_alerts;
alter publication supabase_realtime add table public.body_composition;
