-- Adicionar title em patient_plans (pois name já é o nome do paciente)
alter table public.patient_plans add column if not exists title text default 'Plano Alimentar';

-- Múltiplas dietas (variantes) por plano
create table if not exists public.plan_diet_variants (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.patient_plans(id) on delete cascade,
  name text not null default 'Plano base',
  days int[] not null default '{0,1,2,3,4,5,6}',
  created_at timestamptz not null default now()
);

create index if not exists idx_plan_diet_variants_plan on public.plan_diet_variants (plan_id);

alter table public.plan_diet_variants enable row level security;

drop policy if exists "variants_all_nutri" on public.plan_diet_variants;
create policy "variants_all_nutri" on public.plan_diet_variants
  for all using (
    exists (
      select 1 from public.patient_plans p
      join public.consultations c on c.user_id = p.user_id
      join public.nutritionists n on n.id = c.nutritionist_id
      where p.id = public.plan_diet_variants.plan_id
        and n.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.patient_plans p
      join public.consultations c on c.user_id = p.user_id
      join public.nutritionists n on n.id = c.nutritionist_id
      where p.id = public.plan_diet_variants.plan_id
        and n.user_id = auth.uid()
    )
  );

drop policy if exists "variants_select_own_sent" on public.plan_diet_variants;
create policy "variants_select_own_sent" on public.plan_diet_variants
  for select using (
    exists (
      select 1 from public.patient_plans p
      where p.id = public.plan_diet_variants.plan_id
        and p.user_id = auth.uid()
        and p.status = 'sent'
    )
  );

-- Vincular as refeições às variantes
alter table public.plan_meals add column if not exists variant_id uuid references public.plan_diet_variants(id) on delete cascade;

-- Realtime
do $$
begin
  begin
    alter publication supabase_realtime add table public.plan_diet_variants;
  exception when duplicate_object then null;
  end;
end $$;
