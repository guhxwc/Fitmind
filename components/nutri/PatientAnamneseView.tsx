import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, Loader2, User, Target, Pill, Activity, Clock, Apple, Heart,
  History, Calendar as CalendarIcon, Scale, Briefcase, Wine, Droplet,
  AlertTriangle, FileText, Sun, Moon, Cookie, Stethoscope, Ruler,
  TrendingUp, Coffee, ShieldAlert,
} from 'lucide-react';
import { supabase } from '../../supabaseClient';

/* =========================================================
   LABEL MAPS
========================================================= */
const OBJECTIVE_LABELS: Record<string, string> = {
  emagrecimento: 'Emagrecimento',
  hipertrofia: 'Hipertrofia',
  recomposicao: 'Recomposição corporal',
  performance: 'Performance esportiva',
  saude: 'Saúde e qualidade de vida',
};
const DEADLINE_LABELS: Record<string, string> = {
  '3_months': '3 meses',
  '6_months': '6 meses',
  '1_year': '1 ano',
  no_deadline: 'Sem prazo definido',
};
const GLP1_STATUS_LABELS: Record<string, string> = {
  using: 'Em uso atualmente',
  used_before: 'Já usou (parou)',
  never: 'Nunca usou',
};
const GLP1_MED_LABELS: Record<string, string> = {
  ozempic: 'Ozempic (semaglutida)',
  mounjaro: 'Mounjaro (tirzepatida)',
  wegovy: 'Wegovy (semaglutida)',
  saxenda: 'Saxenda (liraglutida)',
  trulicity: 'Trulicity (dulaglutida)',
  outro: 'Outro',
};
const SUN_LABELS: Record<string, string> = {
  daily: 'Todos os dias',
  often: 'Várias vezes na semana',
  sometimes: 'Às vezes',
  rare: 'Raramente',
  never: 'Nunca',
};
const SLEEP_LABELS: Record<string, string> = {
  well: 'Dorme bem',
  sometimes_difficulty: 'Às vezes tem dificuldade',
  difficulty: 'Tem muita dificuldade',
};
const BOWEL_LABELS: Record<string, string> = {
  normal: 'Normal e regular',
  constipated: 'Constipação (intestino preso)',
  diarrhea: 'Diarreico (solto)',
  irregular: 'Irregular',
};
const ALCOHOL_LABELS: Record<string, string> = {
  none: 'Não bebe',
  social: 'Socialmente',
  weekly: 'Toda semana',
  daily: 'Diariamente',
};
const WATER_LABELS: Record<string, string> = {
  menos_1l: 'Menos de 1L',
  '1_2l': '1 a 2L',
  '2_3l': '2 a 3L',
  mais_3l: 'Mais de 3L',
};

/* =========================================================
   PATOLOGIAS — flags clínicas que merecem destaque pro nutri
========================================================= */
const ALERT_CONDITIONS = new Set([
  'Diabetes', 'Hipertensão', 'Esteatose hepática', 'Hipercolesterolemia',
  'Tireoide', 'SOP', 'Refluxo', 'Colesterol alto', 'Obesidade',
]);

const fmtDate = (iso?: string | null) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
};
const fmtMonth = (yyyymm?: string | null) => {
  if (!yyyymm) return '—';
  const [y, m] = yyyymm.split('-');
  if (!y || !m) return yyyymm;
  return new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
};
const calcBMI = (w?: number | null, h?: number | null) => {
  if (!w || !h) return null;
  const m = h / 100;
  return w / (m * m);
};
const bmiBadge = (bmi: number | null) => {
  if (bmi == null) return null;
  if (bmi < 18.5) return { label: 'Abaixo', tone: 'blue' };
  if (bmi < 25) return { label: 'Normal', tone: 'green' };
  if (bmi < 30) return { label: 'Sobrepeso', tone: 'amber' };
  if (bmi < 35) return { label: 'Obesidade I', tone: 'rose' };
  if (bmi < 40) return { label: 'Obesidade II', tone: 'rose' };
  return { label: 'Obesidade III', tone: 'rose' };
};

/* =========================================================
   UI ATOMS
========================================================= */
const Tag: React.FC<{ children: React.ReactNode; tone?: 'blue' | 'gray' | 'green' | 'amber' | 'rose' | 'purple' }> = ({ children, tone = 'gray' }) => {
  const tones = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
  };
  return (
    <span className={`inline-flex items-center text-[12px] font-semibold px-2.5 py-1 rounded-full border ${tones[tone as keyof typeof tones]}`}>
      {children}
    </span>
  );
};

