create table if not exists public.foods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  portion_size numeric not null default 100,
  portion_unit text not null default 'g',
  kcal numeric not null default 0,
  protein numeric not null default 0,
  carbs numeric not null default 0,
  fat numeric not null default 0,
  created_at timestamptz not null default now()
);

-- Mocks base
insert into public.foods (name, category, portion_size, portion_unit, kcal, protein, carbs, fat)
select 'Arroz branco cozido', 'Cereais', 100, 'g', 128, 2.5, 28.1, 0.2
where not exists (select 1 from public.foods where name = 'Arroz branco cozido');

insert into public.foods (name, category, portion_size, portion_unit, kcal, protein, carbs, fat)
select 'Feijão carioca cozido', 'Leguminosas', 100, 'g', 76, 4.8, 13.6, 0.5
where not exists (select 1 from public.foods where name = 'Feijão carioca cozido');

insert into public.foods (name, category, portion_size, portion_unit, kcal, protein, carbs, fat)
select 'Peito de frango grelhado', 'Carnes', 100, 'g', 159, 32.0, 0, 3.2
where not exists (select 1 from public.foods where name = 'Peito de frango grelhado');

insert into public.foods (name, category, portion_size, portion_unit, kcal, protein, carbs, fat)
select 'Ovo inteiro cozido', 'Ovos', 50, 'g', 78, 6.3, 0.6, 5.3
where not exists (select 1 from public.foods where name = 'Ovo inteiro cozido');

insert into public.foods (name, category, portion_size, portion_unit, kcal, protein, carbs, fat)
select 'Banana prata', 'Frutas', 100, 'g', 98, 1.3, 26.0, 0.1
where not exists (select 1 from public.foods where name = 'Banana prata');

insert into public.foods (name, category, portion_size, portion_unit, kcal, protein, carbs, fat)
select 'Whey protein concentrado', 'Suplementos', 30, 'g', 120, 24.0, 3.0, 1.5
where not exists (select 1 from public.foods where name = 'Whey protein concentrado');

alter table public.foods enable row level security;
drop policy if exists "foods_select_all" on public.foods;
create policy "foods_select_all" on public.foods for select using (true);

drop policy if exists "foods_all_nutri" on public.foods;
create policy "foods_all_nutri" on public.foods for all using (true); -- simplified for prototype

-- recreate plan_meal_foods using uuid for food_id
drop table if exists public.plan_meal_foods cascade;

create table public.plan_meal_foods (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references public.plan_meals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  food_id uuid references public.foods(id) on delete set null,
  food_name text not null,
  amount_g numeric not null default 100,
  calories numeric not null default 0,
  protein_g numeric not null default 0,
  carbs_g numeric not null default 0,
  fats_g numeric not null default 0,
  food_order int not null default 0,
  created_at timestamptz not null default now()
);

create index idx_plan_meal_foods_meal on public.plan_meal_foods (meal_id, food_order);
create index idx_plan_meal_foods_user on public.plan_meal_foods (user_id);

alter table public.plan_meal_foods enable row level security;

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
