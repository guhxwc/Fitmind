-- =====================================================================
-- Migration: patient_materials, patient_exams + storage buckets
-- =====================================================================

-- 1) patient_materials
create table if not exists public.patient_materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nutritionist_id uuid references public.nutritionists(id) on delete set null,
  title text not null,
  description text,
  type text not null default 'pdf' check (type in ('pdf','image','video','link','doc','other')),
  file_path text,
  file_size bigint,
  file_mime text,
  external_url text,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_patient_materials_user on public.patient_materials (user_id, created_at desc);
create index if not exists idx_patient_materials_nutri on public.patient_materials (nutritionist_id, created_at desc);
alter table public.patient_materials enable row level security;

drop policy if exists "materials_select_own" on public.patient_materials;
create policy "materials_select_own" on public.patient_materials for select using (auth.uid() = user_id);

drop policy if exists "materials_mark_read_own" on public.patient_materials;
create policy "materials_mark_read_own" on public.patient_materials for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "materials_all_nutri" on public.patient_materials;
create policy "materials_all_nutri" on public.patient_materials for all using (
  exists (select 1 from public.nutritionists n where n.user_id = auth.uid())
) with check (
  exists (select 1 from public.nutritionists n where n.user_id = auth.uid())
);

-- 2) patient_exams
create table if not exists public.patient_exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nutritionist_id uuid references public.nutritionists(id) on delete set null,
  title text not null,
  exam_type text not null default 'blood' check (exam_type in ('blood','hormone','imaging','urine','biopsy','other')),
  exam_date date,
  observations text,
  file_path text,
  file_size bigint,
  file_mime text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_patient_exams_user on public.patient_exams (user_id, exam_date desc nulls last, created_at desc);
create index if not exists idx_patient_exams_nutri on public.patient_exams (nutritionist_id, created_at desc);
alter table public.patient_exams enable row level security;

drop policy if exists "exams_select_own" on public.patient_exams;
create policy "exams_select_own" on public.patient_exams for select using (auth.uid() = user_id);

drop policy if exists "exams_all_nutri" on public.patient_exams;
create policy "exams_all_nutri" on public.patient_exams for all using (
  exists (select 1 from public.nutritionists n where n.user_id = auth.uid())
) with check (
  exists (select 1 from public.nutritionists n where n.user_id = auth.uid())
);

-- 3) Trigger updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists trg_materials_updated_at on public.patient_materials;
create trigger trg_materials_updated_at before update on public.patient_materials
  for each row execute function public.set_updated_at();
drop trigger if exists trg_exams_updated_at on public.patient_exams;
create trigger trg_exams_updated_at before update on public.patient_exams
  for each row execute function public.set_updated_at();

-- 4) Realtime
do $$
begin
  begin alter publication supabase_realtime add table public.patient_materials;
  exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.patient_exams;
  exception when duplicate_object then null; end;
end $$;

-- 5) Storage buckets (privados, 50MB)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('patient-materials', 'patient-materials', false, 52428800, null),
  ('patient-exams',     'patient-exams',     false, 52428800, null)
on conflict (id) do nothing;

-- 6) Storage policies (path = <user_id>/<arquivo>)
drop policy if exists "materials_storage_select_own" on storage.objects;
create policy "materials_storage_select_own" on storage.objects for select using (
  bucket_id = 'patient-materials' and auth.uid()::text = (storage.foldername(name))[1]
);
drop policy if exists "materials_storage_all_nutri" on storage.objects;
create policy "materials_storage_all_nutri" on storage.objects for all using (
  bucket_id = 'patient-materials'
  and exists (select 1 from public.nutritionists n where n.user_id = auth.uid())
) with check (
  bucket_id = 'patient-materials'
  and exists (select 1 from public.nutritionists n where n.user_id = auth.uid())
);
drop policy if exists "exams_storage_select_own" on storage.objects;
create policy "exams_storage_select_own" on storage.objects for select using (
  bucket_id = 'patient-exams' and auth.uid()::text = (storage.foldername(name))[1]
);
drop policy if exists "exams_storage_all_nutri" on storage.objects;
create policy "exams_storage_all_nutri" on storage.objects for all using (
  bucket_id = 'patient-exams'
  and exists (select 1 from public.nutritionists n where n.user_id = auth.uid())
) with check (
  bucket_id = 'patient-exams'
  and exists (select 1 from public.nutritionists n where n.user_id = auth.uid())
);