const Card: React.FC<{
  icon: React.ComponentType<any>;
  title: string;
  iconBg?: string;
  iconColor?: string;
  highlight?: 'amber' | 'rose' | null;
  badge?: string;
  children?: React.ReactNode;
}> = ({ icon: Icon, title, iconBg = 'bg-blue-50', iconColor = 'text-blue-500', highlight, badge, children }) => {
  const borderCls =
    highlight === 'rose' ? 'border-rose-200 bg-rose-50/30' :
    highlight === 'amber' ? 'border-amber-200 bg-amber-50/30' :
    'border-gray-100 bg-white';
  return (
    <div className={`rounded-[20px] border ${borderCls} p-5 sm:p-6`}>
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
          <Icon className="w-5 h-5" strokeWidth={2.5} />
        </div>
        <h3 className="text-[16px] font-bold text-gray-900 flex-1">{title}</h3>
        {badge && (
          <span className={`text-[10px] font-extrabold uppercase tracking-wide px-2 py-1 rounded ${
            highlight === 'rose' ? 'text-rose-600 bg-rose-100' :
            highlight === 'amber' ? 'text-amber-600 bg-amber-100' :
            'text-gray-500 bg-gray-100'
          }`}>{badge}</span>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
};

const Field: React.FC<{ label: string; value?: any; mono?: boolean; full?: boolean }> = ({ label, value, mono, full }) => (
  <div className={full ? 'col-span-full' : ''}>
    <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
    <p className={`text-[14px] font-semibold text-gray-900 ${mono ? 'tabular-nums' : ''} leading-snug`}>
      {value !== undefined && value !== null && value !== '' ? value : <span className="text-gray-300 font-normal">—</span>}
    </p>
  </div>
);

const TextBlock: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">{label}</p>
      <p className="text-[13.5px] font-medium text-gray-700 leading-relaxed bg-gray-50/70 px-3.5 py-3 rounded-xl border border-gray-100 whitespace-pre-line">
        {value}
      </p>
    </div>
  );
};

/* =========================================================
   MAIN
========================================================= */
interface Props {
  patient: any;
  onBack: () => void;
}

export const PatientAnamneseView: React.FC<Props> = ({ patient, onBack }) => {
  const userId = patient?.user_id || patient?.id;
  const patientName = patient?.profiles?.name || 'Paciente';

  const [anamnese, setAnamnese] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const [anaRes, profRes] = await Promise.all([
          supabase.from('anamneses').select('*').eq('user_id', userId)
            .order('updated_at', { ascending: false }).limit(1).maybeSingle(),
          supabase.from('profiles')
            .select('name, age, gender, height, weight, target_weight, activity_level, goal, glp_status, whatsapp')
            .eq('id', userId).maybeSingle(),
        ]);
        if (!mounted) return;
        if (anaRes.error) throw anaRes.error;
        setAnamnese(anaRes.data || null);
        setProfile(profRes.data || null);
      } catch (err: any) {
        if (mounted) setError(err?.message || 'Erro ao carregar.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [userId]);

  const bmi = useMemo(
    () => calcBMI(anamnese?.current_weight ?? profile?.weight, anamnese?.height ?? profile?.height),
    [anamnese, profile]
  );
  const bmiInfo = bmiBadge(bmi);

  const isUsingGlp1 = anamnese?.glp1_status === 'using' || anamnese?.glp1_status === 'used_before';

  // Patologias críticas → destaque vermelho
  const conditions: string[] = useMemo(
    () => Array.isArray(anamnese?.health_conditions) ? anamnese.health_conditions : [],
    [anamnese]
  );
  const hasCriticalConditions = useMemo(
    () => conditions.some((c) => ALERT_CONDITIONS.has(c)) && !conditions.includes('Nenhuma'),
    [conditions]
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#F9FAFC] z-[110] flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!anamnese) {
    return (
      <div className="fixed inset-0 bg-[#F9FAFC] z-[110] overflow-y-auto">
        <main className="px-4 lg:px-10 py-8">
          <div className="max-w-[920px] mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 text-gray-600">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <p className="text-[12px] font-semibold text-gray-500">{patientName}</p>
                <h1 className="text-[24px] font-extrabold text-gray-900 tracking-tight">Anamnese</h1>
              </div>
            </div>
            <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 py-20 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-[15px] font-bold text-gray-700">Anamnese ainda não foi preenchida</p>
              <p className="text-[12px] text-gray-500 mt-1">O paciente precisa completar a anamnese pelo app.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Dados estruturados
  const previousDiets: string[] = Array.isArray(anamnese.food_restrictions) ? anamnese.food_restrictions : [];
  const allergies: string[] = Array.isArray(anamnese.allergies) ? anamnese.allergies : [];
  const physicalActivities: string[] = anamnese.physical_activities_list
    ? anamnese.physical_activities_list.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
  const alcoholTypes: string[] = anamnese.alcohol_types
    ? anamnese.alcohol_types.split(',').map((s: string) => s.trim()).filter(Boolean) : [];

  const weightDelta = (anamnese.current_weight && anamnese.target_weight)
    ? (anamnese.current_weight - anamnese.target_weight) : null;

  return (
    <div className="fixed inset-0 bg-[#F9FAFC] z-[110] overflow-y-auto font-sans">
      <main className="px-4 lg:px-10 py-8 pb-20">
        <div className="max-w-[1100px] mx-auto w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <p className="text-[12px] font-semibold text-gray-500">{patientName}</p>
                <h1 className="text-[24px] font-extrabold text-gray-900 tracking-tight">Anamnese</h1>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Atualizada em</p>
              <p className="text-[13px] font-semibold text-gray-700">{fmtDate(anamnese.updated_at || anamnese.submitted_at || anamnese.created_at)}</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-[13px] px-4 py-3 rounded-xl">{error}</div>
          )}

          {/* Critical Alerts banner — só aparece se tem patologia crítica ou GLP-1 */}
          {(hasCriticalConditions || isUsingGlp1) && (
            <div className="bg-amber-50 border border-amber-200 rounded-[20px] p-4 sm:p-5 mb-6 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[13.5px] font-bold text-amber-900">Atenção clínica</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {conditions.filter((c) => ALERT_CONDITIONS.has(c)).map((c, i) => (
                    <Tag key={i} tone="amber">{c}</Tag>
                  ))}
                  {isUsingGlp1 && <Tag tone="amber">GLP-1: {GLP1_STATUS_LABELS[anamnese.glp1_status]}</Tag>}
                </div>
              </div>
            </div>
          )}

          {/* HERO */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-[24px] p-6 mb-6 text-white shadow-[0_8px_24px_rgba(59,130,246,0.20)]">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <p className="text-[11px] font-bold uppercase tracking-widest text-blue-100 mb-1">Objetivo</p>
                <h2 className="text-[24px] font-extrabold tracking-tight leading-tight">
                  {OBJECTIVE_LABELS[anamnese.goal] || anamnese.goal || 'Não definido'}
                </h2>
                {anamnese.goal_deadline && (
                  <p className="text-[13px] font-medium text-blue-100 mt-1">Prazo: {DEADLINE_LABELS[anamnese.goal_deadline] || anamnese.goal_deadline}</p>
                )}
                {anamnese.occupation && (
                  <p className="text-[12px] font-medium text-blue-100 mt-3 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" /> {anamnese.occupation}
                  </p>
                )}
              </div>
              {bmi != null && bmiInfo && (
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 text-center min-w-[110px]">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-blue-100">IMC</p>
                  <p className="text-[22px] font-extrabold tabular-nums leading-none mt-1">{bmi.toFixed(1).replace('.', ',')}</p>
                  <span className="text-[10px] font-bold mt-1 inline-block">{bmiInfo.label}</span>
                </div>
              )}
            </div>

            <div className="mt-5 pt-5 border-t border-white/15 grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-blue-100">Peso atual</p>
                <p className="text-[16px] font-extrabold tabular-nums mt-0.5">{anamnese.current_weight ? `${anamnese.current_weight} kg` : '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-blue-100">Em jejum</p>
                <p className="text-[16px] font-extrabold tabular-nums mt-0.5">
                  {anamnese.fasting_weight_unknown ? <span className="text-[12px] font-medium text-blue-200">não soube</span>
                    : anamnese.fasting_weight ? `${anamnese.fasting_weight} kg` : '—'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-blue-100">Meta</p>
                <p className="text-[16px] font-extrabold tabular-nums mt-0.5">{anamnese.target_weight ? `${anamnese.target_weight} kg` : '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-blue-100">Diferença</p>
                <p className="text-[16px] font-extrabold tabular-nums mt-0.5">
                  {weightDelta != null ? `${weightDelta > 0 ? '-' : '+'}${Math.abs(weightDelta).toFixed(1).replace('.', ',')} kg` : '—'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-blue-100">Cintura</p>
                <p className="text-[16px] font-extrabold tabular-nums mt-0.5">
                  {anamnese.waist_unknown ? <span className="text-[12px] font-medium text-blue-200">não mediu</span>
                    : anamnese.waist_circumference ? `${anamnese.waist_circumference} cm` : '—'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* IDENTIFICAÇÃO */}
            <Card icon={User} title="Identificação" iconBg="bg-blue-50" iconColor="text-blue-500">
              <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                <Field label="Nome" value={profile?.name} full />
                <Field label="Idade" value={profile?.age ? `${profile.age} anos` : null} />
                <Field label="Sexo" value={profile?.gender ? (profile.gender.toLowerCase() === 'masculino' ? 'Masculino' : 'Feminino') : null} />
                <Field label="Ocupação" value={anamnese.occupation} />
                <Field label="WhatsApp" value={profile?.whatsapp} />
                <Field label="Altura" value={anamnese.height ? `${anamnese.height} cm` : null} />
              </div>
            </Card>

            {/* PATOLOGIAS */}
            <Card
              icon={Heart}
              title="Patologias"
              iconBg={hasCriticalConditions ? 'bg-rose-100' : 'bg-emerald-50'}
              iconColor={hasCriticalConditions ? 'text-rose-600' : 'text-emerald-500'}
              highlight={hasCriticalConditions ? 'rose' : null}
              badge={hasCriticalConditions ? 'Atenção' : undefined}
            >
              {conditions.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {conditions.map((c, i) => (
                    <Tag key={i} tone={c === 'Nenhuma' ? 'green' : ALERT_CONDITIONS.has(c) ? 'rose' : 'amber'}>{c}</Tag>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-gray-400 italic mb-4">Não informado</p>
              )}
              <TextBlock label="Medicamento controlado" value={anamnese.controlled_medications} />
              <div className="mt-3">
                <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wide mb-1">Exames recentes</p>
                <p className="text-[13.5px] font-semibold">
                  {anamnese.has_recent_exams === true ? <span className="text-emerald-600">Sim — anexou na consultoria</span>
                    : anamnese.has_recent_exams === false ? <span className="text-gray-500">Não fez recentes</span>
                    : <span className="text-gray-400 font-normal">—</span>}
                </p>
              </div>
            </Card>

            {/* GLP-1 */}
            <Card
              icon={Pill}
              title="Medicamento GLP-1"
              iconBg={isUsingGlp1 ? 'bg-amber-100' : 'bg-gray-100'}
              iconColor={isUsingGlp1 ? 'text-amber-600' : 'text-gray-500'}
              highlight={anamnese.glp1_status === 'using' ? 'amber' : null}
              badge={anamnese.glp1_status === 'using' ? 'Em uso' : undefined}
            >
              {anamnese.glp1_status ? (
                <>
                  <div className="mb-4">
                    <Tag tone={isUsingGlp1 ? 'amber' : 'gray'}>{GLP1_STATUS_LABELS[anamnese.glp1_status] || anamnese.glp1_status}</Tag>
                  </div>
                  {isUsingGlp1 && (
                    <div className="grid grid-cols-2 gap-y-4 gap-x-4 pt-1">
                      <Field label="Medicamento" value={GLP1_MED_LABELS[anamnese.glp1_medication] || anamnese.glp1_medication} full />
                      <Field label="Dose" value={anamnese.glp1_dose} />
                      <Field label="Início" value={fmtMonth(anamnese.glp1_start_date)} />
                    </div>
                  )}
                </>
              ) : (
                <p className="text-[13px] text-gray-400 italic">Não informado</p>
              )}
            </Card>

            {/* ATIVIDADE FÍSICA */}
            <Card icon={Activity} title="Atividade física" iconBg="bg-emerald-50" iconColor="text-emerald-500">
              <div className="mb-4">
                <Tag tone={anamnese.practices_physical_activity ? 'green' : 'gray'}>
                  {anamnese.practices_physical_activity === true ? 'Pratica' :
                   anamnese.practices_physical_activity === false ? 'Sedentário' : 'Não informado'}
                </Tag>
              </div>
              {physicalActivities.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Modalidades</p>
                  <div className="flex flex-wrap gap-1.5">
                    {physicalActivities.map((a, i) => <Tag key={i} tone="green">{a}</Tag>)}
                  </div>
                </div>
              )}
              <TextBlock label="Horários de treino" value={anamnese.physical_activity_times} />
            </Card>

            {/* SONO E SOL */}
            <Card icon={Moon} title="Sono e exposição ao sol" iconBg="bg-purple-50" iconColor="text-purple-500">
              <div className="grid grid-cols-2 gap-y-4 gap-x-4 mb-3">
                <Field label="Acorda" value={anamnese.wake_up_time} mono />
                <Field label="Dorme" value={anamnese.sleep_time} mono />
                <Field label="Qualidade do sono" value={SLEEP_LABELS[anamnese.sleeps_well] || anamnese.sleeps_well} full />
                <Field label="Exposição ao sol" value={SUN_LABELS[anamnese.sun_exposure_habit] || anamnese.sun_exposure_habit} full />
              </div>
            </Card>

            {/* ALIMENTAÇÃO */}
            <Card icon={Apple} title="Alimentação" iconBg="bg-rose-50" iconColor="text-rose-500">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Refeições/dia" value={anamnese.meal_count_per_day ? `${anamnese.meal_count_per_day} refeições` : null} />
                  <Field label="Hábito de doces" value={
                    anamnese.sweets_habit === true ? `Sim${anamnese.sweets_time ? ` — ${anamnese.sweets_time}` : ''}` :
                    anamnese.sweets_habit === false ? 'Não' : null
                  } />
                </div>
                <TextBlock label="Rotina alimentar" value={anamnese.food_routine_description} />
                <TextBlock label="Refeições típicas" value={anamnese.typical_meals} />
                <div>
                  <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Alergias / restrições</p>
                  {allergies.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {allergies.map((a, i) => <Tag key={i} tone="amber">{a}</Tag>)}
                    </div>
                  ) : (
                    <p className="text-[13px] text-gray-400 italic">Nenhuma</p>
                  )}
                </div>
              </div>
            </Card>

            {/* FUNÇÃO INTESTINAL */}
            <Card icon={Activity} title="Função intestinal" iconBg="bg-indigo-50" iconColor="text-indigo-500">
              <div className="space-y-3">
                <Field label="Como é normalmente" value={BOWEL_LABELS[anamnese.bowel_function] || anamnese.bowel_function} />
                <Field label="Vai todos os dias" value={
                  anamnese.daily_bowel_movement === true ? 'Sim, diariamente' :
                  anamnese.daily_bowel_movement === false ? 'Não' : null
                } />
              </div>
            </Card>

            {/* ÁLCOOL E HÁBITOS */}
            <Card icon={Wine} title="Álcool e hidratação" iconBg="bg-amber-50" iconColor="text-amber-500">
              <div className="space-y-4">
                <div>
                  <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Consumo</p>
                  <Tag tone={anamnese.alcohol_consumption === 'none' ? 'green' : anamnese.alcohol_consumption === 'daily' ? 'rose' : 'amber'}>
                    {ALCOHOL_LABELS[anamnese.alcohol_consumption] || 'Não informado'}
                  </Tag>
                </div>
                {alcoholTypes.length > 0 && (
                  <div>
                    <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Tipos</p>
                    <div className="flex flex-wrap gap-1.5">
                      {alcoholTypes.map((a, i) => <Tag key={i} tone="amber">{a}</Tag>)}
                    </div>
                  </div>
                )}
                <TextBlock label="Frequência detalhada" value={anamnese.alcohol_frequency_detail} />
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <Droplet className="w-4 h-4 text-blue-400" />
                  <span className="text-[13px] font-semibold text-gray-700">Água: {WATER_LABELS[anamnese.water_intake] || anamnese.water_intake || '—'}</span>
                </div>
              </div>
            </Card>

            {/* HISTÓRICO */}
            <Card icon={History} title="Histórico" iconBg="bg-purple-50" iconColor="text-purple-500">
              <div className="space-y-4">
                <div>
                  <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Dietas anteriores</p>
                  {previousDiets.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {previousDiets.map((d, i) => <Tag key={i} tone={d === 'Nunca fiz' ? 'gray' : 'purple'}>{d}</Tag>)}
                    </div>
                  ) : <p className="text-[13px] text-gray-400 italic">Não informado</p>}
                </div>
                <TextBlock label="Maior dificuldade pra emagrecer" value={anamnese.main_difficulties} />
              </div>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[11px] text-gray-400 font-medium">
              Anamnese enviada em {fmtDate(anamnese.submitted_at || anamnese.created_at)}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};