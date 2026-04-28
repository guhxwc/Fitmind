-- =====================================================================
-- Adiciona whatsapp em profiles + permite UPDATE pelo nutri vinculado
-- =====================================================================

alter table public.profiles
  add column if not exists whatsapp text;

-- Policy: nutri pode UPDATE em profiles (pra editar dados do paciente)
do $$
begin
  if not exists (
    select 1 from pg_policy p join pg_class c on c.oid = p.polrelid
    where c.relname = 'profiles' and p.polname = 'profiles_update_nutri'
  ) then
    create policy "profiles_update_nutri" on public.profiles
      for update using (
        exists (select 1 from public.nutritionists n where n.user_id = auth.uid())
      ) with check (
        exists (select 1 from public.nutritionists n where n.user_id = auth.uid())
      );
  end if;
end $$;

-- Policy: nutri pode UPDATE total em consultations
do $$
begin
  if not exists (
    select 1 from pg_policy p join pg_class c on c.oid = p.polrelid
    where c.relname = 'consultations' and p.polname = 'consultations_update_nutri_full'
  ) then
    create policy "consultations_update_nutri_full" on public.consultations
      for update using (
        exists (select 1 from public.nutritionists n where n.user_id = auth.uid())
      ) with check (
        exists (select 1 from public.nutritionists n where n.user_id = auth.uid())
      );
  end if;
end $$;
