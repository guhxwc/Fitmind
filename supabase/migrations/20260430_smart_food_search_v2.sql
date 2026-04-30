-- =====================================================================
-- Busca Inteligente v2: Popularidade, Sinônimos e Ranking Avançado
-- =====================================================================

-- 1) Adicionar novas colunas à tabela foods
alter table public.foods
  add column if not exists popularity_base int default 0,
  add column if not exists usage_count int default 0,
  add column if not exists search_terms text,
  add column if not exists group_name text;

-- 2) Extensões necessárias para busca semântica
create extension if not exists pg_trgm;

-- 3) Índices para performance
create index if not exists idx_foods_trgm_name on public.foods using gin (lower(name) gin_trgm_ops);
create index if not exists idx_foods_trgm_search_terms on public.foods using gin (lower(search_terms) gin_trgm_ops);
create index if not exists idx_foods_popularity on public.foods (popularity_base desc, usage_count desc);
create index if not exists idx_foods_group_name on public.foods (group_name);

-- 4) Trigger para incrementar usage_count ao registrar alimento em planos
create or replace function public.fn_increment_food_usage()
returns trigger as $$
begin
  update public.foods set usage_count = usage_count + 1 where id = new.food_id::uuid;
  return new;
exception when others then
  return new; -- Evita travar o insert se o food_id não bater
end;
$$ language plpgsql;

create or replace trigger trg_increment_food_usage
after insert on public.plan_meal_foods
for each row execute function public.fn_increment_food_usage();

-- 5) Função search_foods refinada com Scoring Formula
-- relevance_score = (text_score * 0.50) + (popularity_base * 0.35) + (min(usage_count * 10, 50) * 0.15)
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
      f.kcal, f.protein, f.carbs, f.fat, f.is_common, 
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
    f.kcal, f.protein, f.carbs, f.fat, f.is_common, 
    f.group_name, f.popularity_base, f.usage_count,
    (
      (case
        when lower(f.name) = v_term then 100
        when lower(f.name) like v_term || '%' then 90
        when lower(f.name) like '%' || v_term || '%' then 75
        else (similarity(lower(f.name), v_term) * 70)
      end) * 0.50 +
      (f.popularity_base * 0.35) +
      (least(f.usage_count * 10, 50) * 0.15)
    )::float as relevance_score
  from public.foods f
  where lower(f.name) % v_term or lower(f.name) like '%' || v_term || '%' or lower(f.search_terms) % v_term
  order by relevance_score desc, length(f.name) asc
  limit p_limit;
end;
$$;

-- 6) Populando alguns dados de popularidade base para os is_common
update public.foods set popularity_base = 100 where name in ('Arroz Branco', 'Frango peito sem pele', 'Ovo de galinha cozido', 'Feijão preto');
update public.foods set popularity_base = 90 where name in ('Banana prata', 'Batata inglesa', 'Pão francês', 'Arroz integral');
update public.foods set popularity_base = 80 where name in ('Brócolis', 'Aveia flocos', 'Iogurte desnatado', 'Maçã Argentina com casca');
update public.foods set popularity_base = 10 where category = 'Alimentos preparados';

grant execute on function public.search_foods(text, int) to anon, authenticated;
