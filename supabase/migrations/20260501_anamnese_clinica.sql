-- =====================================================================
-- Anamnese clínica completa — adiciona campos solicitados pelo Allan
-- =====================================================================

alter table public.anamneses
  -- Identificação adicional
  add column if not exists occupation text,

  -- Biometria estendida
  add column if not exists fasting_weight numeric,
  add column if not exists fasting_weight_unknown boolean default false,
  add column if not exists waist_circumference numeric,
  add column if not exists waist_unknown boolean default false,

  -- Saúde
  add column if not exists has_recent_exams boolean,
  add column if not exists controlled_medications text,

  -- Atividade física detalhada
  add column if not exists practices_physical_activity boolean,
  add column if not exists physical_activities_list text,
  add column if not exists physical_activity_times text,

  -- Sono / Sol
  add column if not exists sun_exposure_habit text,
  add column if not exists sleeps_well text,

  -- Função intestinal
  add column if not exists bowel_function text,
  add column if not exists daily_bowel_movement boolean,

  -- Rotina alimentar
  add column if not exists food_routine_description text,
  add column if not exists typical_meals text,

  -- Hábitos
  add column if not exists sweets_habit boolean,
  add column if not exists sweets_time text,

  -- Álcool detalhado
  add column if not exists alcohol_types text,
  add column if not exists alcohol_frequency_detail text;
