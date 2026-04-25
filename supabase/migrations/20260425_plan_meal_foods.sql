-- =====================================================================
-- Tabela: alimentos dentro de cada refeição do plano (snapshot da TACO)
-- =====================================================================
create table if not exists public.plan_meal_foods (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references public.plan_meals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  food_id int references public.tabela_alimentos(id) on delete set null,
  food_name text not null,
  amount_g numeric not null default 100,
  calories numeric not null default 0,
  protein_g numeric not null default 0,
  carbs_g numeric not null default 0,
  fats_g numeric not null default 0,
  food_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_plan_meal_foods_meal on public.plan_meal_foods (meal_id, food_order);
create index if not exists idx_plan_meal_foods_user on public.plan_meal_foods (user_id);

alter table public.plan_meal_foods enable row level security;

-- Nutri vinculado ao paciente: CRUD total
drop policy if exists "meal_foods_all_nutri" on public.plan_meal_foods;
create policy "meal_foods_all_nutri" on public.plan_meal_foods
  for all using (
    exists (
      select 1 from public.consultations c
      join public.nutritionists n on n.id = c.nutritionist_id
      where c.user_id = public.plan_meal_foods.user_id and n.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.consultations c
      join public.nutritionists n on n.id = c.nutritionist_id
      where c.user_id = public.plan_meal_foods.user_id and n.user_id = auth.uid()
    )
  );

-- Paciente: SELECT só quando o plano dono da refeição estiver com status='sent'
drop policy if exists "meal_foods_select_own_sent" on public.plan_meal_foods;
create policy "meal_foods_select_own_sent" on public.plan_meal_foods
  for select using (
    auth.uid() = user_id
    and exists (
      select 1 from public.plan_meals m
      join public.patient_plans p on p.id = m.plan_id
      where m.id = public.plan_meal_foods.meal_id and p.status = 'sent'
    )
  );

do $$
begin
  begin
    alter publication supabase_realtime add table public.plan_meal_foods;
  exception when duplicate_object then null;
  end;
end $$;
