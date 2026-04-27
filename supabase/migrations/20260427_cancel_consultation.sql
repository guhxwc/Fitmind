-- Adiciona colunas para rastrear cancelamento da consultoria
alter table public.consultations
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancellation_reason text;

create index if not exists idx_consultations_user_status
  on public.consultations (user_id, status);
