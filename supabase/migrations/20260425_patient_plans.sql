-- =====================================================================
-- Migration: Plano Completo do Paciente (patient_plans + plan_meals)
-- =====================================================================
-- Suporta o fluxo "Iniciar plano personalizado" do nutricionista:
-- Etapa 1 (Dados) → Etapa 2 (Dieta) → Etapa 3 (Agendar retorno)
-- Quando status='sent', o paciente vê a aba Consultoria liberada.
-- =====================================================================

-- 1) Tabela principal do plano
create table if not exists public.patient_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nutritionist_id uuid references public.nutritionists(id) on delete set null,

  status text not null default 'draft' check (status in ('draft', 'sent', 'archived')),

  -- ETAPA 1 — Dados básicos
  name text,
  birth_date date,
  age int,
  gender text,
  weight_kg numeric,
  height_m numeric,
  bmi numeric,
  tmb_kcal numeric,

  -- Medidas corporais
  measurement_unit text default 'cm' check (measurement_unit in ('cm', 'pol')),
  waist_cm numeric,
  abdomen_cm numeric,
  hip_cm numeric,
  chest_cm numeric,
  arm_cm numeric,
  thigh_cm numeric,
  calf_cm numeric,
  neck_cm numeric,
  data_notes text,

  -- ETAPA 2 — Dieta (metas e preferências; refeições ficam em plan_meals)
  goal_calories int,
  protein_g int,
  carbs_g int,
  fats_g int,
  water_l numeric,
  food_restrictions text[] default '{}',
  food_preferences text[] default '{}',
  diet_notes text,

  -- ETAPA 3 — Agendamento
  appointment_type text default 'Retorno / Consultoria',
  appointment_duration_min int default 30,
  appointment_at timestamptz,
  appointment_notes text,

  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_patient_plans_user_status
  on public.patient_plans (user_id, status, created_at desc);

create index if not exists idx_patient_plans_nutri
  on public.patient_plans (nutritionist_id, status, created_at desc);

alter table public.patient_plans enable row level security;

-- Paciente: vê apenas planos que foram enviados (não vê drafts)
drop policy if exists "plans_select_own_sent" on public.patient_plans;
create policy "plans_select_own_sent" on public.patient_plans
  for select using (auth.uid() = user_id and status = 'sent');

-- Nutri: SELECT/INSERT/UPDATE/DELETE nos planos dos pacientes vinculados
drop policy if exists "plans_select_nutri" on public.patient_plans;
create policy "plans_select_nutri" on public.patient_plans
  for select using (
    exists (
      select 1 from public.consultations c
      join public.nutritionists n on n.id = c.nutritionist_id
      where c.user_id = public.patient_plans.user_id
        and n.user_id = auth.uid()
    )
  );

drop policy if exists "plans_insert_nutri" on public.patient_plans;
create policy "plans_insert_nutri" on public.patient_plans
  for insert with check (
    exists (
      select 1 from public.consultations c
      join public.nutritionists n on n.id = c.nutritionist_id
      where c.user_id = public.patient_plans.user_id
        and n.user_id = auth.uid()
    )
  );

drop policy if exists "plans_update_nutri" on public.patient_plans;
create policy "plans_update_nutri" on public.patient_plans
  for update using (
    exists (
      select 1 from public.consultations c
      join public.nutritionists n on n.id = c.nutritionist_id
      where c.user_id = public.patient_plans.user_id
        and n.user_id = auth.uid()
    )
  );

drop policy if exists "plans_delete_nutri" on public.patient_plans;
create policy "plans_delete_nutri" on public.patient_plans
  for delete using (
    exists (
      select 1 from public.consultations c
      join public.nutritionists n on n.id = c.nutritionist_id
      where c.user_id = public.patient_plans.user_id
        and n.user_id = auth.uid()
    )
  );


-- 2) Tabela das refeições do plano
create table if not exists public.plan_meals (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.patient_plans(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_order int not null default 0,
  meal_type text,
  name text,
  time_of_day time,
  calories int,
  protein_g int,
  carbs_g int,
  fats_g int,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_plan_meals_plan
  on public.plan_meals (plan_id, meal_order);

alter table public.plan_meals enable row level security;

drop policy if exists "meals_all_nutri" on public.plan_meals;
create policy "meals_all_nutri" on public.plan_meals
  for all using (
    exists (
      select 1 from public.consultations c
      join public.nutritionists n on n.id = c.nutritionist_id
      where c.user_id = public.plan_meals.user_id
        and n.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.consultations c
      join public.nutritionists n on n.id = c.nutritionist_id
      where c.user_id = public.plan_meals.user_id
        and n.user_id = auth.uid()
    )
  );

drop policy if exists "meals_select_own_sent" on public.plan_meals;
create policy "meals_select_own_sent" on public.plan_meals
  for select using (
    auth.uid() = user_id
    and exists (
      select 1 from public.patient_plans p
      where p.id = public.plan_meals.plan_id
        and p.status = 'sent'
    )
  );


-- 3) Trigger de updated_at em patient_plans
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_patient_plans_updated_at on public.patient_plans;
create trigger trg_patient_plans_updated_at
  before update on public.patient_plans
  for each row execute function public.set_updated_at();


-- 4) Realtime
do $$
begin
  begin
    alter publication supabase_realtime add table public.patient_plans;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.plan_meals;
  exception when duplicate_object then null;
  end;
end $$;
