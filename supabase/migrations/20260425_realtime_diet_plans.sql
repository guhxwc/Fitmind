-- =====================================================================
-- Habilita realtime em diet_plans (já estava com RLS)
-- =====================================================================
do $$
begin
  begin
    alter publication supabase_realtime add table public.diet_plans;
  exception when duplicate_object then null;
  end;
end $$;
