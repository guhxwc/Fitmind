import { supabase } from '../supabaseClient';

export type MaterialType = 'pdf' | 'image' | 'video' | 'link' | 'doc' | 'other';
export type ExamType = 'blood' | 'hormone' | 'imaging' | 'urine' | 'biopsy' | 'other';

export interface PatientMaterial {
  id: string;
  user_id: string;
  nutritionist_id: string | null;
  title: string;
  description: string | null;
  type: MaterialType;
  file_path: string | null;
  file_size: number | null;
  file_mime: string | null;
  external_url: string | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PatientExam {
  id: string;
  user_id: string;
  nutritionist_id: string | null;
  title: string;
  exam_type: ExamType;
  exam_date: string | null;
  observations: string | null;
  file_path: string | null;
  file_size: number | null;
  file_mime: string | null;
  created_at: string;
  updated_at: string;
}

const MATERIALS_BUCKET = 'patient-materials';
const EXAMS_BUCKET = 'patient-exams';

/* ---------- Detecção de tipo a partir do MIME ---------- */
export function detectMaterialType(mime: string | null | undefined): MaterialType {
  if (!mime) return 'other';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime === 'application/pdf') return 'pdf';
  if (mime.includes('msword') || mime.includes('wordprocessingml') || mime.includes('officedocument')) return 'doc';
  return 'other';
}

/* ---------- Upload / Signed URL helpers ---------- */
function safeName(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 80);
}

