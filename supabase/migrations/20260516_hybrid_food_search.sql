-- =====================================================================
-- HYBRID FOOD SEARCH — Open Food Facts + Local Cache
-- Migração: 20260516_hybrid_food_search.sql
-- =====================================================================

-- 1. Adicionar colunas de origem na tabela foods existente
-- (idempotente — usa IF NOT EXISTS)
ALTER TABLE public.foods
  ADD COLUMN IF NOT EXISTS source          text    NOT NULL DEFAULT 'local',
  ADD COLUMN IF NOT EXISTS off_id          text    NULL,        -- barcode / id no Open Food Facts
  ADD COLUMN IF NOT EXISTS off_data        jsonb   NULL,        -- payload bruto OFF para referência
  ADD COLUMN IF NOT EXISTS calcium         numeric NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS search_terms    text    NULL,
  ADD COLUMN IF NOT EXISTS usage_count     int     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS popularity_base int     NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS is_common       boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS group_name      text    NULL,
  ADD COLUMN IF NOT EXISTS last_used_at    timestamptz NULL;

-- source: 'local' | 'off_cache' | 'manual'
-- Constraint para garantir valores válidos
ALTER TABLE public.foods
  DROP CONSTRAINT IF EXISTS foods_source_check;
ALTER TABLE public.foods
  ADD CONSTRAINT foods_source_check
    CHECK (source IN ('local', 'off_cache', 'manual'));

-- Índice único para evitar duplicatas vindas da OFF
CREATE UNIQUE INDEX IF NOT EXISTS foods_off_id_unique
  ON public.foods (off_id)
  WHERE off_id IS NOT NULL;

-- Índice para buscas de cache
CREATE INDEX IF NOT EXISTS foods_source_idx ON public.foods (source);
CREATE INDEX IF NOT EXISTS foods_last_used_idx ON public.foods (last_used_at DESC NULLS LAST);

