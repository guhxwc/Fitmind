-- =====================================================================
-- RPC: get_user_email — retorna email do auth.users para um user_id
-- Usado pelo nutri pra pré-popular o email do paciente nas configs
-- (porque profiles.email vem null pra muitos pacientes — o email real
--  está em auth.users e não é acessível direto via PostgREST)
-- =====================================================================

create or replace function public.get_user_email(p_user_id uuid)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_email text;
begin
  -- Só nutricionistas podem chamar (evita expor emails arbitrariamente)
  if not exists (select 1 from public.nutritionists n where n.user_id = auth.uid()) then
    return null;
  end if;

  select email into v_email from auth.users where id = p_user_id;
  return v_email;
end;
$$;

-- Permite uso pelos clientes autenticados (a função já checa internamente se é nutri)
grant execute on function public.get_user_email(uuid) to authenticated;
