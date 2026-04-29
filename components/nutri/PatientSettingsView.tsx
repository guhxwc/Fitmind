import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft, User, Mail, Phone, MessageCircle, Calendar as CalendarIcon,
  Ruler, Scale, Target, Activity, Save, Loader2, Trash2, AlertTriangle,
  CreditCard, Clock, Edit3, Check, X, Pill, ChevronRight,
} from 'lucide-react';
import { supabase } from '../../supabaseClient';

/* =========================================================
   TYPES
========================================================= */
interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  whatsapp: string | null;
  gender: string | null;
  age: number | null;
  birth_date: string | null;
  height: number | null;
  weight: number | null;
  start_weight: number | null;
  start_weight_date: string | null;
  target_weight: number | null;
  activity_level: string | null;
  target_calories: number | null;
  target_protein: number | null;
  target_water: number | null;
  goal: string | null;
  glp_status: string | null;
  pace: number | null;
  created_at: string | null;
  updated_at: string | null;
}

interface Consultation {
  id: string;
  user_id: string;
  nutritionist_id: string | null;
  status: string;
  started_at: string | null;
  next_review_at: string | null;
  plan_type: string | null;
  notes: string | null;
  cancelled_at: string | null;
  created_at: string;
}

/* =========================================================
   HELPERS
========================================================= */
const fmtDate = (iso?: string | null) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
};

const fmtShort = (iso?: string | null) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const dateInputValue = (iso?: string | null) => {
  if (!iso) return '';
  return new Date(iso).toISOString().split('T')[0];
};

const calcBMI = (w?: number | null, h?: number | null) => {
  if (!w || !h) return null;
  const m = h / 100;
  return w / (m * m);
};

const bmiLabel = (bmi: number | null) => {
  if (bmi == null) return null;
  if (bmi < 18.5) return { txt: 'Abaixo', cls: 'text-blue-600 bg-blue-50' };
  if (bmi < 25) return { txt: 'Normal', cls: 'text-emerald-600 bg-emerald-50' };
  if (bmi < 30) return { txt: 'Sobrepeso', cls: 'text-amber-600 bg-amber-50' };
  return { txt: 'Obesidade', cls: 'text-rose-600 bg-rose-50' };
};