async function uploadFile(bucket: string, userId: string, file: File): Promise<{ path: string; size: number; mime: string }> {
  const ts = Date.now();
  const path = `${userId}/${ts}_${safeName(file.name)}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  });
  if (error) throw error;
  return { path, size: file.size, mime: file.type || 'application/octet-stream' };
}

async function getSignedUrl(bucket: string, path: string, expiresInSec = 60 * 60): Promise<string> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSec);
  if (error) throw error;
  return data.signedUrl;
}

async function deleteFile(bucket: string, path: string): Promise<void> {
  await supabase.storage.from(bucket).remove([path]);
}

/* =========================================================
   MATERIALS API
========================================================= */
export const materialsService = {
  async listForPatient(userId: string): Promise<PatientMaterial[]> {
    const { data, error } = await supabase
      .from('patient_materials')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as PatientMaterial[];
  },

  async listAllByNutri(nutritionistId: string): Promise<(PatientMaterial & { patient_name?: string })[]> {
    const { data, error } = await supabase
      .from('patient_materials')
      .select('*, profiles:user_id(name)')
      .eq('nutritionist_id', nutritionistId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return ((data || []) as any[]).map((r) => ({ ...r, patient_name: r.profiles?.name }));
  },

  /** Upload arquivo + insert registro. type='link' usa external_url ao invés de file. */
  async create(input: {
    userId: string;
    nutritionistId: string | null;
    title: string;
    description?: string;
    type: MaterialType;
    file?: File | null;
    external_url?: string | null;
  }): Promise<PatientMaterial> {
    let file_path: string | null = null;
    let file_size: number | null = null;
    let file_mime: string | null = null;

    if (input.type !== 'link' && input.file) {
      const up = await uploadFile(MATERIALS_BUCKET, input.userId, input.file);
      file_path = up.path;
      file_size = up.size;
      file_mime = up.mime;
    }

    const { data, error } = await supabase
      .from('patient_materials')
      .insert({
        user_id: input.userId,
        nutritionist_id: input.nutritionistId,
        title: input.title,
        description: input.description || null,
        type: input.type,
        file_path,
        file_size,
        file_mime,
        external_url: input.type === 'link' ? input.external_url || null : null,
      })
      .select('*')
      .single();
    if (error) throw error;
    return data as PatientMaterial;
  },

  async remove(material: PatientMaterial): Promise<void> {
    if (material.file_path) {
      await deleteFile(MATERIALS_BUCKET, material.file_path);
    }
    const { error } = await supabase.from('patient_materials').delete().eq('id', material.id);
    if (error) throw error;
  },

  async getOpenUrl(material: PatientMaterial): Promise<string> {
    if (material.type === 'link' && material.external_url) return material.external_url;
    if (!material.file_path) throw new Error('Material sem arquivo nem link.');
    return getSignedUrl(MATERIALS_BUCKET, material.file_path);
  },

  async markAsRead(materialId: string): Promise<void> {
    await supabase
      .from('patient_materials')
      .update({ read_at: new Date().toISOString() })
      .eq('id', materialId);
  },
};

/* =========================================================
   EXAMS API
========================================================= */
export const examsService = {
  async listForPatient(userId: string): Promise<PatientExam[]> {
    const { data, error } = await supabase
      .from('patient_exams')
      .select('*')
      .eq('user_id', userId)
      .order('exam_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as PatientExam[];
  },

  async create(input: {
    userId: string;
    nutritionistId: string | null;
    title: string;
    exam_type: ExamType;
    exam_date?: string | null;
    observations?: string | null;
    file?: File | null;
  }): Promise<PatientExam> {
    let file_path: string | null = null;
    let file_size: number | null = null;
    let file_mime: string | null = null;

    if (input.file) {
      const up = await uploadFile(EXAMS_BUCKET, input.userId, input.file);
      file_path = up.path;
      file_size = up.size;
      file_mime = up.mime;
    }

    const { data, error } = await supabase
      .from('patient_exams')
      .insert({
        user_id: input.userId,
        nutritionist_id: input.nutritionistId,
        title: input.title,
        exam_type: input.exam_type,
        exam_date: input.exam_date || null,
        observations: input.observations || null,
        file_path,
        file_size,
        file_mime,
      })
      .select('*')
      .single();
    if (error) throw error;
    return data as PatientExam;
  },

  async remove(exam: PatientExam): Promise<void> {
    if (exam.file_path) {
      await deleteFile(EXAMS_BUCKET, exam.file_path);
    }
    const { error } = await supabase.from('patient_exams').delete().eq('id', exam.id);
    if (error) throw error;
  },

  async getOpenUrl(exam: PatientExam): Promise<string> {
    if (!exam.file_path) throw new Error('Exame sem arquivo.');
    return getSignedUrl(EXAMS_BUCKET, exam.file_path);
  },
};

/* =========================================================
   FORMAT HELPERS
========================================================= */
export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const MATERIAL_TYPE_META: Record<MaterialType, { label: string; color: string; bg: string }> = {
  pdf:   { label: 'PDF',     color: 'text-rose-600',    bg: 'bg-rose-50' },
  image: { label: 'Imagem',  color: 'text-emerald-600', bg: 'bg-emerald-50' },
  video: { label: 'Vídeo',   color: 'text-purple-600',  bg: 'bg-purple-50' },
  link:  { label: 'Link',    color: 'text-blue-600',    bg: 'bg-blue-50' },
  doc:   { label: 'Doc',     color: 'text-amber-600',   bg: 'bg-amber-50' },
  other: { label: 'Outro',   color: 'text-gray-600',    bg: 'bg-gray-100' },
};

export const EXAM_TYPE_META: Record<ExamType, { label: string; color: string; bg: string }> = {
  blood:    { label: 'Sangue',      color: 'text-rose-600',    bg: 'bg-rose-50' },
  hormone:  { label: 'Hormônios',   color: 'text-purple-600',  bg: 'bg-purple-50' },
  imaging:  { label: 'Imagem',      color: 'text-blue-600',    bg: 'bg-blue-50' },
  urine:    { label: 'Urina',       color: 'text-amber-600',   bg: 'bg-amber-50' },
  biopsy:   { label: 'Biópsia',     color: 'text-emerald-600', bg: 'bg-emerald-50' },
  other:    { label: 'Outro',       color: 'text-gray-600',    bg: 'bg-gray-100' },
};