-- =====================================================================
-- 2. Tabela de log de buscas (para analytics e popularidade futura)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.food_search_log (
  id          bigserial PRIMARY KEY,
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  query       text NOT NULL,
  source      text NOT NULL DEFAULT 'local',  -- 'local' | 'off'
  result_id   uuid REFERENCES public.foods(id) ON DELETE SET NULL,
  result_name text,
  context     text,   -- 'meal_log' | 'diet_plan' | 'patient_meal'
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.food_search_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "food_search_log_insert" ON public.food_search_log
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "food_search_log_select_own" ON public.food_search_log
  FOR SELECT USING (auth.uid() = user_id);

-- =====================================================================
-- 3. Função RPC: incrementar uso de um alimento
-- =====================================================================
CREATE OR REPLACE FUNCTION public.increment_food_usage(p_food_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.foods
  SET
    usage_count   = usage_count + 1,
    last_used_at  = now()
  WHERE id = p_food_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_food_usage(uuid) TO anon, authenticated;

-- =====================================================================
-- 4. Função RPC: upsert de alimento vindo da Open Food Facts (cache)
-- =====================================================================
CREATE OR REPLACE FUNCTION public.cache_off_food(
  p_off_id       text,
  p_name         text,
  p_category     text,
  p_kcal         numeric,
  p_protein      numeric,
  p_carbs        numeric,
  p_fat          numeric,
  p_fiber        numeric,
  p_sodium       numeric,
  p_calcium      numeric,
  p_portion_size numeric,
  p_portion_unit text,
  p_search_terms text,
  p_off_data     jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id uuid;
BEGIN
  -- Tenta inserir; se já existe (off_id único), faz update e retorna o id
  INSERT INTO public.foods (
    off_id, name, category, source,
    kcal, protein, carbs, fat, fiber, sodium, calcium,
    portion_size, portion_unit,
    search_terms, off_data,
    is_common, usage_count, popularity_base
  )
  VALUES (
    p_off_id, p_name, p_category, 'off_cache',
    p_kcal, p_protein, p_carbs, p_fat, p_fiber, p_sodium, p_calcium,
    p_portion_size, p_portion_unit,
    p_search_terms, p_off_data,
    false, 1, 30
  )
  ON CONFLICT (off_id) DO UPDATE
    SET
      usage_count  = public.foods.usage_count + 1,
      last_used_at = now(),
      -- Atualiza dados nutricionais se vieram novos dados (OFF pode corrigir)
      kcal         = EXCLUDED.kcal,
      protein      = EXCLUDED.protein,
      carbs        = EXCLUDED.carbs,
      fat          = EXCLUDED.fat,
      fiber        = EXCLUDED.fiber,
      sodium       = EXCLUDED.sodium,
      off_data     = EXCLUDED.off_data
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cache_off_food TO anon, authenticated;

-- =====================================================================
-- 5. Função RPC de busca HÍBRIDA (local prioritário → fallback OFF)
--    Esta função busca SOMENTE no banco local (incluindo cache OFF).
--    O fallback para a API da OFF é feito pelo frontend/edge function.
-- =====================================================================
DROP FUNCTION IF EXISTS public.search_foods(text, int);
CREATE OR REPLACE FUNCTION public.search_foods(
  p_query text,
  p_limit int DEFAULT 20
)
RETURNS TABLE (
  id              uuid,
  name            text,
  category        text,
  portion_size    numeric,
  portion_unit    text,
  kcal            numeric,
  protein         numeric,
  carbs           numeric,
  fat             numeric,
  fiber           numeric,
  sodium          numeric,
  calcium         numeric,
  is_common       boolean,
  group_name      text,
  popularity_base int,
  usage_count     int,
  source          text,
  off_id          text,
  relevance_score float
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_term text;
BEGIN
  v_term := lower(trim(coalesce(p_query, '')));

  -- Sem termo: retorna os mais populares
  IF length(v_term) < 2 THEN
    RETURN QUERY
    SELECT
      f.id, f.name, f.category, f.portion_size, f.portion_unit,
      f.kcal, f.protein, f.carbs, f.fat,
      COALESCE(f.fiber, 0),
      COALESCE(f.sodium, 0),
      COALESCE(f.calcium, 0),
      f.is_common, f.group_name, f.popularity_base, f.usage_count,
      f.source, f.off_id,
      (f.popularity_base * 0.4 + LEAST(f.usage_count * 10, 60) * 0.2)::float
    FROM public.foods f
    WHERE f.is_common = true
    ORDER BY 19 DESC, f.name
    LIMIT p_limit;
    RETURN;
  END IF;

  -- Busca com score de relevância
  RETURN QUERY
  SELECT
    f.id, f.name, f.category, f.portion_size, f.portion_unit,
    f.kcal, f.protein, f.carbs, f.fat,
    COALESCE(f.fiber, 0),
    COALESCE(f.sodium, 0),
    COALESCE(f.calcium, 0),
    f.is_common, f.group_name, f.popularity_base, f.usage_count,
    f.source, f.off_id,
    (
      -- Score de texto (peso maior)
      CASE
        WHEN lower(f.name) = v_term                    THEN 1200
        WHEN lower(f.name) LIKE v_term || '%'          THEN 300
        WHEN lower(f.name) LIKE '% ' || v_term || ' %' THEN 180
        WHEN lower(f.name) LIKE '%' || v_term || '%'   THEN 100
        ELSE (similarity(lower(f.name), v_term) * 60)
      END
      -- Bônus de popularidade
      + (f.popularity_base * 1.5)
      + LEAST(f.usage_count * 8, 80)
      -- Penalidade leve para itens de cache OFF (preferir curados locais)
      + CASE WHEN f.source = 'local' THEN 20 ELSE 0 END
    )::float AS relevance_score
  FROM public.foods f
  WHERE
    lower(f.name) % v_term
    OR lower(f.name) LIKE '%' || v_term || '%'
    OR lower(COALESCE(f.search_terms, '')) LIKE '%' || v_term || '%'
  ORDER BY relevance_score DESC, length(f.name) ASC
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_foods(text, int) TO anon, authenticated;

-- =====================================================================
-- 6. View: alimentos mais usados recentemente (útil para sugestões)
-- =====================================================================
CREATE OR REPLACE VIEW public.foods_trending AS
SELECT
  f.id, f.name, f.category, f.kcal, f.protein, f.carbs, f.fat,
  f.portion_size, f.portion_unit, f.source, f.usage_count, f.last_used_at
FROM public.foods f
WHERE f.last_used_at IS NOT NULL
ORDER BY f.last_used_at DESC, f.usage_count DESC
LIMIT 100;

GRANT SELECT ON public.foods_trending TO authenticated;