const fmtPhone = (raw: string) => {
  // Mantém só dígitos
  const digits = raw.replace(/\D/g, '').slice(0, 13);
  if (!digits) return '';
  // Formato: +55 (XX) XXXXX-XXXX
  if (digits.length <= 2) return `+${digits}`;
  if (digits.length <= 4) return `+${digits.slice(0, 2)} (${digits.slice(2)}`;
  if (digits.length <= 9) return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4)}`;
  return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
};

const ACTIVITY_LEVELS = ['Sedentário', 'Levemente ativo', 'Moderadamente ativo', 'Ativo', 'Muito ativo'];

/* =========================================================
   UI ATOMS
========================================================= */
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-[20px] border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] ${className}`}>
    {children}
  </div>
);

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string; iconBg?: string; iconColor?: string }> = ({
  icon, title, subtitle, iconBg = 'bg-blue-50', iconColor = 'text-blue-500',
}) => (
  <div className="flex items-start gap-3 mb-5">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
      {icon}
    </div>
    <div>
      <h3 className="text-[16px] font-bold text-gray-900">{title}</h3>
      {subtitle && <p className="text-[12px] text-gray-500 font-medium mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

const Field: React.FC<{
  label: string;
  hint?: string;
  children: React.ReactNode;
  full?: boolean;
}> = ({ label, hint, children, full }) => (
  <div className={`flex flex-col gap-1.5 ${full ? 'col-span-full' : ''}`}>
    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{label}</label>
    {children}
    {hint && <p className="text-[11px] text-gray-400 font-medium">{hint}</p>}
  </div>
);

const inputCls =
  'w-full bg-gray-50 border border-gray-200 rounded-xl h-[42px] px-3.5 text-[13.5px] font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-gray-400 placeholder:font-normal disabled:opacity-60 disabled:cursor-not-allowed';

/* =========================================================
   ZONA DE PERIGO — Cancelar consultoria do paciente (pelo nutri)
========================================================= */
const DangerZone: React.FC<{ consultation: Consultation | null; onChanged: () => void }> = ({ consultation, onChanged }) => {
  const [confirming, setConfirming] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const cancelled = consultation?.status === 'cancelled';

  const handleCancel = async () => {
    if (!consultation) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('consultations')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason.trim() || null,
        })
        .eq('id', consultation.id);
      if (error) throw error;
      setConfirming(false);
      setReason('');
      onChanged();
    } catch (err: any) {
      alert('Erro ao cancelar: ' + (err?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  if (!consultation) return null;

  return (
    <Card className="p-6 border-rose-100">
      <SectionHeader
        icon={<AlertTriangle className="w-5 h-5" strokeWidth={2.5} />}
        title="Zona de perigo"
        subtitle="Ações irreversíveis — atue com cuidado."
        iconBg="bg-rose-50" iconColor="text-rose-500"
      />

      {cancelled ? (
        <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-4 flex items-center gap-3">
          <X className="w-5 h-5 text-rose-500 shrink-0" />
          <div>
            <p className="text-[13px] font-bold text-rose-700">Consultoria cancelada</p>
            <p className="text-[11px] text-rose-600 mt-0.5">em {fmtDate(consultation.cancelled_at)}</p>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-start justify-between gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
            <div>
              <p className="text-[13px] font-bold text-gray-900">Cancelar consultoria deste paciente</p>
              <p className="text-[12px] text-gray-500 mt-1">O paciente perderá acesso ao plano alimentar, check-ins e acompanhamento.</p>
            </div>
            <button
              onClick={() => setConfirming(true)}
              className="shrink-0 px-4 py-2 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-[12px] font-bold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Cancelar
            </button>
          </div>
        </div>
      )}

      {confirming && (
        <div className="fixed inset-0 z-[400] bg-black/50 flex items-center justify-center p-4" onClick={() => !loading && setConfirming(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl w-full max-w-[460px] p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-[16px] font-bold text-gray-900">Cancelar consultoria?</h3>
            </div>
            <p className="text-[13px] text-gray-600 mb-4">
              Tem certeza? O paciente perderá acesso ao plano alimentar, check-ins e ao seu acompanhamento. Esta ação NÃO afeta a assinatura Stripe — cancele lá separadamente se necessário.
            </p>
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Motivo (opcional)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="Ex: paciente atingiu objetivo, não respondia mensagens..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-900 outline-none focus:border-rose-400 resize-none placeholder:font-normal placeholder:text-gray-400"
              />
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setConfirming(false)} disabled={loading} className="px-4 py-2 text-[13px] font-bold text-gray-600 hover:bg-gray-50 rounded-xl">
                Voltar
              </button>
              <button
                onClick={handleCancel} disabled={loading}
                className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white text-[13px] font-bold rounded-xl transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Sim, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

/* =========================================================
   MAIN VIEW
========================================================= */
interface Props {
  patient: any;
  onBack: () => void;
}

export const PatientSettingsView: React.FC<Props> = ({ patient, onBack }) => {
  const userId = patient.user_id || patient.id;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Edits são aplicadas em cópias controladas
  const [draft, setDraft] = useState<Partial<Profile>>({});
  const [consDraft, setConsDraft] = useState<{ next_review_at?: string | null; plan_type?: string | null; notes?: string | null }>({});

  const dirty = useMemo(() => {
    if (!profile) return false;
    const profDirty = Object.keys(draft).some((k) => (draft as any)[k] !== (profile as any)[k]);
    const consDirty = consultation ? Object.keys(consDraft).some((k) => (consDraft as any)[k] !== (consultation as any)[k]) : false;
    return profDirty || consDirty;
  }, [draft, profile, consDraft, consultation]);

  const loadAll = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const [profRes, consRes, emailRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase
          .from('consultations')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        // Email do auth.users (se profiles.email tiver vazio)
        supabase.rpc('get_user_email', { p_user_id: userId }),
      ]);

      if (profRes.error) throw profRes.error;
      if (profRes.data) {
        const raw: any = profRes.data;
        // Pré-popula: se target_* não tem valor, herda do goals (jsonb) salvo no onboarding
        const goals = raw.goals || {};
        const merged: Profile = {
          ...raw,
          email: raw.email || emailRes?.data || null,
          target_calories: raw.target_calories ?? goals.calories ?? null,
          target_protein: raw.target_protein ?? goals.protein ?? null,
          target_water: raw.target_water ?? goals.water ?? null,
        };
        setProfile(merged);
        setDraft({});
      }
      if (consRes.data) {
        setConsultation(consRes.data as Consultation);
        setConsDraft({});
      }
    } catch (err: any) {
      console.error('[PatientSettings] load:', err);
      setError(err?.message || 'Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); /* eslint-disable-next-line */ }, [userId]);

  // Helpers de edição
  const setField = <K extends keyof Profile>(k: K, v: Profile[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
  };
  const getValue = <K extends keyof Profile>(k: K): any => {
    return draft[k] !== undefined ? draft[k] : (profile?.[k] ?? '');
  };
  const setCons = <K extends keyof typeof consDraft>(k: K, v: any) => {
    setConsDraft((d) => ({ ...d, [k]: v }));
  };
  const getCons = <K extends keyof typeof consDraft>(k: K): any => {
    return consDraft[k] !== undefined ? consDraft[k] : ((consultation as any)?.[k] ?? '');
  };

  const handleSave = async () => {
    if (!profile || !dirty || saving) return;
    setSaving(true);
    setError(null);
    try {
      const profileUpdate: any = { ...draft, updated_at: new Date().toISOString() };
      if (Object.keys(draft).length > 0) {
        const { error: pErr } = await supabase.from('profiles').update(profileUpdate).eq('id', userId);
        if (pErr) throw pErr;
      }

      if (consultation && Object.keys(consDraft).length > 0) {
        const consUpdate: any = { ...consDraft, updated_at: new Date().toISOString() };
        if (consUpdate.next_review_at === '') consUpdate.next_review_at = null;
        const { error: cErr } = await supabase.from('consultations').update(consUpdate).eq('id', consultation.id);
        if (cErr) throw cErr;
      }

      setSavedAt(new Date());
      await loadAll();
      setTimeout(() => setSavedAt(null), 2200);
    } catch (err: any) {
      console.error('[PatientSettings] save:', err);
      setError(err?.message || 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  // Computed
  const bmi = useMemo(() => calcBMI(Number(getValue('weight')), Number(getValue('height'))), [draft.weight, draft.height, profile]);
  const bmiInfo = useMemo(() => bmiLabel(bmi), [bmi]);
  const totalProgressPct = useMemo(() => {
    const start = Number(getValue('start_weight'));
    const curr = Number(getValue('weight'));
    const goal = Number(getValue('target_weight'));
    if (!start || !curr || !goal || start === goal) return null;
    const pct = ((start - curr) / (start - goal)) * 100;
    return Math.max(0, Math.min(100, Math.round(pct)));
  }, [draft.start_weight, draft.weight, draft.target_weight, profile]);

  const patientName = (getValue('name') as string) || patient?.profiles?.name || 'Paciente';
  const initials = patientName.substring(0, 2).toUpperCase();

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#F9FAFC] z-[110] flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#F9FAFC] z-[110] overflow-y-auto font-sans">
      <main className="px-4 lg:px-10 py-8 pb-32">
        <div className="max-w-[920px] mx-auto w-full">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <p className="text-[12px] font-semibold text-gray-500">{patientName}</p>
              <h1 className="text-[24px] font-extrabold text-gray-900 tracking-tight">Configurações</h1>
            </div>
          </div>

          {/* Patient identity card */}
          <Card className="p-6 mb-6 flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-blue-500 text-white font-extrabold text-[20px] tracking-wider flex items-center justify-center shrink-0 shadow-sm">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[18px] font-bold text-gray-900 truncate">{patientName}</h2>
              <p className="text-[12px] text-gray-500 font-medium mt-0.5 truncate">{getValue('email') || '—'}</p>
              <div className="flex items-center gap-4 mt-2 text-[11px] font-semibold text-gray-500 flex-wrap">
                <span className="flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  Início: {fmtShort(profile?.created_at)}
                </span>
                {consultation && (
                  <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wide text-[10px] ${
                    consultation.status === 'cancelled' ? 'bg-rose-50 text-rose-600' :
                    consultation.status === 'active' ? 'bg-emerald-50 text-emerald-600' :
                    'bg-amber-50 text-amber-600'
                  }`}>
                    {consultation.status === 'active' ? 'Ativo' :
                     consultation.status === 'cancelled' ? 'Cancelado' :
                     consultation.status === 'anamnese_done' ? 'Anamnese OK' : consultation.status}
                  </span>
                )}
              </div>
            </div>
          </Card>

          {error && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-[13px] font-bold px-4 py-3 rounded-xl flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* IDENTIFICAÇÃO E CONTATO */}
            <Card className="p-6">
              <SectionHeader
                icon={<User className="w-5 h-5" strokeWidth={2.5} />}
                title="Identificação e contato"
                subtitle="Dados pessoais do paciente"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nome completo" full>
                  <input className={inputCls} value={getValue('name') || ''} onChange={(e) => setField('name', e.target.value)} placeholder="Nome do paciente" />
                </Field>
                <Field label="E-mail" hint="Não é editável (vinculado à conta)">
                  <div className="relative">
                    <input className={inputCls + ' pl-10'} value={getValue('email') || ''} disabled />
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </Field>
                <Field label="WhatsApp" hint="Para envio de lembretes e comunicação">
                  <div className="relative">
                    <input
                      className={inputCls + ' pl-10'}
                      value={(getValue('whatsapp') as string) || ''}
                      onChange={(e) => setField('whatsapp', fmtPhone(e.target.value) as any)}
                      placeholder="+55 (11) 99999-9999"
                    />
                    <MessageCircle className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </Field>
                <Field label="Sexo">
                  <select className={inputCls + ' appearance-none cursor-pointer'} value={getValue('gender') || ''} onChange={(e) => setField('gender', e.target.value)}>
                    <option value="">Selecione</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </Field>
                <Field label="Data de nascimento">
                  <input type="date" className={inputCls} value={dateInputValue(getValue('birth_date'))} onChange={(e) => setField('birth_date', e.target.value || null as any)} />
                </Field>
                <Field label="Idade" hint="Pode ser editada manualmente">
                  <div className="relative">
                    <input type="number" className={inputCls + ' pr-12'} value={getValue('age') || ''} onChange={(e) => setField('age', e.target.value ? parseInt(e.target.value) : null as any)} placeholder="0" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400">anos</span>
                  </div>
                </Field>
              </div>
            </Card>

            {/* BIOMETRIA */}
            <Card className="p-6">
              <SectionHeader
                icon={<Scale className="w-5 h-5" strokeWidth={2.5} />}
                title="Biometria"
                subtitle="Peso, altura e progresso"
                iconBg="bg-emerald-50" iconColor="text-emerald-500"
              />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                <Field label="Altura">
                  <div className="relative">
                    <input type="number" className={inputCls + ' pr-10'} value={getValue('height') || ''} onChange={(e) => setField('height', e.target.value ? parseInt(e.target.value) : null as any)} placeholder="0" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400">cm</span>
                  </div>
                </Field>
                <Field label="Peso atual">
                  <div className="relative">
                    <input type="number" step="0.1" className={inputCls + ' pr-10'} value={getValue('weight') || ''} onChange={(e) => setField('weight', e.target.value ? parseFloat(e.target.value) : null as any)} placeholder="0,0" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400">kg</span>
                  </div>
                </Field>
                <Field label="Peso inicial">
                  <div className="relative">
                    <input type="number" step="0.1" className={inputCls + ' pr-10'} value={getValue('start_weight') || ''} onChange={(e) => setField('start_weight', e.target.value ? parseFloat(e.target.value) : null as any)} placeholder="0,0" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400">kg</span>
                  </div>
                </Field>
                <Field label="Meta">
                  <div className="relative">
                    <input type="number" step="0.1" className={inputCls + ' pr-10'} value={getValue('target_weight') || ''} onChange={(e) => setField('target_weight', e.target.value ? parseFloat(e.target.value) : null as any)} placeholder="0,0" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400">kg</span>
                  </div>
                </Field>
              </div>

              {/* Stats de biometria computados */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-5 border-t border-gray-100">
                <div className="bg-gray-50/70 rounded-xl px-4 py-3">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">IMC</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-[20px] font-extrabold text-gray-900 leading-none">{bmi != null ? bmi.toFixed(1).replace('.', ',') : '—'}</span>
                    {bmiInfo && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${bmiInfo.cls}`}>{bmiInfo.txt}</span>}
                  </div>
                </div>
                <div className="bg-gray-50/70 rounded-xl px-4 py-3">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Variação</p>
                  <div className="text-[20px] font-extrabold text-gray-900 leading-none mt-1">
                    {(() => {
                      const start = Number(getValue('start_weight'));
                      const curr = Number(getValue('weight'));
                      if (!start || !curr) return '—';
                      const delta = curr - start;
                      return `${delta > 0 ? '+' : ''}${delta.toFixed(1).replace('.', ',')} kg`;
                    })()}
                  </div>
                </div>
                <div className="bg-gray-50/70 rounded-xl px-4 py-3 col-span-2 sm:col-span-1">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Progresso da meta</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[20px] font-extrabold text-gray-900 leading-none">{totalProgressPct != null ? `${totalProgressPct}%` : '—'}</span>
                    {totalProgressPct != null && (
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${totalProgressPct}%` }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* METAS NUTRICIONAIS */}
            <Card className="p-6">
              <SectionHeader
                icon={<Target className="w-5 h-5" strokeWidth={2.5} />}
                title="Metas nutricionais"
                subtitle="Calorias, proteína e água diários"
                iconBg="bg-purple-50" iconColor="text-purple-500"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Calorias" hint="Meta diária">
                  <div className="relative">
                    <input type="number" className={inputCls + ' pr-12'} value={getValue('target_calories') || ''} onChange={(e) => setField('target_calories', e.target.value ? parseFloat(e.target.value) : null as any)} placeholder="0" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400">kcal</span>
                  </div>
                </Field>
                <Field label="Proteína" hint="Meta diária">
                  <div className="relative">
                    <input type="number" className={inputCls + ' pr-10'} value={getValue('target_protein') || ''} onChange={(e) => setField('target_protein', e.target.value ? parseFloat(e.target.value) : null as any)} placeholder="0" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400">g</span>
                  </div>
                </Field>
                <Field label="Água" hint="Meta diária">
                  <div className="relative">
                    <input type="number" step="0.1" className={inputCls + ' pr-10'} value={getValue('target_water') || ''} onChange={(e) => setField('target_water', e.target.value ? parseFloat(e.target.value) : null as any)} placeholder="0" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400">L</span>
                  </div>
                </Field>
                <Field label="Nível de atividade" full>
                  <select className={inputCls + ' appearance-none cursor-pointer'} value={getValue('activity_level') || ''} onChange={(e) => setField('activity_level', e.target.value)}>
                    <option value="">Selecione</option>
                    {ACTIVITY_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </Field>
                <Field label="Objetivo" hint="Ex: emagrecer, ganho de massa, manutenção">
                  <input className={inputCls} value={getValue('goal') || ''} onChange={(e) => setField('goal', e.target.value)} placeholder="—" />
                </Field>
                <Field label="Ritmo (kg / semana)" hint="Velocidade desejada">
                  <input type="number" step="0.1" className={inputCls} value={getValue('pace') || ''} onChange={(e) => setField('pace', e.target.value ? parseFloat(e.target.value) : null as any)} placeholder="0,0" />
                </Field>
              </div>
            </Card>

            {/* CONSULTORIA */}
            {consultation && (
              <Card className="p-6">
                <SectionHeader
                  icon={<CalendarIcon className="w-5 h-5" strokeWidth={2.5} />}
                  title="Consultoria"
                  subtitle="Detalhes do acompanhamento"
                  iconBg="bg-amber-50" iconColor="text-amber-500"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <Field label="Início" hint="Data de cadastro do paciente">
                    <div className="relative">
                      <input className={inputCls + ' pl-10'} value={fmtShort(profile?.created_at)} disabled />
                      <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </Field>
                  <Field label="Próximo retorno">
                    <input
                      type="datetime-local"
                      className={inputCls}
                      value={(() => {
                        const v = getCons('next_review_at');
                        if (!v) return '';
                        try { return new Date(v).toISOString().slice(0, 16); } catch { return ''; }
                      })()}
                      onChange={(e) => setCons('next_review_at', e.target.value ? new Date(e.target.value).toISOString() : null)}
                    />
                  </Field>
                  <Field label="Plano">
                    <select className={inputCls + ' appearance-none cursor-pointer'} value={getCons('plan_type') || ''} onChange={(e) => setCons('plan_type', e.target.value || null)}>
                      <option value="">Selecione</option>
                      <option value="mensal">Mensal</option>
                      <option value="trimestral">Trimestral</option>
                      <option value="semestral">Semestral</option>
                      <option value="anual">Anual</option>
                    </select>
                  </Field>
                  <Field label="Status atual" hint="Atualizado automaticamente">
                    <input className={inputCls} value={consultation.status} disabled />
                  </Field>
                  <Field label="Observações internas" full hint="Visível só pra você">
                    <textarea
                      rows={3}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all resize-none placeholder:text-gray-400 placeholder:font-normal"
                      value={getCons('notes') || ''}
                      onChange={(e) => setCons('notes', e.target.value)}
                      placeholder="Ex: histórico clínico, observações importantes..."
                    />
                  </Field>
                </div>

                {/* Mini timeline */}
                <div className="border-t border-gray-100 pt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-gray-50/70 rounded-xl px-4 py-3">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Cadastrado</p>
                    <p className="text-[13px] font-bold text-gray-900 mt-1">{fmtShort(profile?.created_at)}</p>
                  </div>
                  <div className="bg-gray-50/70 rounded-xl px-4 py-3">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Iniciou consultoria</p>
                    <p className="text-[13px] font-bold text-gray-900 mt-1">{fmtShort(consultation.started_at) || fmtShort(consultation.created_at)}</p>
                  </div>
                  <div className="bg-gray-50/70 rounded-xl px-4 py-3">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Próximo retorno</p>
                    <p className="text-[13px] font-bold text-gray-900 mt-1">{fmtShort(getCons('next_review_at'))}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* ZONA DE PERIGO */}
            <DangerZone consultation={consultation} onChanged={loadAll} />
          </div>
        </div>
      </main>

      {/* Save bar (sticky bottom) */}
      <div className={`fixed bottom-0 left-0 right-0 z-[150] transition-transform duration-300 ${dirty || savedAt ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="max-w-[920px] mx-auto px-4 lg:px-10 pb-4">
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                savedAt ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'
              }`}>
                {savedAt ? <Check className="w-4 h-4" strokeWidth={3} /> : <Edit3 className="w-4 h-4" strokeWidth={2.5} />}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-gray-900 truncate">
                  {savedAt ? 'Alterações salvas' : 'Você tem alterações não salvas'}
                </p>
                <p className="text-[11px] text-gray-500 font-medium truncate">
                  {savedAt ? `às ${savedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : 'Clique em salvar para confirmar'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => { setDraft({}); setConsDraft({}); }}
                disabled={saving || !dirty}
                className="px-4 py-2 text-[12px] font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Descartar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !dirty}
                className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white text-[12px] font-bold rounded-xl shadow-[0_4px_14px_rgba(59,130,246,0.30)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" strokeWidth={2.5} />}
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
