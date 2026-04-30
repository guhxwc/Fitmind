-- =====================================================================
-- Busca inteligente de alimentos com ranking por relevância
-- =====================================================================

-- 1) Coluna is_common pra marcar alimentos básicos
alter table public.foods
  add column if not exists is_common boolean not null default false;

create index if not exists idx_foods_is_common on public.foods (is_common) where is_common = true;
create index if not exists idx_foods_name_lower on public.foods (lower(name));

-- 2) Marca alimentos básicos do dia a dia
update public.foods set is_common = true where name in (
  'Arroz Branco', 'Arroz branco cozido', 'Arroz integral',
  'Aveia flocos', 'Macarrão trigo', 'Macarrão trigo com ovos',
  'Pão francês', 'Pão trigo francês', 'Pão trigo forma integral',
  'Frango peito sem pele', 'Frango peito com pele',
  'Carne bovina patinho sem gordura', 'Carne bovina contra-filé sem gordura',
  'Carne bovina miolo de alcatra sem gordura',
  'Atum fresco', 'Salmão filé com pele fresco', 'Salmão sem pele fresco',
  'Ovo de galinha clara', 'Ovo de galinha gema',
  'Iogurte', 'Iogurte desnatado',
  'Banana prata', 'Banana nanica', 'Maçã Argentina com casca', 'Maçã Fuji com casca',
  'Laranja pêra', 'Mamão Papaia', 'Manga Tommy Atkins', 'Morango',
  'Tomate salada', 'Alface crespa', 'Alface lisa', 'Cenoura',
  'Brócolis', 'Couve manteiga', 'Batata inglesa', 'Batata doce',
  'Feijão preto', 'Feijão carioca', 'Lentilha', 'Grão-de-bico',
  'Mandioca', 'Tapioca com manteiga',
  'Café infusão', 'Azeite de oliva extra virgem'
);

-- 3) Função search_foods com ranking
create or replace function public.search_foods(
  p_query text,
  p_limit int default 20
)
returns setof public.foods
language plpgsql
stable
as $$
declare
  v_term text;
  v_pattern_word text;
begin
  v_term := lower(trim(coalesce(p_query, '')));
  if length(v_term) < 1 then
    return query select * from public.foods order by is_common desc, name limit p_limit;
    return;
  end if;

  v_pattern_word := '(^|\s)' || regexp_replace(v_term, '([.*+?^${}()|\[\]\\])', '\\\1', 'g') || '($|\s|,)';

  return query
  select f.*
  from public.foods f,
  lateral (
    select
      case
        when lower(f.name) = v_term then 1000           -- match exato
        when lower(f.name) like v_term || '%' then 500  -- começa com
        when lower(f.name) ~ v_pattern_word then 200    -- palavra inteira
        when lower(f.name) like '%' || v_term || '%' then 50  -- substring
        else 0
      end
      + case when f.is_common then 300 else 0 end
      - case when f.category = 'Alimentos preparados' then 80 else 0 end
      - (length(f.name) / 10)
      as score
  ) s
  where s.score > 0
  order by s.score desc, length(f.name) asc, f.name asc
  limit p_limit;
end;
$$;

grant execute on function public.search_foods(text, int) to anon, authenticated;
