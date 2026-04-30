-- =====================================================================
-- Busca Inteligente v3: Retornar fiber e sodium
-- =====================================================================

drop function if exists public.search_foods(text, int);

create or replace function public.search_foods(
  p_query text,
  p_limit int default 20
)
returns table (
  id uuid,
  name text,
  category text,
  portion_size numeric,
  portion_unit text,
  kcal numeric,
  protein numeric,
  carbs numeric,
  fat numeric,
  fiber numeric,
  sodium numeric,
  is_common boolean,
  group_name text,
  popularity_base int,
  usage_count int,
  relevance_score float
)
language plpgsql
stable
as $$
declare
  v_term text;
begin
  v_term := lower(trim(coalesce(p_query, '')));

  if length(v_term) < 2 then
    return query
    select 
      f.id, f.name, f.category, f.portion_size, f.portion_unit, 
      f.kcal, f.protein, f.carbs, f.fat, 
      coalesce(f.fiber, 0) as fiber, coalesce(f.sodium, 0) as sodium, 
      f.is_common, 
      f.group_name, f.popularity_base, f.usage_count,
      (f.popularity_base * 0.35 + least(f.usage_count * 10, 50) * 0.15)::float as relevance_score
    from public.foods f
    where f.is_common = true
    order by relevance_score desc, f.name
    limit p_limit;
    return;
  end if;

  return query
  select 
    f.id, f.name, f.category, f.portion_size, f.portion_unit, 
    f.kcal, f.protein, f.carbs, f.fat, 
    coalesce(f.fiber, 0) as fiber, coalesce(f.sodium, 0) as sodium, 
    f.is_common, 
    f.group_name, f.popularity_base, f.usage_count,
    (
      (case
        when lower(f.name) = v_term then 1000  -- Match exato ganha de tudo
        when lower(f.name) like v_term || '%' then 200 -- Começa com
        when lower(f.name) like '%' || v_term || '%' then 100 -- Contém
        else (similarity(lower(f.name), v_term) * 50) -- Similaridade
      end) +
      (f.popularity_base * 2) + -- Popularidade agora é um bônus menor comparado ao texto
      (least(f.usage_count * 5, 50))
    )::float as relevance_score
  from public.foods f
  where lower(f.name) % v_term or lower(f.name) like '%' || v_term || '%' or lower(coalesce(f.search_terms,'')) % v_term
  order by relevance_score desc, length(f.name) asc
  limit p_limit;
end;
$$;

grant execute on function public.search_foods(text, int) to anon, authenticated;
